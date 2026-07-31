import type { MessageListener, PeerListener, RoomMessage, RoomTransport } from './RoomTransport';

/**
 * In-memory stand-in for the signalling network. Transports from one hub find
 * each other by room code, so room logic runs with several "peers" in a single
 * process — no WebRTC, no relays, no timers.
 */
export class FakeSignalHub {
	readonly #rooms = new Map<string, Set<FakeRoomTransport>>();
	#nextId = 0;

	createTransport(): FakeRoomTransport {
		this.#nextId += 1;
		return new FakeRoomTransport(this, `peer-${this.#nextId}`);
	}

	/** @internal */
	attach(code: string, transport: FakeRoomTransport): FakeRoomTransport[] {
		const members = this.#rooms.get(code) ?? new Set<FakeRoomTransport>();
		const existing = [...members];
		members.add(transport);
		this.#rooms.set(code, members);
		return existing;
	}

	/** @internal */
	detach(code: string, transport: FakeRoomTransport): FakeRoomTransport[] {
		const members = this.#rooms.get(code);
		if (!members) return [];
		members.delete(transport);
		return [...members];
	}

	/** @internal */
	membersOf(code: string): FakeRoomTransport[] {
		return [...(this.#rooms.get(code) ?? [])];
	}
}

export class FakeRoomTransport implements RoomTransport {
	readonly selfId: string;
	readonly #hub: FakeSignalHub;
	readonly #messageListeners = new Set<MessageListener>();
	readonly #joinListeners = new Set<PeerListener>();
	readonly #leaveListeners = new Set<PeerListener>();

	#code: string | null = null;
	#peers: string[] = [];

	constructor(hub: FakeSignalHub, selfId: string) {
		this.#hub = hub;
		this.selfId = selfId;
	}

	get peers(): readonly string[] {
		return this.#peers;
	}

	async join(code: string): Promise<void> {
		await this.leave();
		this.#code = code;

		const existing = this.#hub.attach(code, this);
		this.#peers = existing.map((t) => t.selfId);
		for (const peer of existing) {
			peer.receivePeerJoin(this.selfId);
			this.receivePeerJoin(peer.selfId);
		}
	}

	async leave(): Promise<void> {
		const code = this.#code;
		if (!code) return;
		this.#code = null;
		const remaining = this.#hub.detach(code, this);
		this.#peers = [];
		for (const peer of remaining) peer.receivePeerLeave(this.selfId);
	}

	send(type: string, payload: unknown, peerId?: string): void {
		if (!this.#code) return;
		const message: RoomMessage = { v: 1, type, payload };
		const targets = this.#hub
			.membersOf(this.#code)
			.filter((t) => t !== this && (!peerId || t.selfId === peerId));
		// Clone like a real transport would, so a test can't pass by reference and
		// hide a serialisation bug.
		for (const target of targets) {
			target.receiveMessage({ ...message, payload: clone(payload) }, this.selfId);
		}
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

	/** @internal */
	receiveMessage(message: RoomMessage, from: string): void {
		for (const listener of this.#messageListeners) listener(message, from);
	}

	/** @internal */
	receivePeerJoin(peerId: string): void {
		if (!this.#peers.includes(peerId)) this.#peers = [...this.#peers, peerId];
		for (const listener of this.#joinListeners) listener(peerId);
	}

	/** @internal */
	receivePeerLeave(peerId: string): void {
		this.#peers = this.#peers.filter((id) => id !== peerId);
		for (const listener of this.#leaveListeners) listener(peerId);
	}
}

function clone<T>(value: T): T {
	return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}
