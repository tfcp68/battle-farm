import { describe, expect, it } from '@jest/globals';
import { statesDictionary as shoppingStates } from '~/shared/lib/fsm/game/ShoppingAutomata';
import { shoppingStateName, stateNamesOf } from '~/shared/lib/fsm/selectors';

/**
 * The generator already knows every state's name; it just exposes the mapping
 * one way round. Inverting it is the whole job — and doing it generically is
 * what stops a state added to a diagram from silently reading as `idle`, which
 * is what the five hand-written tables this replaces used to do.
 */
describe('stateNamesOf', () => {
	it('names every state a diagram declares', () => {
		for (const [name, id] of Object.entries(shoppingStates)) {
			expect(shoppingStateName(id)).toBe(name);
		}
	});

	it('answers null for "no machine yet" rather than guessing', () => {
		expect(shoppingStateName(null)).toBeNull();
	});

	it('answers null for an id no diagram declares', () => {
		expect(shoppingStateName(-1)).toBeNull();
	});

	it('works for any dictionary, not just the ones with a ready-made reader', () => {
		const name = stateNamesOf({ ALPHA: 10, BETA: 20 });
		expect(name(20)).toBe('BETA');
		expect(name(30)).toBeNull();
	});
});
