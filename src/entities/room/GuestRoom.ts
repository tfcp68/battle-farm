import type { RoomMessage, RoomTransport } from '~/shared/net/RoomTransport';
import { type RequestResultPayload, RoomMessageType, type RoomState, type SnapshotPayload } from './types';

export interface GuestRoomOpts {
	transport: RoomTransport;
	code: string;
	playerId: string;
	nickname: string;
}

type StateListener = (state: RoomState | null) => void;
type RequestResultListener = (approved: boolean) => void;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isRoomState(value: unknown): value is RoomState {
	if (!isRecord(value)) return false;
	return (
		typeof value.version === 'number' &&
		typeof value.code === 'string' &&
		typeof value.hostPlayerId === 'string' &&
		Array.isArray(value.players) &&
		Array.isArray(value.requests)
	);
}

/**
 * Non-authoritative half of a room: holds the last snapshot the host sent and
 * nothing else. Local actions are requests, not mutations, so the UI never shows
 * a state the host hasn't confirmed.
 */
export class GuestRoom {
	readonly isHost = false;
	readonly code: string;
	readonly playerId: string;

	readonly #transport: RoomTransport;
	readonly #nickname: string;
	readonly #stateListeners = new Set<StateListener>();
	readonly #requestResultListeners = new Set<RequestResultListener>();
	readonly #unsubscribes: Array<() => void> = [];

	#state: RoomState | null = null;

	constructor(opts: GuestRoomOpts) {
		this.#transport = opts.transport;
		this.code = opts.code;
		this.playerId = opts.playerId;
		this.#nickname = opts.nickname;

		this.#unsubscribes.push(
			this.#transport.onMessage((message, peerId) => this.#onMessage(message, peerId)),

			// The host may already be in the room, or may arrive after us — say hello
			// on every peer that appears and let the host ignore duplicates.
			this.#transport.onPeerJoin(() => this.#sendHello()),
			this.#transport.onPeerLeave((peerId) => this.#onPeerLeave(peerId))
		);
	}

	getState(): RoomState | null {
		return this.#state;
	}

	subscribe(listener: StateListener): () => void {
		this.#stateListeners.add(listener);
		return () => this.#stateListeners.delete(listener);
	}

	onRequestResult(listener: RequestResultListener): () => void {
		this.#requestResultListeners.add(listener);
		return () => this.#requestResultListeners.delete(listener);
	}

	/** Announce ourselves — call once the transport has joined the room. */
	start(): void {
		this.#sendHello();
	}

	requestJoin(): void {
		this.#sendHello();
		this.#transport.send(RoomMessageType.joinRequest, { playerId: this.playerId });
	}

	setReady(isReady: boolean): void {
		this.#transport.send(RoomMessageType.setReady, { playerId: this.playerId, isReady });
	}

	async close(): Promise<void> {
		this.#transport.send(RoomMessageType.leave, { playerId: this.playerId });
		for (const unsubscribe of this.#unsubscribes) unsubscribe();
		this.#unsubscribes.length = 0;
		this.#stateListeners.clear();
		this.#requestResultListeners.clear();
		await this.#transport.leave();
	}

	#sendHello(): void {
		this.#transport.send(RoomMessageType.hello, {
			playerId: this.playerId,
			nickname: this.#nickname,
		});
	}

	/** Anything not listed here is ignored. */
	readonly #handlers: Record<string, (payload: unknown, peerId: string) => void> = {
		[RoomMessageType.snapshot]: (payload, peerId) => {
			const state = (payload as SnapshotPayload | undefined)?.state;
			if (!isRoomState(state)) return;
			// Relays deliver out of order; an older snapshot would undo newer news.
			if (this.#state && state.version <= this.#state.version) return;
			this.#hostPeerId = peerId;
			this.#state = state;
			this.#emitState();
		},

		[RoomMessageType.requestResult]: (payload) => {
			const result = payload as RequestResultPayload | undefined;
			if (!result || result.playerId !== this.playerId) return;
			for (const listener of this.#requestResultListeners) listener(!!result.approved);
		},
	};

	#onMessage(message: RoomMessage, peerId: string): void {
		this.#handlers[message.type]?.(message.payload, peerId);
	}

	#hostPeerId: string | null = null;

	/** Losing the host means the room is gone — there is no migration. */
	#onPeerLeave(peerId: string): void {
		if (peerId !== this.#hostPeerId) return;
		this.#hostPeerId = null;
		this.#state = null;
		this.#emitState();
	}

	#emitState(): void {
		for (const listener of this.#stateListeners) listener(this.#state);
	}
}
