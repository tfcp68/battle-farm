import { type GameModel, parseGameModel } from '~/entities/game';
import type { RoomMessage, RoomTransport } from '~/shared/net/RoomTransport';
import {
	INTENT_SENDER,
	type MatchEventMessage,
	type MatchEventName,
	type MatchIntentEvent,
	MatchMessageType,
	parseMatchEvent,
	parseMatchIntent,
	parseMatchState,
	parseMatchSync,
} from './matchProtocol';

/**
 * The match half of a room connection: the piece that turns "peers exchanging
 * packets" into "one ordered event stream every peer replays".
 *
 * Both halves share {@link MatchChannel} so the app never branches on host-ness
 * to submit a move — `submit()` means "I want this to happen" everywhere, and
 * only the host's copy is allowed to answer.
 */
export interface MatchChannel {
	/** Ask for a move. On the host this is decided now; on a guest it is a request. */
	submit(name: MatchIntentEvent, meta: unknown): void;
	close(): void;
}

/**
 * An open channel, tagged with which half it is. Only the host's half can
 * originate engine events, so the tag is what the caller checks — not a boolean
 * that would let `emit` be reachable on the wrong object.
 */
export type OpenMatchChannel =
	| { role: 'host'; channel: HostMatchChannel }
	| { role: 'guest'; channel: GuestMatchChannel };

/** Applies one accepted event locally — in production, a dispatch into the CoreLoop bus. */
export type ApplyMatchEvent = (name: MatchEventName, meta: unknown) => void;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export interface HostMatchChannelOpts {
	transport: RoomTransport;
	/** The host's own player — its moves go through the same gate a guest's do. */
	playerId: string;
	apply: ApplyMatchEvent;
	/** peerId → playerId as the lobby learned it from `hello`. */
	playerOfPeer: (peerId: string) => string | null;
	/** The live match model, read for intent validation and for `match_state`. */
	getModel: () => GameModel | null;
}

/**
 * The sequencer. Every event that reaches anyone's model passed through here
 * first: the host applies it locally, stamps it with the next `seq` and
 * broadcasts it. There is no other way into the stream.
 *
 * The log is kept whole for the match's life — a few hundred small objects — so
 * a peer that missed something is answered by replay rather than by a snapshot.
 * That is the deterministic-simulation design paying off: event 1 is
 * `match_created {seed, seats}`, so replaying from zero rebuilds the match
 * exactly, and no state ever has to travel.
 */
export class HostMatchChannel implements MatchChannel {
	readonly #transport: RoomTransport;
	readonly #playerId: string;
	readonly #apply: ApplyMatchEvent;
	readonly #playerOfPeer: (peerId: string) => string | null;
	readonly #getModel: () => GameModel | null;
	readonly #unsubscribes: Array<() => void> = [];
	readonly #log: MatchEventMessage[] = [];

	#seq = 0;

	constructor(opts: HostMatchChannelOpts) {
		this.#transport = opts.transport;
		this.#playerId = opts.playerId;
		this.#apply = opts.apply;
		this.#playerOfPeer = opts.playerOfPeer;
		this.#getModel = opts.getModel;

		this.#unsubscribes.push(this.#transport.onMessage((message, peerId) => this.#onMessage(message, peerId)));
	}

	/** Seq of the last accepted event. Zero before the match starts. */
	get seq(): number {
		return this.#seq;
	}

	/**
	 * Puts an event into the canonical stream. Engine events (`turn_started`,
	 * `match_ended`, …) come from the driver and go straight here; player intents
	 * arrive through {@link submit} or off the wire and are gated first.
	 *
	 * Numbering and sending before applying is what makes this safe to re-enter:
	 * applying an event is what makes the driver decide the next one, and if the
	 * follow-up were numbered first it would land ahead of its own cause.
	 */
	emit(name: MatchEventName, meta: unknown): void {
		const message: MatchEventMessage = { seq: this.#seq + 1, name, meta };
		this.#seq = message.seq;
		this.#log.push(message);
		this.#transport.send(MatchMessageType.event, message);
		this.#apply(name, meta);
	}

	submit(name: MatchIntentEvent, meta: unknown): void {
		this.#ingestIntent(name, meta, this.#playerId);
	}

	close(): void {
		for (const unsubscribe of this.#unsubscribes) unsubscribe();
		this.#unsubscribes.length = 0;
		this.#log.length = 0;
	}

	/**
	 * The one gate. `playerId` has already been proven to belong to the sender —
	 * the meta is then stamped with it, so a peer cannot claim one player at the
	 * envelope and act as another inside it.
	 */
	#ingestIntent(name: MatchIntentEvent, meta: unknown, playerId: string): void {
		const model = this.#getModel();
		if (!model) return;
		if (!(playerId in model.players)) return;

		const isActive = model.turn.activePlayerId === playerId;
		if (INTENT_SENDER[name] === 'active' ? !isActive : isActive) return;

		this.emit(name, isRecord(meta) ? { ...meta, playerId } : meta);
	}

	readonly #handlers: Record<string, (payload: unknown, peerId: string) => void> = {
		[MatchMessageType.intent]: (payload, peerId) => {
			const intent = parseMatchIntent(payload);
			if (!intent) return;
			// A peer may only act for the player it introduced itself as in the
			// lobby, the same rule `HostRoom` applies to readiness and leaving.
			if (this.#playerOfPeer(peerId) !== intent.playerId) return;
			this.#ingestIntent(intent.name, intent.meta, intent.playerId);
		},

		[MatchMessageType.sync]: (payload, peerId) => {
			const sync = parseMatchSync(payload);
			if (!sync) return;
			if (sync.have > this.#seq) {
				// The peer claims a longer stream than ours — it cannot be caught up
				// by replay, only rewound. Only reachable if the host restarted.
				this.#sendState(peerId);
				return;
			}
			for (const message of this.#log.slice(sync.have)) {
				this.#transport.send(MatchMessageType.event, message, peerId);
			}
		},
	};

	/**
	 * Caveat: the CoreLoop bus applies queued dispatches asynchronously, so this
	 * model may briefly trail `#seq`. Harmless here because it is only sent on
	 * the rewind path, and the peer resyncs from whatever it lands on.
	 */
	#sendState(peerId: string): void {
		this.#transport.send(MatchMessageType.state, { seq: this.#seq, model: this.#getModel() }, peerId);
	}

	#onMessage(message: RoomMessage, peerId: string): void {
		try {
			this.#handlers[message.type]?.(message.payload, peerId);
		} catch (error) {
			// A malformed intent must not take down the transport's listener loop —
			// other listeners on this message still have to run.
			console.warn('[MatchChannel] host failed to ingest a message', error);
		}
	}
}

/**
 * How many out-of-order events a guest holds while waiting for the gap to
 * close. Past this the stream is so far ahead that replay is the cheaper fix,
 * and an unbounded buffer would be a free way to exhaust a peer's memory.
 */
const MAX_PENDING_EVENTS = 256;

export interface GuestMatchChannelOpts {
	transport: RoomTransport;
	playerId: string;
	apply: ApplyMatchEvent;
	/** Replaces the whole local model — the rewind path, used by `match_state`. */
	adopt: (model: GameModel) => void;
}

/**
 * The follower. It never decides anything: it asks the host for moves and
 * applies the answers strictly in `seq` order.
 *
 * Relays reorder and drop, so a hole in the numbering is expected rather than
 * exceptional. Later events wait in `#pending` while the guest asks the host to
 * resend from where it stopped; applying them early would fork the simulation,
 * which no amount of later traffic could heal.
 */
export class GuestMatchChannel implements MatchChannel {
	readonly #transport: RoomTransport;
	readonly #playerId: string;
	readonly #apply: ApplyMatchEvent;
	readonly #adopt: (model: GameModel) => void;
	readonly #unsubscribes: Array<() => void> = [];
	readonly #pending = new Map<number, MatchEventMessage>();

	#lastSeq = 0;
	/** Pinned on the first accepted message, exactly as `GuestRoom` pins the host. */
	#hostPeerId: string | null = null;
	/** The `have` we last asked about, so one gap costs one request. */
	#requestedFrom: number | null = null;

	constructor(opts: GuestMatchChannelOpts) {
		this.#transport = opts.transport;
		this.#playerId = opts.playerId;
		this.#apply = opts.apply;
		this.#adopt = opts.adopt;

		this.#unsubscribes.push(
			this.#transport.onMessage((message, peerId) => this.#onMessage(message, peerId)),
			// The host may already be here or may arrive later; either way, asking
			// again is free — the answer is the part of the stream we lack.
			this.#transport.onPeerJoin(() => this.#requestSync()),
			this.#transport.onPeerLeave((peerId) => this.#onPeerLeave(peerId)),
		);
	}

	get seq(): number {
		return this.#lastSeq;
	}

	/** Ask the host for everything we have not seen. Call once the transport has joined. */
	start(): void {
		this.#requestSync();
	}

	submit(name: MatchIntentEvent, meta: unknown): void {
		this.#transport.send(
			MatchMessageType.intent,
			{ playerId: this.#playerId, name, meta },
			this.#hostPeerId ?? undefined,
		);
	}

	close(): void {
		for (const unsubscribe of this.#unsubscribes) unsubscribe();
		this.#unsubscribes.length = 0;
		this.#pending.clear();
	}

	readonly #handlers: Record<string, (payload: unknown, peerId: string) => void> = {
		[MatchMessageType.event]: (payload, peerId) => {
			const event = parseMatchEvent(payload);
			if (!event || !this.#fromHost(peerId)) return;
			// Already applied, or a duplicate the relay decided to deliver twice.
			if (event.seq <= this.#lastSeq) return;

			if (event.seq > this.#lastSeq + 1) {
				if (this.#pending.size < MAX_PENDING_EVENTS) this.#pending.set(event.seq, event);
				this.#requestSync();
				return;
			}

			this.#applyFrom(event);
		},

		[MatchMessageType.state]: (payload, peerId) => {
			const state = parseMatchState(payload);
			if (!state || !this.#fromHost(peerId)) return;
			const model = parseGameModel(state.model);
			if (!model) return;

			this.#lastSeq = state.seq;
			this.#requestedFrom = null;
			this.#adopt(model);
			this.#drainPending();
		},
	};

	/** Applies `event` and whatever the buffer can now contribute, in order. */
	#applyFrom(event: MatchEventMessage): void {
		this.#lastSeq = event.seq;
		this.#requestedFrom = null;
		this.#apply(event.name, event.meta);
		this.#drainPending();
	}

	#drainPending(): void {
		for (const [seq] of [...this.#pending].sort((a, b) => a[0] - b[0])) {
			if (seq <= this.#lastSeq) {
				this.#pending.delete(seq);
				continue;
			}
			if (seq > this.#lastSeq + 1) break;
			const next = this.#pending.get(seq);
			if (!next) break;
			this.#pending.delete(seq);
			this.#lastSeq = seq;
			this.#apply(next.name, next.meta);
		}
	}

	/**
	 * One request per hole: `#requestedFrom` is cleared by every applied event,
	 * so a *new* gap always asks again while a standing one does not re-ask on
	 * each arrival.
	 *
	 * Nothing here retries a request that was itself lost — a guest whose sync
	 * goes missing waits for the next event to reopen the question. Real
	 * recovery needs a timer and belongs with reconnect handling.
	 */
	#requestSync(): void {
		if (this.#requestedFrom === this.#lastSeq) return;
		this.#requestedFrom = this.#lastSeq;
		this.#transport.send(MatchMessageType.sync, { have: this.#lastSeq }, this.#hostPeerId ?? undefined);
	}

	/**
	 * The first peer to send match traffic is taken to be the host and pinned;
	 * everyone else is ignored. Impersonation is not the threat model here (see
	 * `HostRoom`) — what this prevents is a second stream being interleaved.
	 */
	#fromHost(peerId: string): boolean {
		if (this.#hostPeerId === null) this.#hostPeerId = peerId;
		return this.#hostPeerId === peerId;
	}

	#onPeerLeave(peerId: string): void {
		if (peerId !== this.#hostPeerId) return;
		// Losing the host ends the match stream; a new host would restart it and
		// re-pin itself. Buffered events belong to a stream nobody will finish.
		this.#hostPeerId = null;
		this.#requestedFrom = null;
		this.#pending.clear();
	}

	#onMessage(message: RoomMessage, peerId: string): void {
		try {
			this.#handlers[message.type]?.(message.payload, peerId);
		} catch (error) {
			console.warn('[MatchChannel] guest failed to ingest a message', error);
		}
	}
}
