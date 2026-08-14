import { beforeEach, describe, expect, it } from '@jest/globals';
import {
	type AppModel,
	createGameEffectMatrix,
	type DriverEventName,
	driveMatch,
	emptyAppModel,
	type GameModel,
	type MatchEventIds,
} from '~/entities/game';
import { buildMatchEntry } from '~/app/yantrix/data/destinations/matchEntry';
import { buildMatchSetup } from '~/app/yantrix/data/destinations/matchSetup';
import { statesDictionary as modeStates } from '~/shared/lib/fsm/window/WindowModeAutomata';
import { GuestRoom } from '~/entities/room/GuestRoom';
import { HostRoom } from '~/entities/room/HostRoom';
import { GuestMatchChannel, HostMatchChannel } from '~/entities/room/MatchChannel';
import {
	type MatchEventName,
	type MatchIntentEvent,
	MatchMessageType,
} from '~/entities/room/matchProtocol';
import { FakeSignalHub } from '~/shared/net/FakeRoomTransport';
import type { MessageListener, RoomTransport } from '~/shared/net/RoomTransport';

/**
 * Phase 4 end to end: several peers over the in-memory hub, each running the
 * real Effect Matrix against its own model, connected by nothing but the
 * ordered event stream.
 *
 * The claim under test is convergence — that a guest which only ever receives
 * events ends up holding a model byte-identical to the host's, including the
 * cards it was dealt, because `createMatch` is a pure function of the seed. If
 * anything in the pipeline is order-dependent or non-deterministic, a deep
 * equality on the two models is where it shows up.
 */

const CODE = 'K7QM2X';
const MATCH_ID = 'ROOMNET';

/** Arbitrary ids, exactly as `botMatch` uses: the matrix is data, not a registry. */
const EVENT_IDS: Record<MatchEventName, number> = {
	match_created: 1,
	match_started: 2,
	turn_started: 3,
	turn_phase_ended: 4,
	turn_ended: 5,
	match_ended: 6,
	card_bought: 7,
	card_played: 8,
	fertilizer_used: 9,
	trade_offered: 10,
	trade_bid_placed: 11,
	trade_offer_accepted: 12,
};

const matrix = createGameEffectMatrix(EVENT_IDS satisfies MatchEventIds);

/** The events the host's driver answers — the trigger list of `MatchDriverDataDestination`. */
const DRIVER_EVENTS = new Set<MatchEventName>(['match_started', 'turn_phase_ended', 'turn_ended']);

const SEATS = ['p-host', 'p-one', 'p-two'];

const SETUP = buildMatchSetup(
	{ gameId: MATCH_ID, playerIds: SEATS },
	[
		{ playerId: 'p-host', nickname: 'Host', isHost: true, isReady: true },
		{ playerId: 'p-one', nickname: 'One', isHost: false, isReady: true },
		{ playerId: 'p-two', nickname: 'Two', isHost: false, isReady: true },
	],
);

type Peer = HostPeer | GuestPeer;

/**
 * Stands in for the whole app-side pipeline of one peer: the Effect Matrix
 * (which `attachEffectLayer` subscribes to the bus) followed by the match
 * driver (which `MatchDriverDataDestination` runs, host-only). Synchronous
 * where production is queued, which is strictly harsher — a re-entrant
 * `emit` inside `apply` is exactly the ordering the channel has to survive.
 */
function applyTo(peer: Peer, name: MatchEventName, meta: unknown): void {
	const event = EVENT_IDS[name];
	for (const effect of matrix[event] ?? []) {
		peer.model = effect({ event, meta } as never, peer.model);
	}
	if (peer.role !== 'host' || !DRIVER_EVENTS.has(name)) return;
	for (const emission of driveMatch(name as DriverEventName, peer.model.match)) {
		peer.channel.emit(emission.name, emission.meta);
	}
}

class HostPeer {
	readonly role = 'host' as const;
	readonly channel: HostMatchChannel;
	model: AppModel = emptyAppModel();

	constructor(
		readonly playerId: string,
		readonly transport: RoomTransport,
		peerToPlayer: Map<string, string>,
	) {
		this.channel = new HostMatchChannel({
			transport,
			playerId,
			apply: (name, meta) => applyTo(this, name, meta),
			playerOfPeer: (peerId) => peerToPlayer.get(peerId) ?? null,
			getModel: () => this.model.match,
		});
	}

	match(): GameModel | null {
		return this.model.match;
	}
}

class GuestPeer {
	readonly role = 'guest' as const;
	readonly channel: GuestMatchChannel;
	model: AppModel = emptyAppModel();

	constructor(
		readonly playerId: string,
		readonly transport: RoomTransport,
		/** Stands in for the destinations that share the bus with the Effect Matrix. */
		readonly onApply?: (name: MatchEventName, meta: unknown) => void,
	) {
		this.channel = new GuestMatchChannel({
			transport,
			playerId,
			apply: (name, meta) => {
				applyTo(this, name, meta);
				this.onApply?.(name, meta);
			},
			adopt: (match) => {
				this.model = { ...this.model, match };
			},
		});
	}

	match(): GameModel | null {
		return this.model.match;
	}
}

function createTable(hub: FakeSignalHub) {
	const peerToPlayer = new Map<string, string>();
	const peers: Peer[] = [];
	const hostTransport = hub.createTransport();
	let host: HostPeer;

	const addGuest = async (
		playerId: string,
		transport?: RoomTransport,
		onApply?: (name: MatchEventName, meta: unknown) => void,
	): Promise<GuestPeer> => {
		const wire = transport ?? hub.createTransport();
		await wire.join(CODE);
		peerToPlayer.set(wire.selfId, playerId);

		const guest = new GuestPeer(playerId, wire, onApply);
		guest.channel.start();
		peers.push(guest);
		return guest;
	};

	const start = async () => {
		await hostTransport.join(CODE);
		host = new HostPeer('p-host', hostTransport, peerToPlayer);
		peers.push(host);
	};

	/** Deals the match and opens the first turn, exactly as the setup seam does. */
	const openMatch = () => {
		host.channel.emit('match_created', SETUP);
		host.channel.emit('match_started', null);
	};

	/** Submits one phase advance from whoever the model says is up. */
	const advance = (name: MatchIntentEvent = 'turn_phase_ended', meta: unknown = null) => {
		const active = host.match()?.turn.activePlayerId;
		const peer = peers.find((p) => p.playerId === active);
		peer?.channel.submit(name, meta);
	};

	return {
		get host() {
			return host;
		},
		addGuest,
		start,
		openMatch,
		advance,
		peers,
		peerToPlayer,
	};
}

describe('the match channel over a fake network', () => {
	let hub: FakeSignalHub;
	let table: ReturnType<typeof createTable>;

	beforeEach(async () => {
		hub = new FakeSignalHub();
		table = createTable(hub);
		await table.start();
	});

	it('deals every peer the same match from the seed alone', async () => {
		const one = await table.addGuest('p-one');
		const two = await table.addGuest('p-two');

		table.openMatch();

		expect(table.host.match()?.phase).toBe('IN_PROGRESS');
		expect(one.match()).toEqual(table.host.match());
		expect(two.match()).toEqual(table.host.match());
		// The deal never travelled: `match_created` carried a seed and three seats.
		expect(one.match()?.deck.length).toBeGreaterThan(0);
	});

	/**
	 * The other half of the deal: a guest gets the board, but its window flow has
	 * to be told the game began or it renders the lobby over a running match.
	 * `game_start` comes from the Start button, which only the host presses — so
	 * on a guest the stream itself has to stand in for it, which it can only do if
	 * what crosses the wire still names the table.
	 *
	 * `tests/fsm/matchEntry.test.ts` takes it from here, through the mode FSM.
	 */
	it('carries enough in `match_created` to take a guest out of the lobby', async () => {
		let entry: ReturnType<typeof buildMatchEntry> = null;
		await table.addGuest('p-one', undefined, (name, meta) => {
			if (name === 'match_created') entry = buildMatchEntry(modeStates.GAME_LOBBY, meta);
		});

		table.openMatch();

		expect(entry).toEqual({ gameId: MATCH_ID, playerIds: SEATS, lobbyId: MATCH_ID });
	});

	it('keeps every peer converged across a whole turn', async () => {
		const one = await table.addGuest('p-one');
		const two = await table.addGuest('p-two');

		table.openMatch();
		const opener = table.host.match()?.turn.activePlayerId;

		// HARVEST → … → CALCULATION. The fifth advance lands on CALCULATION, which
		// is what makes the driver close the turn and open the next player's.
		for (let i = 0; i < 5; i++) table.advance();

		const host = table.host.match()!;
		expect(host.turn.number).toBe(2);
		expect(host.turn.activePlayerId).not.toBe(opener);
		expect(host.turn.phase).toBe('HARVEST');
		expect(one.match()).toEqual(host);
		expect(two.match()).toEqual(host);
	});

	it('refuses an intent from a peer that does not own the player', async () => {
		await table.addGuest('p-one');
		await table.addGuest('p-two');
		table.openMatch();

		const active = table.host.match()?.turn.activePlayerId;
		const impostor = table.peers.find((p) => p.role === 'guest' && p.playerId !== active)!;
		const seq = table.host.channel.seq;
		const before = table.host.match();

		// A legal move on its face — but sent down somebody else's wire.
		impostor.transport.send(MatchMessageType.intent, {
			playerId: active,
			name: 'turn_phase_ended',
			meta: null,
		});

		expect(table.host.channel.seq).toBe(seq);
		expect(table.host.match()).toBe(before);
	});

	it('refuses a phase advance from a player whose turn it is not', async () => {
		await table.addGuest('p-one');
		await table.addGuest('p-two');
		table.openMatch();

		const active = table.host.match()?.turn.activePlayerId;
		const waiting = table.peers.find((p) => p.playerId !== active)!;
		const seq = table.host.channel.seq;

		waiting.channel.submit('turn_phase_ended', null);

		expect(table.host.channel.seq).toBe(seq);
		expect(table.host.match()?.turn.phase).toBe('HARVEST');
	});

	it('applies a duplicated event exactly once', async () => {
		const one = await table.addGuest('p-one');
		table.openMatch();
		table.advance();

		const seq = one.channel.seq;
		expect(one.match()?.turn.phase).toBe('SHOPPING');

		// The relay delivers the phase advance a second time. Re-applying it would
		// carry the guest into TRADE on its own, a fork nothing would ever heal.
		table.host.transport.send(MatchMessageType.event, { seq, name: 'turn_phase_ended', meta: null });

		expect(one.channel.seq).toBe(seq);
		expect(one.match()?.turn.phase).toBe('SHOPPING');
	});

	it('catches a guest up by replaying the stream after a gap', async () => {
		const lossy = new LossyTransport(hub.createTransport());
		const one = await table.addGuest('p-one', lossy);
		await table.addGuest('p-two');

		table.openMatch();
		expect(one.match()).toEqual(table.host.match());

		// The guest's inbound feed dies for most of a turn — it still submits,
		// it just stops hearing anything back.
		lossy.dropInbound = true;
		for (let i = 0; i < 4; i++) table.advance();
		expect(one.match()).not.toEqual(table.host.match());

		// One event arrives past the hole: the guest buffers it, asks for a sync,
		// and the host replays what it missed.
		lossy.dropInbound = false;
		table.advance();

		expect(one.channel.seq).toBe(table.host.channel.seq);
		expect(one.match()).toEqual(table.host.match());
	});

	it('replays the whole match to a guest that joins mid-game', async () => {
		await table.addGuest('p-one');
		await table.addGuest('p-two');

		table.openMatch();
		for (let i = 0; i < 7; i++) table.advance();

		// `p-two` was seated at the deal but this peer only connects now.
		const latecomer = await table.addGuest('p-two');

		expect(latecomer.channel.seq).toBe(table.host.channel.seq);
		expect(latecomer.match()).toEqual(table.host.match());
	});

	it('rewinds a guest that claims a longer stream than the host has', async () => {
		const one = await table.addGuest('p-one');
		table.openMatch();
		for (let i = 0; i < 3; i++) table.advance();

		// Only reachable if the host restarted; the guest cannot be caught up by
		// replay, so the host sends state and the guest adopts it wholesale.
		one.model = emptyAppModel();
		one.transport.send(MatchMessageType.sync, { have: 999 });

		expect(one.channel.seq).toBe(table.host.channel.seq);
		expect(one.match()).toEqual(table.host.match());
	});
});

describe('HostRoom.playerOfPeer', () => {
	it('maps a peer to the player it introduced itself as', async () => {
		const hub = new FakeSignalHub();
		const hostTransport = hub.createTransport();
		await hostTransport.join(CODE);
		const host = new HostRoom({
			transport: hostTransport,
			code: CODE,
			hostPlayerId: 'p-host',
			hostNickname: 'Host',
		});

		const guestTransport = hub.createTransport();
		await guestTransport.join(CODE);
		new GuestRoom({ transport: guestTransport, code: CODE, playerId: 'p-one', nickname: 'One' }).start();

		expect(host.playerOfPeer(guestTransport.selfId)).toBe('p-one');
		expect(host.playerOfPeer('nobody')).toBeNull();
	});
});

/**
 * A transport whose inbound feed can be cut — the one thing `FakeRoomTransport`
 * cannot do, and the only way to produce a real hole in the stream rather than
 * a hand-forged one.
 */
class LossyTransport implements RoomTransport {
	dropInbound = false;

	readonly #inner: RoomTransport;
	readonly #listeners = new Set<MessageListener>();

	constructor(inner: RoomTransport) {
		this.#inner = inner;
		this.#inner.onMessage((message, peerId) => {
			if (this.dropInbound) return;
			for (const listener of this.#listeners) listener(message, peerId);
		});
	}

	get selfId(): string {
		return this.#inner.selfId;
	}

	get peers(): readonly string[] {
		return this.#inner.peers;
	}

	join(code: string): Promise<void> {
		return this.#inner.join(code);
	}

	leave(): Promise<void> {
		return this.#inner.leave();
	}

	send(type: string, payload: unknown, peerId?: string): void {
		this.#inner.send(type, payload, peerId);
	}

	onMessage(listener: MessageListener): () => void {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	onPeerJoin(listener: (peerId: string) => void): () => void {
		return this.#inner.onPeerJoin(listener);
	}

	onPeerLeave(listener: (peerId: string) => void): () => void {
		return this.#inner.onPeerLeave(listener);
	}
}
