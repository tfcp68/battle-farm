import { type DataPayload, joinRoom, type Room, selfId } from 'trystero';
import type { MessageListener, PeerListener, RoomMessage, RoomTransport } from './RoomTransport';

/** All room traffic rides one Trystero action; the envelope carries the real type. */
const ACTION = 'bf';

export interface TrysteroRoomTransportOpts {
	appId: string;
	iceServers?: RTCIceServer[];
	/** Overrides Trystero's default Nostr relays — useful when one of them is down. */
	relayUrls?: string[];
}

function isRoomMessage(value: unknown): value is RoomMessage {
	if (typeof value !== 'object' || value === null) return false;
	const v = value as Record<string, unknown>;
	return v.v === 1 && typeof v.type === 'string';
}

/**
 * {@link RoomTransport} over Trystero — signalling rides public Nostr relays, so
 * the game has no server of its own.
 *
 * As of Trystero 0.25 the base package *is* the Nostr strategy; `trystero/torrent`
 * and `trystero/mqtt` are stubs that throw and point at separate `@trystero-p2p/*`
 * packages. Another relay network means installing one and branching here.
 *
 * `onPeerJoin`/`onPeerLeave` are single assignable slots upstream; this class
 * owns them and fans out, since several parts of the room logic need the event.
 */
export class TrysteroRoomTransport implements RoomTransport {
	readonly selfId = selfId;

	readonly #opts: TrysteroRoomTransportOpts;
	readonly #messageListeners = new Set<MessageListener>();
	readonly #joinListeners = new Set<PeerListener>();
	readonly #leaveListeners = new Set<PeerListener>();

	#room: Room | null = null;
	#send: ((data: DataPayload, options?: { target?: string }) => Promise<void>) | null = null;
	#peers: string[] = [];

	constructor(opts: TrysteroRoomTransportOpts) {
		this.#opts = opts;
	}

	get peers(): readonly string[] {
		return this.#peers;
	}

	async join(code: string): Promise<void> {
		await this.leave();

		const room = joinRoom(
			{
				appId: this.#opts.appId,
				...(this.#opts.iceServers?.length
					? { rtcConfig: { iceServers: this.#opts.iceServers } }
					: {}),
				...(this.#opts.relayUrls?.length
					? { relayConfig: { urls: this.#opts.relayUrls } }
					: {}),
			},
			code,
		);
		this.#room = room;

		// Trystero types payloads as plain JSON; the envelope is validated on
		// arrival instead, so the casts stay confined to this boundary.
		const action = room.makeAction(ACTION);
		this.#send = action.send;
		action.onMessage = (data: unknown, context) => {
			if (!isRoomMessage(data)) return;
			for (const listener of this.#messageListeners) listener(data, context.peerId);
		};

		room.onPeerJoin = (peerId) => {
			if (!this.#peers.includes(peerId)) this.#peers = [...this.#peers, peerId];
			for (const listener of this.#joinListeners) listener(peerId);
		};
		room.onPeerLeave = (peerId) => {
			this.#peers = this.#peers.filter((id) => id !== peerId);
			for (const listener of this.#leaveListeners) listener(peerId);
		};
	}

	async leave(): Promise<void> {
		const room = this.#room;
		this.#room = null;
		this.#send = null;
		this.#peers = [];
		if (room) await room.leave();
	}

	send(type: string, payload: unknown, peerId?: string): void {
		const send = this.#send;
		if (!send) return;
		const message: RoomMessage = { v: 1, type, payload };
		// Fire-and-forget: a failed send means the peer is gone, which onPeerLeave
		// already reports. Surfacing it here would duplicate that path.
		void send(message as unknown as DataPayload, peerId ? { target: peerId } : undefined).catch(
			() => {},
		);
	}

	onMessage(listener: MessageListener): () => void {
		this.#messageListeners.add(listener);
		return () => this.#messageListeners.delete(listener);
	}

	onPeerJoin(listener: PeerListener): () => void {
		this.#joinListeners.add(listener);
		return () => this.#joinListeners.delete(listener);
	}

	onPeerLeave(listener: PeerListener): () => void {
		this.#leaveListeners.add(listener);
		return () => this.#leaveListeners.delete(listener);
	}
}
