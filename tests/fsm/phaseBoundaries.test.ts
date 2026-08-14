import { describe, expect, it } from '@jest/globals';
import { asPlayerId, type TurnPhase } from '~/entities/game';
import TurnLoopAutomata, {
	eventDictionary as turnLoopEvents,
	statesDictionary as turnLoopStates,
} from '~/shared/lib/fsm/game/TurnLoopAutomata';
import { setCurrentProfile } from '~/entities/profile/currentProfile';
import { buildPhaseFacts } from '~/app/yantrix/data/destinations/phaseFacts';
import { testMatch } from '../game/harness';

/**
 * Where a phase begins.
 *
 * It used to be a diff: `phaseSelection.ts` kept a boolean per signal and
 * announced the edges as the model moved. But a phase boundary *is* a
 * transition — `TurnLoopAutomata` walks HARVEST → SHOPPING → TRADE → PLAYING →
 * FERTILIZE and only enters them when the turn is this peer's — so the machine
 * announces it and all that is left is reading the facts its guard needs.
 */

const ME = asPlayerId('p-one');
const RIVAL = asPlayerId('p-two');

/** What the CoreLoop collects after a dispatch (`CoreLoop.ts:142`). */
function emissionsOf(turn: TurnLoopAutomata): Array<{ event: number; meta: unknown }> {
	return (turn.eventAdapter?.handleTransition(turn.getContext()) ?? []) as Array<{
		event: number;
		meta: unknown;
	}>;
}

function dispatch(turn: TurnLoopAutomata, event: number, meta: Record<string, unknown> | null) {
	const actions = turn.eventAdapter?.handleEvent({ event, meta }) ?? [];
	for (const action of actions) turn.dispatch(action);
}

/** A turn machine that has just entered HARVEST on this peer's turn. */
function openTurn() {
	setCurrentProfile({ playerId: ME, nickname: 'me' });
	const turn = new TurnLoopAutomata();
	dispatch(turn, turnLoopEvents.turn_started, { activePlayerId: ME, turnNumber: 3 });
	return turn;
}

describe('the turn machine announces its own phases', () => {
	it('emits the opening of each phase as it walks the turn', () => {
		const turn = openTurn();
		expect(turn.state).toBe(turnLoopStates.HARVEST);
		expect(emissionsOf(turn).map((e) => e.event)).toEqual([turnLoopEvents.harvest_phase_opened]);

		const walk: Array<[number, number]> = [
			[turnLoopStates.SHOPPING, turnLoopEvents.shopping_phase_opened],
			[turnLoopStates.TRADE, turnLoopEvents.trade_phase_opened],
			[turnLoopStates.PLAYING, turnLoopEvents.play_phase_opened],
			[turnLoopStates.FERTILIZE, turnLoopEvents.fertilize_phase_opened],
		];

		for (const [state, opened] of walk) {
			dispatch(turn, turnLoopEvents.turn_phase_ended, null);
			expect(turn.state).toBe(state);
			expect(emissionsOf(turn).map((e) => e.event)).toEqual([opened]);
		}
	});

	/**
	 * Trap 2: a state's reducer replaces the context rather than merging into it,
	 * so every phase note has to re-state the identity. Without that, SHOPPING
	 * would open for `activePlayerId: null` on turn 0.
	 */
	it('carries the turn identity through every phase', () => {
		const turn = openTurn();

		for (let phase = 0; phase < 4; phase++) {
			dispatch(turn, turnLoopEvents.turn_phase_ended, null);
			const [emitted] = emissionsOf(turn);
			expect(emitted?.meta).toEqual({ activePlayerId: ME, turnNumber: 3 });
		}
	});

	it('says nothing on an opponent turn', () => {
		setCurrentProfile({ playerId: ME, nickname: 'me' });
		const turn = new TurnLoopAutomata();
		dispatch(turn, turnLoopEvents.turn_started, { activePlayerId: RIVAL, turnNumber: 4 });

		expect(turn.state).toBe(turnLoopStates.WAITING);
		expect(emissionsOf(turn)).toEqual([]);
	});
});

describe('buildPhaseFacts', () => {
	const board = (phase: TurnPhase) =>
		testMatch({
			players: [
				{
					id: 'p-one',
					hand: ['WHEAT', 'LUCKY_FIND'],
					coins: 5,
					fertilizers: 2,
					beds: [{ crop: { defId: 'WHEAT', reapTimer: 0 } }],
				},
				{ id: 'p-two' },
			],
			phase,
			active: 'p-one',
			market: ['WHEAT', 'LUCKY_FIND'],
		}).model;

	it('reads what each phase guard needs off the model', () => {
		expect(buildPhaseFacts('HARVEST', board('HARVEST'), ME)).toMatchObject({
			open: 'harvest_phase_started',
			meta: { viewerId: ME, crops: [{ bedIndex: 0, reapTimer: 0 }] },
			window: '1:HARVEST',
		});

		expect(buildPhaseFacts('SHOPPING', board('SHOPPING'), ME)).toMatchObject({
			open: 'shopping_phase_started',
			meta: { viewerId: ME, coins: 5 },
		});

		const trade = buildPhaseFacts('TRADE', board('TRADE'), ME);
		expect(trade?.open).toBe('trade_phase_started');
		expect((trade?.meta as { hand: unknown[] }).hand).toHaveLength(2);

		expect(buildPhaseFacts('FERTILIZE', board('FERTILIZE'), ME)).toMatchObject({
			open: 'fertilize_phase_started',
			meta: { viewerId: ME, fertilizers: 2 },
		});
	});

	it('prices only what can actually be bought', () => {
		const packet = buildPhaseFacts('SHOPPING', board('SHOPPING'), ME);
		const { marketPrices } = packet?.meta as { marketPrices: number[] };
		// Two cards on the shelf, four empty slots — and `LUCKY_FIND` is an Action
		// Card, which the Market does price.
		expect(marketPrices).toHaveLength(2);
		expect(marketPrices.every((price) => price > 0)).toBe(true);
	});

	it('has nothing to say outside the five picking phases', () => {
		expect(buildPhaseFacts('WAITING', board('WAITING'), ME)).toBeNull();
		expect(buildPhaseFacts('CALCULATION', board('CALCULATION'), ME)).toBeNull();
	});

	it('has nothing to say for a browser that is only watching', () => {
		expect(buildPhaseFacts('SHOPPING', board('SHOPPING'), null)).toBeNull();
		expect(buildPhaseFacts('SHOPPING', null, ME)).toBeNull();
	});

	/** The window is what stops trap 7 from reopening a phase mid-selection. */
	it('names the same window for the same phase of the same turn', () => {
		const match = board('SHOPPING');
		expect(buildPhaseFacts('SHOPPING', match, ME)?.window).toBe(
			buildPhaseFacts('SHOPPING', match, ME)?.window,
		);
		expect(buildPhaseFacts('SHOPPING', match, ME)?.window).not.toBe(
			buildPhaseFacts('PLAYING', match, ME)?.window,
		);
	});
});
