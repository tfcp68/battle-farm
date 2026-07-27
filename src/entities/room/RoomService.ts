import type { RoomTransport } from '~/shared/net/RoomTransport';
import { generateRoomCode, normalizeRoomCode } from '~/shared/net/RoomTransport';
import { HostRoom } from './HostRoom';
import { GuestRoom } from './GuestRoom';
import { DEFAULT_MAX_PLAYERS, type RoomState } from './types';

export class RoomConnectTimeoutError extends Error {
	constructor(code: string) {
		super(`No response from room ${code}`);
		this.name = 'RoomConnectTimeoutError';
	}
}

type StateListener = (state: RoomState | null) => void;
type RequestResultListener = (approved: boolean) => void;

export interface RoomServiceOpts {
	createTransport: () => RoomTransport;
	/** How long a guest waits for the host's first snapshot before giving up. */
	connectTimeoutMs?: number;
}

const DEFAULT_CONNECT_TIMEOUT_MS = 10_000;
/**
 * Teardown talks to the relays — exactly what is broken when a connection is
 * being abandoned — so it gets its own cap. A socket that will not close must
 * never block the app.
 */
const TEARDOWN_TIMEOUT_MS = 2_000;

function withTimeout(promise: Promise<void>, ms: number): Promise<void> {
	return new Promise<void>((resolve) => {
		const timer = setTimeout(resolve, ms);
		promise
			.catch(() => {})
			.finally(() => {
				clearTimeout(timer);
				resolve();
			});
	});
}

/**
 * The app's single entry point into "the room I am currently in" — owns the
 * transport lifecycle and whichever half of the room applies to this player.
 *
 * "This code does not exist" is indistinguishable from "the host is slow":
 * nothing answers for a room nobody hosts. A guest waits for a snapshot and
 * gives up on a timer.
 */
export class RoomService {
	readonly #createTransport: () => RoomTransport;
	readonly #connectTimeoutMs: number;
	readonly #stateListeners = new Set<StateListener>();
	readonly #requestResultListeners = new Set<RequestResultListener>();

	#transport: RoomTransport | null = null;
	#host: HostRoom | null = null;
	#guest: GuestRoom | null = null;
	#unsubscribeRoom: (() => void) | null = null;

	constructor(opts: RoomServiceOpts) {
		this.#createTransport = opts.createTransport;
		this.#connectTimeoutMs = opts.connectTimeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS;
	}

	get code(): string | null {
		return this.#host?.code ?? this.#guest?.code ?? null;
	}

	get isHost(): boolean {
		return !!this.#host;
	}

	getState(): RoomState | null {
		return this.#host?.getState() ?? this.#guest?.getState() ?? null;
	}

	subscribe(listener: StateListener): () => void {
		this.#stateListeners.add(listener);
		return () => this.#stateListeners.delete(listener);
	}

	onRequestResult(listener: RequestResultListener): () => void {
		this.#requestResultListeners.add(listener);
		return () => this.#requestResultListeners.delete(listener);
	}

	/** Opens a new room and returns its code. The host is a member from the start. */
	async host(opts: {
		playerId: string;
		nickname: string;
		maxPlayers?: number;
		code?: string;
	}): Promise<RoomState> {
		await this.leave();

		const code = opts.code ? normalizeRoomCode(opts.code) : generateRoomCode();
		const transport = this.#createTransport();
		this.#transport = transport;
		await transport.join(code);

		const room = new HostRoom({
			transport,
			code,
			hostPlayerId: opts.playerId,
			hostNickname: opts.nickname,
			maxPlayers: opts.maxPlayers ?? DEFAULT_MAX_PLAYERS,
		});
		this.#host = room;
		this.#unsubscribeRoom = room.subscribe((state) => this.#emitState(state));
		this.#emitState(room.getState());
		return room.getState();
	}

	/**
	 * Connects to an existing room. Resolves once the host's first snapshot
	 * arrives — that is the only proof the room exists.
	 */
	async join(opts: { code: string; playerId: string; nickname: string }): Promise<RoomState> {
		await this.leave();

		const code = normalizeRoomCode(opts.code);
		const transport = this.#createTransport();
		this.#transport = transport;
		await transport.join(code);

		const room = new GuestRoom({
			transport,
			code,
			playerId: opts.playerId,
			nickname: opts.nickname,
		});
		this.#guest = room;
		this.#unsubscribeRoom = room.subscribe((state) => this.#emitState(state));
		room.onRequestResult((approved) => {
			for (const listener of this.#requestResultListeners) listener(approved);
		});

		const connected = this.#waitForSnapshot(room, code);
		room.start();

		try {
			return await connected;
		} catch (error) {
			// Report the failure now; cleaning up a transport that never answered
			// must not delay (or swallow) the error the caller is waiting for.
			void this.leave();
			throw error;
		}
	}

	/** Guest-side: ask the host to let us in. Result arrives via {@link onRequestResult}. */
	requestJoin(): void {
		this.#guest?.requestJoin();
	}

	setReady(playerId: string, isReady: boolean): void {
		if (this.#host) this.#host.setReady(playerId, isReady);
		else this.#guest?.setReady(isReady);
	}

	approve(playerId: string): void {
		this.#host?.approve(playerId);
	}

	reject(playerId: string): void {
		this.#host?.reject(playerId);
	}

	removePlayer(playerId: string): void {
		this.#host?.removePlayer(playerId);
	}

	setLocked(locked: boolean): void {
		this.#host?.setLocked(locked);
	}

	async leave(): Promise<void> {
		this.#unsubscribeRoom?.();
		this.#unsubscribeRoom = null;

		const host = this.#host;
		const guest = this.#guest;
		this.#host = null;
		this.#guest = null;

		if (host) await withTimeout(host.close(), TEARDOWN_TIMEOUT_MS);
		if (guest) await withTimeout(guest.close(), TEARDOWN_TIMEOUT_MS);

		const transport = this.#transport;
		this.#transport = null;
		if (transport && !host && !guest) await withTimeout(transport.leave(), TEARDOWN_TIMEOUT_MS);

		this.#emitState(null);
	}

	#waitForSnapshot(room: GuestRoom, code: string): Promise<RoomState> {
		return new Promise<RoomState>((resolve, reject) => {
			const timer = setTimeout(() => {
				unsubscribe();
				reject(new RoomConnectTimeoutError(code));
			}, this.#connectTimeoutMs);

			const unsubscribe = room.subscribe((state) => {
				if (!state) return;
				clearTimeout(timer);
				unsubscribe();
				resolve(state);
			});
		});
	}

	#emitState(state: RoomState | null): void {
		for (const listener of this.#stateListeners) listener(state);
	}
}
