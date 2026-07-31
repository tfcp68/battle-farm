import type { RoomMessage, RoomTransport } from '~/shared/net/RoomTransport';
import {
	DEFAULT_MAX_PLAYERS,
	emptyRoomState,
	type HelloPayload,
	type JoinRequestPayload,
	type LeavePayload,
	RoomMessageType,
	type RoomState,
	type SetReadyPayload,
} from './types';

export interface HostRoomOpts {
	transport: RoomTransport;
	code: string;
	hostPlayerId: string;
	hostNickname: string;
	maxPlayers?: number;
}

type StateListener = (state: RoomState) => void;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

/**
 * Authoritative half of a room. The host holds the only real {@link RoomState};
 * guests hold copies. Every mutation bumps `version` and broadcasts a snapshot,
 * so a guest that misses a message converges on the next one — no replay log.
 *
 * Guests are trusted to say who they are: there is no server to verify against,
 * and among friends impersonation isn't the threat. The host does enforce
 * capacity, lock status, and that a peer only acts for the player it claimed.
 */
export class HostRoom {
	readonly isHost = true;
	readonly code: string;

	readonly #transport: RoomTransport;
	readonly #listeners = new Set<StateListener>();
	readonly #unsubscribes: Array<() => void> = [];
	/** peerId → playerId, learned from `hello`. Lets peer-leave find the player. */
	readonly #peerToPlayer = new Map<string, string>();
	readonly #playerToPeer = new Map<string, string>();
	/** playerId → nickname as announced in `hello`, before the player is admitted. */
	readonly #announcedNicknames = new Map<string, string>();

	#state: RoomState;

	constructor(opts: HostRoomOpts) {
		this.#transport = opts.transport;
		this.code = opts.code;
		this.#state = {
			...emptyRoomState(opts.code, opts.hostPlayerId, opts.maxPlayers ?? DEFAULT_MAX_PLAYERS),
			players: [
				{
					playerId: opts.hostPlayerId,
					nickname: opts.hostNickname,
					isHost: true,
					isReady: false,
				},
			],
		};

		this.#unsubscribes.push(
			this.#transport.onMessage((message, peerId) => this.#onMessage(message, peerId)),
			this.#transport.onPeerLeave((peerId) => this.#onPeerLeave(peerId)),
		);
	}

	getState(): RoomState {
		return this.#state;
	}

	subscribe(listener: StateListener): () => void {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	/** Admit a pending requester. No-op when the room is full — the request is rejected instead. */
	approve(playerId: string): void {
		const request = this.#state.requests.find((r) => r.playerId === playerId);
		if (!request) return;

		const requests = this.#state.requests.filter((r) => r.playerId !== playerId);

		if (this.#state.players.length >= this.#state.maxPlayers || this.#state.status === 'locked') {
			this.#commit({ requests });
			this.#sendRequestResult(playerId, false);
			return;
		}

		const players = [
			...this.#state.players,
			{
				playerId,
				nickname: this.#uniqueNickname(request.nickname, playerId),
				isHost: false,
				isReady: false,
			},
		];
		this.#commit({ players, requests });
		this.#sendRequestResult(playerId, true);
	}

	reject(playerId: string): void {
		if (!this.#state.requests.some((r) => r.playerId === playerId)) return;
		this.#commit({ requests: this.#state.requests.filter((r) => r.playerId !== playerId) });
		this.#sendRequestResult(playerId, false);
	}

	setReady(playerId: string, isReady: boolean): void {
		this.#applyReady(playerId, isReady);
	}

	/** Stop accepting new players without closing the room. */
	setLocked(locked: boolean): void {
		this.#commit({ status: locked ? 'locked' : 'open' });
	}

	removePlayer(playerId: string): void {
		if (playerId === this.#state.hostPlayerId) return;
		this.#commit({
			players: this.#state.players.filter((p) => p.playerId !== playerId),
			requests: this.#state.requests.filter((r) => r.playerId !== playerId),
		});
	}

	async close(): Promise<void> {
		for (const unsubscribe of this.#unsubscribes) unsubscribe();
		this.#unsubscribes.length = 0;
		this.#listeners.clear();
		await this.#transport.leave();
	}

	/** Guests may send anything, so each handler validates its own payload. */
	readonly #handlers: Record<string, (payload: Record<string, unknown>, peerId: string) => void> = {
		[RoomMessageType.hello]: (payload, peerId) => {
			const { playerId, nickname } = payload as unknown as HelloPayload;
			if (typeof playerId !== 'string' || typeof nickname !== 'string') return;
			this.#mapPeer(peerId, playerId);
			this.#announcedNicknames.set(playerId, nickname);
			// A known player reconnecting (same id, new peer) gets the current
			// snapshot straight away; an unknown one waits for its join request.
			this.#sendSnapshot(peerId);
		},

		[RoomMessageType.joinRequest]: (payload, peerId) => {
			const { playerId } = payload as unknown as JoinRequestPayload;
			if (!this.#ownsPlayer(peerId, playerId)) return;
			this.#addRequest(peerId, playerId);
		},

		[RoomMessageType.setReady]: (payload, peerId) => {
			const { playerId, isReady } = payload as unknown as SetReadyPayload;
			if (!this.#ownsPlayer(peerId, playerId)) return;
			this.#applyReady(playerId, !!isReady);
		},

		[RoomMessageType.leave]: (payload, peerId) => {
			const { playerId } = payload as unknown as LeavePayload;
			if (!this.#ownsPlayer(peerId, playerId)) return;
			this.removePlayer(playerId);
		},
	};

	/** A peer may only act for the player it introduced itself as. */
	#ownsPlayer(peerId: string, playerId: unknown): playerId is string {
		return typeof playerId === 'string' && this.#peerToPlayer.get(peerId) === playerId;
	}

	#onMessage(message: RoomMessage, peerId: string): void {
		if (!isRecord(message.payload)) return;
		this.#handlers[message.type]?.(message.payload, peerId);
	}

	#onPeerLeave(peerId: string): void {
		const playerId = this.#peerToPlayer.get(peerId);
		this.#peerToPlayer.delete(peerId);
		if (!playerId) return;
		// Only forget the mapping if this peer is still the player's current one —
		// a reconnect remaps the player before the old peer's leave arrives.
		if (this.#playerToPeer.get(playerId) === peerId) {
			this.#playerToPeer.delete(playerId);
			this.removePlayer(playerId);
		}
	}

	#mapPeer(peerId: string, playerId: string): void {
		const previousPeer = this.#playerToPeer.get(playerId);
		if (previousPeer && previousPeer !== peerId) this.#peerToPlayer.delete(previousPeer);
		this.#peerToPlayer.set(peerId, playerId);
		this.#playerToPeer.set(playerId, peerId);
	}

	#addRequest(peerId: string, playerId: string): void {
		if (this.#state.players.some((p) => p.playerId === playerId)) {
			// Already in — resend the snapshot so the guest stops waiting.
			this.#sendRequestResult(playerId, true);
			this.#sendSnapshot(peerId);
			return;
		}
		if (this.#state.requests.some((r) => r.playerId === playerId)) return;

		const nickname = this.#nicknameOfPeer(peerId) ?? 'Player';
		this.#commit({ requests: [...this.#state.requests, { playerId, nickname }] });
	}

	#applyReady(playerId: string, isReady: boolean): void {
		if (!this.#state.players.some((p) => p.playerId === playerId)) return;
		this.#commit({
			players: this.#state.players.map((p) => (p.playerId === playerId ? { ...p, isReady } : p)),
		});
	}

	/** Nicknames are display-only, but two identical ones in a lobby are unreadable. */
	#uniqueNickname(nickname: string, playerId: string): string {
		const taken = new Set(
			this.#state.players.filter((p) => p.playerId !== playerId).map((p) => p.nickname),
		);
		if (!taken.has(nickname)) return nickname;
		let suffix = 2;
		while (taken.has(`${nickname} (${suffix})`)) suffix += 1;
		return `${nickname} (${suffix})`;
	}

	#nicknameOfPeer(peerId: string): string | null {
		const playerId = this.#peerToPlayer.get(peerId);
		if (!playerId) return null;
		return this.#announcedNicknames.get(playerId) ?? null;
	}

	#commit(patch: Partial<RoomState>): void {
		this.#state = { ...this.#state, ...patch, version: this.#state.version + 1 };
		this.#broadcastSnapshot();
		for (const listener of this.#listeners) listener(this.#state);
	}

	#broadcastSnapshot(): void {
		this.#transport.send(RoomMessageType.snapshot, { state: this.#state });
	}

	#sendSnapshot(peerId: string): void {
		this.#transport.send(RoomMessageType.snapshot, { state: this.#state }, peerId);
	}

	#sendRequestResult(playerId: string, approved: boolean): void {
		const peerId = this.#playerToPeer.get(playerId);
		this.#transport.send(RoomMessageType.requestResult, { playerId, approved }, peerId);
	}
}
