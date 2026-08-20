import { beforeEach, describe, expect, it } from '@jest/globals';
import { CoreLoop } from '@yantrix/core';
import GameLoopAutomata, {
	eventDictionary as gameEvents,
	statesDictionary as gameStates,
} from '~/shared/lib/fsm/game/GameLoopAutomata';
import TurnLoopAutomata, {
	eventDictionary as turnEvents,
	statesDictionary as turnStates,
} from '~/shared/lib/fsm/game/TurnLoopAutomata';
import { setCurrentProfile } from '~/entities/profile/currentProfile';

/**
 * The two automata that drive a match: `GameLoopAutomata` owns the match
 * lifecycle, `TurnLoopAutomata` walks one player's turn through its phases.
 *
 * Both are exercised the way CoreLoop does it — a bus event goes through the
 * event adapter, which turns it into actions the machine then dispatches.
 */

const ME = 'player-me';
const OPPONENT = 'player-other';
const MATCH = 'match-1';

type Fsm = GameLoopAutomata | TurnLoopAutomata;

function dispatch(fsm: Fsm, event: number, meta: Record<string, unknown> | null = null) {
	const actions = fsm.eventAdapter?.handleEvent({ event, meta }) ?? [];
	for (const action of actions) fsm.dispatch(action);
}

const contextOf = (fsm: Fsm) => fsm.getContext()?.context ?? {};

beforeEach(() => {
	setCurrentProfile({ playerId: ME, nickname: 'Me' });
});

describe('game loop FSM — match lifecycle', () => {
	/** A match dealt and started, which most cases below need as a starting point. */
	function startedMatch(playerCount = 3) {
		const fsm = new GameLoopAutomata();
		dispatch(fsm, gameEvents.match_created, { matchId: MATCH, winLimit: 208, playerCount });
		dispatch(fsm, gameEvents.match_started, null);
		return fsm;
	}

	it('waits in PLANNED until a match is dealt', () => {
		expect(new GameLoopAutomata().state).toBe(gameStates.PLANNED);
	});

	/**
	 * Dealing is one atomic step in the model (`createMatch`), so the two rolling
	 * states are pass-through: they stay in the diagram for the setup reveal to
	 * hook, but the machine must not stall in them.
	 */
	it('passes through the rolling states and lands in SETUP', () => {
		const fsm = new GameLoopAutomata();
		dispatch(fsm, gameEvents.match_created, { matchId: MATCH, winLimit: 208, playerCount: 3 });

		expect(fsm.state).toBe(gameStates.SETUP);
		expect(contextOf(fsm)).toMatchObject({ matchId: MATCH, winLimit: 208, playerCount: 3 });
	});

	it('starts the match on match_started', () => {
		const fsm = startedMatch();
		expect(fsm.state).toBe(gameStates.IN_PROGRESS);
	});

	it('tracks whose turn it is while the match runs', () => {
		const fsm = startedMatch();
		dispatch(fsm, gameEvents.turn_started, { activePlayerId: OPPONENT, turnNumber: 1 });

		expect(fsm.state).toBe(gameStates.IN_PROGRESS);
		expect(contextOf(fsm)).toMatchObject({ activePlayerId: OPPONENT, turnNumber: 1 });
	});

	it('keeps running while nobody has reached the Win Limit', () => {
		const fsm = startedMatch();
		dispatch(fsm, gameEvents.turn_ended, { coins: 12, winLimit: 208, deckEmpty: 0 });

		expect(fsm.state).toBe(gameStates.IN_PROGRESS);
	});

	it('enters the endgame when a player reaches the Win Limit', () => {
		const fsm = startedMatch();
		dispatch(fsm, gameEvents.turn_ended, { coins: 208, winLimit: 208, deckEmpty: 0 });

		expect(fsm.state).toBe(gameStates.LAST_TURN);
	});

	it('enters the endgame when the Deck runs out, even with nobody near the limit', () => {
		const fsm = startedMatch();
		dispatch(fsm, gameEvents.turn_ended, { coins: 3, winLimit: 208, deckEmpty: 1 });

		expect(fsm.state).toBe(gameStates.LAST_TURN);
	});

	/**
	 * The rulebook gives *every* player after the trigger one more turn. The
	 * design diagram ended the match on the first `TURN_END` in LAST_TURN, which
	 * would cut a 3+ player table short — the endgame now runs until the host
	 * says the match is over.
	 */
	it('lets every remaining player take their last turn', () => {
		const fsm = startedMatch(4);
		dispatch(fsm, gameEvents.turn_ended, { coins: 208, winLimit: 208, deckEmpty: 0 });
		expect(fsm.state).toBe(gameStates.LAST_TURN);

		for (let turn = 2; turn <= 4; turn++) {
			dispatch(fsm, gameEvents.turn_started, { activePlayerId: OPPONENT, turnNumber: turn });
			dispatch(fsm, gameEvents.turn_ended, { coins: 30, winLimit: 208, deckEmpty: 0 });
			expect(fsm.state).toBe(gameStates.LAST_TURN);
		}

		dispatch(fsm, gameEvents.match_ended, { scoreBoard: { [ME]: 208 } });
		expect(fsm.state).toBe(gameStates.FINISHED);
	});

	it('finishes with the score board', () => {
		const fsm = startedMatch();
		dispatch(fsm, gameEvents.match_ended, { scoreBoard: { [ME]: 210, [OPPONENT]: 190 } });

		expect(fsm.state).toBe(gameStates.FINISHED);
		expect(contextOf(fsm)).toMatchObject({ scoreBoard: { [ME]: 210, [OPPONENT]: 190 } });
	});

	it('can be abandoned before it ever starts', () => {
		const fsm = new GameLoopAutomata();
		dispatch(fsm, gameEvents.match_ended, { scoreBoard: 0 });

		expect(fsm.state).toBe(gameStates.FINISHED);
	});
});

describe('turn loop FSM — one player through the phases', () => {
	const PHASE_ORDER = [
		turnStates.HARVEST,
		turnStates.SHOPPING,
		turnStates.TRADE,
		turnStates.PLAYING,
		turnStates.FERTILIZE,
		turnStates.CALCULATION,
	];

	function myTurn() {
		const fsm = new TurnLoopAutomata();
		dispatch(fsm, turnEvents.turn_started, { activePlayerId: ME, turnNumber: 1 });
		return fsm;
	}

	it('idles in WAITING before any turn starts', () => {
		expect(new TurnLoopAutomata().state).toBe(turnStates.WAITING);
	});

	it('starts the phase sequence when the turn is mine', () => {
		const fsm = myTurn();

		expect(fsm.state).toBe(turnStates.HARVEST);
		expect(contextOf(fsm)).toMatchObject({ activePlayerId: ME, turnNumber: 1 });
	});

	/**
	 * `turn_started` is broadcast to everyone, so the same machine runs on every
	 * client — this is the line between "me" and "the active player".
	 */
	it('stays in WAITING when the turn belongs to somebody else', () => {
		const fsm = new TurnLoopAutomata();
		dispatch(fsm, turnEvents.turn_started, { activePlayerId: OPPONENT, turnNumber: 1 });

		expect(fsm.state).toBe(turnStates.WAITING);
	});

	it('walks the phases in the order the rulebook lists them', () => {
		const fsm = myTurn();
		const visited = [fsm.state];

		for (let step = 1; step < PHASE_ORDER.length; step++) {
			dispatch(fsm, turnEvents.turn_phase_ended, null);
			visited.push(fsm.state);
		}

		expect(visited).toEqual(PHASE_ORDER);
	});

	it('hands the turn back and waits for the next one', () => {
		const fsm = myTurn();
		for (let step = 1; step < PHASE_ORDER.length; step++) dispatch(fsm, turnEvents.turn_phase_ended, null);
		expect(fsm.state).toBe(turnStates.CALCULATION);

		dispatch(fsm, turnEvents.turn_ended, { lastTurn: 0 });
		expect(fsm.state).toBe(turnStates.WAITING);

		dispatch(fsm, turnEvents.turn_started, { activePlayerId: ME, turnNumber: 4 });
		expect(fsm.state).toBe(turnStates.HARVEST);
		expect(contextOf(fsm)).toMatchObject({ turnNumber: 4 });
	});

	it('stops for good when the host says that was the final turn', () => {
		const fsm = myTurn();
		for (let step = 1; step < PHASE_ORDER.length; step++) dispatch(fsm, turnEvents.turn_phase_ended, null);

		dispatch(fsm, turnEvents.turn_ended, { lastTurn: 1 });
		expect(fsm.state).toBe(turnStates.FINISHED);
	});

	it('ignores phase advances while waiting out an opponent turn', () => {
		const fsm = new TurnLoopAutomata();
		dispatch(fsm, turnEvents.turn_started, { activePlayerId: OPPONENT, turnNumber: 1 });
		dispatch(fsm, turnEvents.turn_phase_ended, null);
		dispatch(fsm, turnEvents.turn_phase_ended, null);

		expect(fsm.state).toBe(turnStates.WAITING);
	});

	it('finishes a player who never got to act when the match ends', () => {
		const fsm = new TurnLoopAutomata();
		dispatch(fsm, turnEvents.match_ended, { scoreBoard: 0 });

		expect(fsm.state).toBe(turnStates.FINISHED);
	});
});

/**
 * The cases above call the event adapter directly, which would still pass if a
 * diagram declared no `subscribe/` notes at all. Registering on a real CoreLoop
 * is what proves the adapter reports those events to the bus — the wiring
 * `startYantrixCore` depends on.
 */
describe('match engine on the CoreLoop bus', () => {
	/**
	 * The bus finishes an event asynchronously: every subscriber returns a promise
	 * of follow-up events, and until it settles `dispatch` only queues. So a
	 * producer cannot fire two events back to back and assume both landed — which
	 * is exactly what the host will be doing in phase 3 (`turn_started` then
	 * `turn_phase_ended`).
	 */
	const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

	it('drives both machines from one dispatched event', async () => {
		const loop = new CoreLoop<number, Record<number, unknown>>();
		const gameFsm = new GameLoopAutomata();
		const turnFsm = new TurnLoopAutomata();
		loop.registerAutomata(gameFsm);
		loop.registerAutomata(turnFsm);
		loop.start();

		loop.getBus().dispatch({
			event: gameEvents.match_created,
			meta: { matchId: MATCH, winLimit: 250, playerCount: 2 },
		});
		await settle();
		expect(gameFsm.state).toBe(gameStates.SETUP);

		loop.getBus().dispatch({ event: gameEvents.match_started, meta: null });
		await settle();
		expect(gameFsm.state).toBe(gameStates.IN_PROGRESS);

		// One broadcast, two machines: the match notes whose turn it is, and the
		// turn machine starts walking phases because that player is us.
		loop.getBus().dispatch({
			event: gameEvents.turn_started,
			meta: { activePlayerId: ME, turnNumber: 1 },
		});
		await settle();
		expect(gameFsm.state).toBe(gameStates.IN_PROGRESS);
		expect(turnFsm.state).toBe(turnStates.HARVEST);

		loop.getBus().dispatch({
			event: gameEvents.turn_ended,
			meta: { activePlayerId: ME, coins: 250, winLimit: 250, deckEmpty: 0, lastTurn: 0 },
		});
		await settle();
		expect(gameFsm.state).toBe(gameStates.LAST_TURN);

		loop.stop();
	});
});

describe('the two machines share one event vocabulary', () => {
	/**
	 * Both subscribe to `turn_started`, `turn_ended` and `match_ended`. Yantrix
	 * registers event names globally, so the ids must coincide — if they drifted,
	 * one machine would silently never hear the event.
	 */
	it.each(['turn_started', 'turn_ended', 'match_ended'] as const)('agrees on the id of %s', (name) => {
		expect(gameEvents[name]).toBe(turnEvents[name]);
	});
});
