import { describe, expect, it } from '@jest/globals';
import { CoreLoop } from '@yantrix/core';
import { type AppModel, asPlayerId, createGameEffectMatrix, emptyAppModel } from '~/entities/game';
import { attachEffectLayer, ModelStore } from '~/shared/lib/model';
import TurnLoopAutomata, {
	eventDictionary as turnLoopEvents,
	statesDictionary as turnLoopStates,
} from '~/shared/lib/fsm/game/TurnLoopAutomata';
import { setCurrentProfile } from '~/entities/profile/currentProfile';
import { GameDomainEvents } from '~/app/yantrix/gameDomainEvents';
import { buildPhaseFacts } from '~/app/yantrix/data/destinations/phaseFacts';
import { testMatch } from '../game/harness';

/**
 * The ordering the whole phase-boundary design rests on.
 *
 * One `turn_phase_ended` does two things: the turn machine advances and emits
 * `shopping_phase_opened`, and the Effect Layer commits `advancePhase` to the
 * model. If the emitted event came back before the commit, the facts destination
 * would read the *previous* phase and open the wrong machine — SHOPPING would be
 * handed HARVEST's board.
 *
 * `EventBus._processEvents` makes that impossible: every synchronous subscriber
 * runs before `Promise.all(promiseStack)` puts emitted events back on the stack.
 * This proves it on a real loop rather than trusting the reading.
 */

const ME = asPlayerId('p-one');

/** The bus settles asynchronously — a dispatch only queues until then. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('the model is already in the new phase when the facts are read', () => {
	it('hands SHOPPING the shopping board, not the one HARVEST left behind', async () => {
		setCurrentProfile({ playerId: ME, nickname: 'me' });

		const store = new ModelStore<AppModel>(emptyAppModel());
		store.commit({
			match: testMatch({
				players: [
					{
						id: 'p-one',
						hand: ['WHEAT'],
						coins: 5,
						fertilizers: 2,
						beds: [{ crop: { defId: 'WHEAT', reapTimer: 0 } }],
					},
					{ id: 'p-two' },
				],
				phase: 'HARVEST',
				active: 'p-one',
				market: ['WHEAT', 'LUCKY_FIND'],
			}).model,
		});

		const loop = new CoreLoop<number, Record<number, unknown>>();
		const turn = new TurnLoopAutomata();
		loop.registerAutomata(turn);

		// Same order as `startYantrixCore`: automata first, effects after, because
		// bus subscribers fire in subscription order.
		const detach = attachEffectLayer({
			bus: loop.getBus(),
			store,
			matrix: createGameEffectMatrix(GameDomainEvents),
		});
		loop.start();

		loop.getBus().dispatch({
			event: turnLoopEvents.turn_started,
			meta: { activePlayerId: ME, turnNumber: 1 },
		});
		await settle();
		expect(turn.state).toBe(turnLoopStates.HARVEST);

		// What a facts destination would see if it read the model right now.
		const seen: Array<{ phase: string; open: string }> = [];
		const record = () => {
			const match = store.get().match;
			if (!match) return;
			const facts = buildPhaseFacts(match.turn.phase, match, ME);
			if (facts) seen.push({ phase: match.turn.phase, open: facts.open });
		};

		loop.getBus().dispatch({ event: turnLoopEvents.turn_phase_ended, meta: null });
		await settle();
		record();

		expect(turn.state).toBe(turnLoopStates.SHOPPING);
		expect(store.get().match?.turn.phase).toBe('SHOPPING');
		expect(seen).toEqual([{ phase: 'SHOPPING', open: 'shopping_phase_started' }]);

		detach();
	});
});
