import { describe, expect, it } from '@jest/globals';
import { CoreLoop } from '@yantrix/core';
import {
	affordableMarketSlots,
	type AppModel,
	asPlayerId,
	CARD_DEFINITIONS,
	type CardInstanceId,
	createGameEffectMatrix,
	DECK_SIZE,
	emptyAppModel,
	type GameModel,
	isCropDefinition,
	isFinalTurn,
	nextPlayer,
	parseGameModel,
	plantableBeds,
	plantTargetOf,
	type PlayerId,
	scoreBoard,
	selectionKindOf,
} from '~/entities/game';
import { attachEffectLayer, ModelStore } from '~/shared/lib/model';
import { setCurrentProfile } from '~/entities/profile/currentProfile';
import FertilizingAutomata, {
	eventDictionary as fertilizingEvents,
	statesDictionary as fertilizingStates,
} from '~/shared/lib/fsm/game/FertilizingAutomata';
import GameLoopAutomata from '~/shared/lib/fsm/game/GameLoopAutomata';
import HarvestAutomata from '~/shared/lib/fsm/game/HarvestAutomata';
import PlayingCardsAutomata, {
	eventDictionary as playEvents,
	statesDictionary as playStates,
} from '~/shared/lib/fsm/game/PlayingCardsAutomata';
import ShoppingAutomata, {
	eventDictionary as shoppingEvents,
	statesDictionary as shoppingStates,
} from '~/shared/lib/fsm/game/ShoppingAutomata';
import TargetModeAutomata from '~/shared/lib/fsm/game/TargetModeAutomata';
import TradingAutomata, { eventDictionary as tradingEvents } from '~/shared/lib/fsm/game/TradingAutomata';
import TurnLoopAutomata, { statesDictionary as turnLoopStates } from '~/shared/lib/fsm/game/TurnLoopAutomata';
import WaitingAutomata, { eventDictionary as waitingEvents } from '~/shared/lib/fsm/game/WaitingAutomata';
import { GameDomainEvents } from '~/app/yantrix/gameDomainEvents';
import { MatchUiEvents, type MatchUiEventName } from '~/app/yantrix/matchUiEvents';
import { buildPhaseFacts } from '~/app/yantrix/data/destinations/phaseFacts';
import { buildMatchIntent, type CommitKind, type CommitLog } from '~/app/yantrix/data/destinations/matchIntent';
import { buildMatchSetup } from '~/app/yantrix/data/destinations/matchSetup';

/**
 * A full match played through the machinery the app actually runs, rather than
 * through the Effect Matrix alone.
 *
 * `botMatch.test.ts` proves the *rules* survive a few hundred turns; it
 * dispatches intents straight at the matrix with a synthetic event dictionary,
 * so every automaton, every `emit/` and both seam destinations are absent from
 * it. That is exactly the surface the diagram-first refactor rewrote: phases now
 * open because `TurnLoopAutomata` says so, and moves leave the peer because a
 * machine entered a state that means *committed*.
 *
 * So this test plays a whole match with the real generated automata on a real
 * `CoreLoop`, with the real Effect Layer and the two seams wired in. The bot
 * only ever does what a player can do — click a slot, confirm, pick a bed. If a
 * guard, a reducer or a `seq` is wrong, the match stalls or the board corrupts.
 *
 * The `CoreLoop`/automata/effects registration order mirrors `startYantrixCore`:
 * bus subscribers fire in subscription order, and FSM transitions must land
 * before the model writes.
 */

const ME = asPlayerId('bot-a');
const RIVAL = asPlayerId('bot-b');

/** The bus settles asynchronously — a dispatch only queues until then. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * The commit events are the machines' own — a diagram's `emit/` registers the
 * name in its automaton's dictionary, and nothing subscribes to them but the
 * seam, so they never entered `MatchUiEvents`.
 */
const COMMIT_KIND_BY_EVENT: Record<number, CommitKind> = {
	[shoppingEvents.shopping_committed]: 'shopping',
	[fertilizingEvents.fertilize_committed]: 'fertilizing',
	[tradingEvents.trade_offer_committed]: 'trade_offer',
	[tradingEvents.trade_accept_committed]: 'trade_accept',
	[waitingEvents.waiting_bid_committed]: 'waiting_bid',
	[playEvents.play_committed]: 'play',
};

const PHASE_BY_OPENED = {
	[MatchUiEvents.harvest_phase_opened]: 'HARVEST',
	[MatchUiEvents.shopping_phase_opened]: 'SHOPPING',
	[MatchUiEvents.trade_phase_opened]: 'TRADE',
	[MatchUiEvents.play_phase_opened]: 'PLAYING',
	[MatchUiEvents.fertilize_phase_opened]: 'FERTILIZE',
} as const satisfies Record<number, GameModel['turn']['phase']>;

const INTENT_EVENT = {
	card_bought: GameDomainEvents.card_bought,
	fertilizer_used: GameDomainEvents.fertilizer_used,
	trade_offered: GameDomainEvents.trade_offered,
	trade_offer_accepted: GameDomainEvents.trade_offer_accepted,
	trade_bid_placed: GameDomainEvents.trade_bid_placed,
	card_played: GameDomainEvents.card_played,
} as const;

interface Peer {
	store: ModelStore<AppModel>;
	shopping: ShoppingAutomata;
	fertilizing: FertilizingAutomata;
	play: PlayingCardsAutomata;
	turn: TurnLoopAutomata;
	/** What left this peer for the table, in order — the wire, as a list. */
	submitted: Array<{ kind: string; meta: unknown }>;
	send: (event: number, meta: unknown) => Promise<void>;
	detach: () => void;
}

/**
 * One peer: the loop, every game automaton, the Effect Layer and the two seams.
 *
 * The seams are the destinations' *pure halves* subscribed to the bus by hand.
 * The classes around them (`PhaseFactsDataDestination`,
 * `MatchIntentDataDestination`) only add an `import.meta`-tainted transport and
 * the UI bridge, neither of which compiles under the CJS test build — the
 * decisions under test all live in the pure halves.
 */
function createPeer(viewerId: PlayerId): Peer {
	setCurrentProfile({ playerId: viewerId, nickname: 'bot' });

	const store = new ModelStore<AppModel>(emptyAppModel());
	const loop = new CoreLoop<number, Record<number, unknown>>();

	const machines = {
		game: new GameLoopAutomata(),
		turn: new TurnLoopAutomata(),
		play: new PlayingCardsAutomata(),
		target: new TargetModeAutomata(),
		harvest: new HarvestAutomata(),
		shopping: new ShoppingAutomata(),
		trading: new TradingAutomata(),
		fertilizing: new FertilizingAutomata(),
		waiting: new WaitingAutomata(),
	};
	for (const machine of Object.values(machines)) loop.registerAutomata(machine);

	const detachEffects = attachEffectLayer({
		bus: loop.getBus(),
		store,
		matrix: createGameEffectMatrix(GameDomainEvents),
	});

	const bus = loop.getBus();
	const submitted: Peer['submitted'] = [];
	const commitLog: CommitLog = new Map();
	let lastWindow: string | null = null;

	/**
	 * A bus subscriber hands follow-up events back through `result`, and the bus
	 * only re-stacks them after `Promise.all` over every synchronous subscriber.
	 * Dispatching inline instead would run the seam *before* the Effect Layer
	 * commits — which is the one ordering this design cannot survive.
	 */
	const answers = (
		raw: { event: number | null; meta: unknown },
		events: Array<{ event: number; meta: unknown }>,
	) => ({
		event: raw.event,
		meta: raw.meta ?? null,
		task_id: `seam_${String(raw.event)}`,
		result: events.length ? Promise.resolve(events.map((e) => ({ ...e, meta: e.meta ?? null }))) : null,
	});

	// Seam 1 — PhaseFactsDataDestination: the turn machine announces the phase,
	// this reads the facts its machine's guard needs off the model.
	for (const [id, phase] of Object.entries(PHASE_BY_OPENED)) {
		bus.subscribe(Number(id), (raw) => {
			const facts = buildPhaseFacts(phase, store.get().match, viewerId);
			// Trap 7: the emitter re-fires while the turn machine rests in a phase.
			if (!facts || facts.window === lastWindow) return answers(raw, []);
			lastWindow = facts.window;
			return answers(raw, [
				{ event: MatchUiEvents[facts.open as MatchUiEventName], meta: facts.meta },
			]);
		});
	}

	// Seam 2 — MatchIntentDataDestination: a machine entered a committed state
	// and emitted; this is where the move leaves the peer for the table.
	for (const [id, kindOfEvent] of Object.entries(COMMIT_KIND_BY_EVENT)) {
		bus.subscribe(Number(id), (raw) => {
			const packet = buildMatchIntent(kindOfEvent, raw.meta, commitLog);
			if (!packet) return answers(raw, []);
			const { kind, ...payload } = packet;
			submitted.push({ kind, meta: payload });
			return answers(raw, [{ event: INTENT_EVENT[kind], meta: payload }]);
		});
	}

	// A phase ending resets every machine's `seq`, so the journal resets with it.
	for (const id of [GameDomainEvents.turn_phase_ended, GameDomainEvents.turn_ended]) {
		bus.subscribe(id, (raw) => {
			commitLog.clear();
			return answers(raw, []);
		});
	}

	loop.start();

	return {
		store,
		shopping: machines.shopping,
		fertilizing: machines.fertilizing,
		play: machines.play,
		turn: machines.turn,
		submitted,
		send: async (event, meta) => {
			bus.dispatch({ event, meta });
			await settle();
		},
		detach: () => {
			detachEffects();
			loop.stop?.();
		},
	};
}

/** Every card the match holds, wherever it currently sits. */
function allCardIds(match: GameModel): CardInstanceId[] {
	const inPlay = Object.values(match.players).flatMap((player) => [
		...player.hand,
		...player.beds.flatMap((bed) => (bed.crop ? [bed.crop.cardId] : [])),
	]);
	const inMarket = match.market.filter((slot): slot is CardInstanceId => slot !== null);
	return [...match.deck, ...inMarket, ...match.discard, ...inPlay];
}

/** SHOPPING: click a slot, confirm, repeat while the machine keeps letting us. */
async function botShops(peer: Peer): Promise<void> {
	for (let guard = 0; guard < 8; guard += 1) {
		const match = peer.store.get().match!;
		if ((match.turn.allowance ?? 0) <= 0) return;
		const slots = affordableMarketSlots(match, ME);
		if (slots.length === 0) return;
		// The machine refused to open — nothing affordable, or not our turn.
		if (peer.shopping.state === shoppingStates.IDLE) return;

		const before = match.version;
		await peer.send(MatchUiEvents.market_slot_picked, { slotIndex: slots[0] });
		expect(peer.shopping.state).toBe(shoppingStates.CONFIRM);
		await peer.send(MatchUiEvents.market_purchase_confirmed, null);
		if (peer.store.get().match!.version === before) return;
	}
}

/**
 * PLAYING: plant every crop that still finds a bed.
 *
 * The play machine has three ways to reach PLAYED and the bot walks two of
 * them: a crop that lands quietly (`plantedCrop --> PLAYED: noTarget`) and one
 * whose ability fires on planting, which owes a target first
 * (`TARGETING --PICK_TARGET--> PLAYED`). That second path is the one trap 4
 * eats most readily, so it is deliberately exercised rather than cancelled.
 */
async function botPlays(peer: Peer, reached: Set<string>): Promise<void> {
	const tried = new Set<CardInstanceId>();

	for (let guard = 0; guard < 12; guard += 1) {
		if (peer.play.state === playStates.IDLE) return;
		const match = peer.store.get().match!;
		const beds = plantableBeds(match, ME);
		if (beds.length === 0) return;

		const cropCard = (match.players[ME]?.hand ?? []).find((cardId) => {
			if (tried.has(cardId)) return false;
			const defId = match.cards[cardId]?.defId;
			return defId !== undefined && isCropDefinition(CARD_DEFINITIONS[defId]);
		});
		if (!cropCard) return;
		tried.add(cropCard);

		const definition = CARD_DEFINITIONS[match.cards[cropCard]!.defId];
		if (!isCropDefinition(definition)) return;

		await peer.send(MatchUiEvents.play_card_picked, {
			cardId: cropCard,
			cardKind: definition.kind,
			targetKind: selectionKindOf(definition),
		});
		expect(peer.play.state).toBe(playStates.PLANTING);

		await peer.send(MatchUiEvents.play_bed_picked, {
			cardId: cropCard,
			bedIndex: beds[0],
			targetKind: plantTargetOf(definition),
		});

		if (peer.play.state === playStates.TARGETING) {
			// Whatever the ability asks for, a rival is the one legal answer a bot
			// can always name; an ability that refuses it just changes nothing.
			await peer.send(MatchUiEvents.play_target_picked, {
				cardId: cropCard,
				bedIndex: beds[0],
				target: { playerId: RIVAL, bedIndex: 0 },
			});
			reached.add('via_target');
		} else {
			reached.add('direct');
		}

		// Either way the machine must be resting on a commit, not stuck mid-pick.
		expect(peer.play.state).toBe(playStates.PLAYED);
	}
}

/**
 * The rival's turn, as it reaches this peer: intents off the wire.
 *
 * A guest's picks never touch our machines — they arrive already decided, from
 * the peer whose machines made them. Driving them straight at the bus is what
 * the match channel does on receipt, so this is the other half of the seam.
 */
async function rivalPlays(peer: Peer, playerId: PlayerId): Promise<void> {
	const match = () => peer.store.get().match!;
	const act = async (event: number, meta: unknown): Promise<boolean> => {
		const before = match().version;
		await peer.send(event, meta);
		return match().version !== before;
	};

	await peer.send(GameDomainEvents.turn_phase_ended, null); // → SHOPPING
	for (let guard = 0; guard < 8 && (match().turn.allowance ?? 0) > 0; guard += 1) {
		const slots = affordableMarketSlots(match(), playerId);
		if (slots.length === 0) break;
		if (!(await act(GameDomainEvents.card_bought, { playerId, slotIndex: slots[0] }))) break;
	}

	await peer.send(GameDomainEvents.turn_phase_ended, null); // → TRADE
	await peer.send(GameDomainEvents.turn_phase_ended, null); // → PLAYING
	for (let guard = 0; guard < 12; guard += 1) {
		const current = match();
		const beds = plantableBeds(current, playerId);
		const cropCard = (current.players[playerId]?.hand ?? []).find((cardId) => {
			const defId = current.cards[cardId]?.defId;
			return defId !== undefined && isCropDefinition(CARD_DEFINITIONS[defId]);
		});
		if (!cropCard || beds.length === 0) break;
		if (!(await act(GameDomainEvents.card_played, { playerId, cardId: cropCard, bedIndex: beds[0] }))) break;
	}

	await peer.send(GameDomainEvents.turn_phase_ended, null); // → FERTILIZE
	for (let guard = 0; guard < 8 && (match().turn.allowance ?? 0) > 0; guard += 1) {
		const bedIndex = match().players[playerId]?.beds.findIndex((bed) => bed.crop !== null) ?? -1;
		if (bedIndex < 0) break;
		if (!(await act(GameDomainEvents.fertilizer_used, { playerId, bedIndex }))) break;
	}

	await peer.send(GameDomainEvents.turn_phase_ended, null); // → CALCULATION
}

/** FERTILIZE: pour the allowance into whatever is growing. */
async function botFertilizes(peer: Peer): Promise<void> {
	for (let guard = 0; guard < 8; guard += 1) {
		if (peer.fertilizing.state === fertilizingStates.IDLE) return;
		const match = peer.store.get().match!;
		if ((match.turn.allowance ?? 0) <= 0) return;
		const bedIndex = match.players[ME]?.beds.findIndex((bed) => bed.crop !== null) ?? -1;
		if (bedIndex < 0) return;

		const before = match.version;
		await peer.send(MatchUiEvents.fertilize_crop_picked, { bedIndex });
		expect(peer.fertilizing.state).toBe(fertilizingStates.CROP_CONFIRM);
		await peer.send(MatchUiEvents.fertilize_confirmed, null);
		if (peer.store.get().match!.version === before) return;
	}
}

describe('a full bot match through the real CoreLoop', () => {
	it('plays to FINISHED with every move going through a machine', async () => {
		const peer = createPeer(ME);

		const setup = buildMatchSetup({ gameId: 'K7QM2X', playerIds: ['bot-a', 'bot-b'] }, [
			{ playerId: 'bot-a', nickname: 'Ann', isHost: true, isReady: true },
			{ playerId: 'bot-b', nickname: 'Bob', isHost: false, isReady: true },
		]);

		await peer.send(GameDomainEvents.match_created, setup);
		expect(peer.store.get().match?.phase).toBe('SETUP');

		await peer.send(GameDomainEvents.match_started, null);
		expect(peer.store.get().match?.phase).toBe('IN_PROGRESS');

		let turnNumber = 0;
		let myTurns = 0;
		/** Which of the play machine's completion paths the bot actually walked. */
		const reached = new Set<string>();

		while (peer.store.get().match!.phase !== 'FINISHED') {
			expect(++turnNumber).toBeLessThanOrEqual(600);

			const active = nextPlayer(peer.store.get().match!)!;
			await peer.send(GameDomainEvents.turn_started, { activePlayerId: active, turnNumber });

			if (active === ME) {
				myTurns += 1;
				// The turn machine is the gate: it only walks the phases when the
				// turn is this peer's, which is what keeps a guest's machines shut.
				expect(peer.turn.state).toBe(turnLoopStates.HARVEST);

				// HARVEST resolved on turn_started. SHOPPING next.
				await peer.send(GameDomainEvents.turn_phase_ended, null);
				await botShops(peer);

				// TRADE — bots do not haggle.
				await peer.send(GameDomainEvents.turn_phase_ended, null);

				await peer.send(GameDomainEvents.turn_phase_ended, null);
				await botPlays(peer, reached);

				await peer.send(GameDomainEvents.turn_phase_ended, null);
				await botFertilizes(peer);

				await peer.send(GameDomainEvents.turn_phase_ended, null);
			} else {
				expect(peer.turn.state).toBe(turnLoopStates.WAITING);
				await rivalPlays(peer, active);
			}

			await peer.send(GameDomainEvents.turn_ended, null);

			if (isFinalTurn(peer.store.get().match!)) {
				await peer.send(GameDomainEvents.match_ended, {
					scoreBoard: scoreBoard(peer.store.get().match!),
				});
			}
		}

		const final = peer.store.get().match!;

		// The match ran long enough to be worth calling a match.
		expect(myTurns).toBeGreaterThan(5);

		// The endgame triggered on its own, not by fiat.
		expect(final.lastTurnTriggeredBy).not.toBeNull();

		// Conservation: every card is still somewhere, exactly once.
		const ids = allCardIds(final);
		expect(ids).toHaveLength(DECK_SIZE);
		expect(new Set(ids).size).toBe(DECK_SIZE);

		// Hundreds of commits later it is still a valid snapshot.
		expect(parseGameModel(JSON.parse(JSON.stringify(final)))).not.toBeNull();

		// The machines actually produced moves, and only ours.
		expect(peer.submitted.length).toBeGreaterThan(10);
		expect(peer.submitted.every((entry) => (entry.meta as { playerId: PlayerId }).playerId === ME)).toBe(true);

		// Both ways of finishing a card play were exercised, not just the easy one.
		expect([...reached].sort()).toEqual(['direct', 'via_target']);

		// Both halves of the seam did their job: buys and plays both came through.
		const kinds = new Set(peer.submitted.map((entry) => entry.kind));
		expect(kinds.has('card_bought')).toBe(true);
		expect(kinds.has('card_played')).toBe(true);

		// The rival never acted, so nothing of theirs can have leaked out of here.
		expect(final.players[RIVAL]).toBeDefined();

		peer.detach();
	}, 60_000);

	it('ships one intent per commit, however often the emitter re-fires', async () => {
		const peer = createPeer(ME);

		const setup = buildMatchSetup({ gameId: 'SEQ001', playerIds: ['bot-a', 'bot-b'] }, [
			{ playerId: 'bot-a', nickname: 'Ann', isHost: true, isReady: true },
			{ playerId: 'bot-b', nickname: 'Bob', isHost: false, isReady: true },
		]);
		await peer.send(GameDomainEvents.match_created, setup);
		await peer.send(GameDomainEvents.match_started, null);
		await peer.send(GameDomainEvents.turn_started, { activePlayerId: ME, turnNumber: 1 });
		await peer.send(GameDomainEvents.turn_phase_ended, null);

		const slots = affordableMarketSlots(peer.store.get().match!, ME);
		expect(slots.length).toBeGreaterThan(0);

		await peer.send(MatchUiEvents.market_slot_picked, { slotIndex: slots[0] });
		await peer.send(MatchUiEvents.market_purchase_confirmed, null);
		expect(peer.shopping.state).toBe(shoppingStates.PURCHASED);
		expect(peer.submitted.filter((entry) => entry.kind === 'card_bought')).toHaveLength(1);

		/**
		 * Trap 7 in the flesh: PURCHASED has no edge for `market_purchase_confirmed`,
		 * so these dispatches change nothing — but the emitter still fires from the
		 * state the machine is resting in. The reducer does not run on a dead
		 * dispatch, so `seq` stays put and the journal drops the re-issues.
		 */
		await peer.send(MatchUiEvents.market_purchase_confirmed, null);
		await peer.send(MatchUiEvents.market_purchase_confirmed, null);

		expect(peer.shopping.state).toBe(shoppingStates.PURCHASED);
		expect(peer.submitted.filter((entry) => entry.kind === 'card_bought')).toHaveLength(1);

		peer.detach();
	});
});
