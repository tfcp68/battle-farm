import {beforeEach, describe, expect, jest, test} from '@jest/globals';
import * as functions from '~/src/reducers/fertilize';
import {getFertilizeReducer} from '~/src/reducers/fertilize';
import {TTurnPhase} from '~/src/types/fsm';
import {TFertilizeAction, TFertilizePhase} from '~/src/types/fsm/slices/fertilize';
import {TReducerTestCase} from '../types';
import {getStateLabel, rootReducerCases, stateReducerCases} from './cases/fertilize/rootReducer.cases';
import {isFertilizeSubphase} from '~/src/types/guards/turnPhases';

/**
 * Unit tests for
 * https://github.com/octaharon/battle-farm/blob/main/docs/diagrams.md#fertilizing
 */

beforeEach(() => {
	jest.clearAllMocks();
	jest.clearAllTimers();
});

for (const currentPhase of Object.keys(stateReducerCases)
	.map((t) => parseInt(t))
	.filter(isFertilizeSubphase())) {
	const cases = stateReducerCases[currentPhase];

	describe(`FSM/Fertilizing/${getStateLabel(currentPhase)}`, () => {
		for (let i = 0; i < cases.length; i++) {
			const { input, output, msg } = cases[i];
			const originalInput: typeof input = JSON.parse(JSON.stringify(input));
			const result = getFertilizeReducer(currentPhase).apply(null, input);

			test(`${msg} ::: Works as intended`, () => {
				expect(result).toMatchObject(output);
			});
			test(`${msg} ::: Does not mutate input data`, () => {
				expect(input).toMatchObject(originalInput);
			});
		}
	});
}
describe('FSM/Fertilizing/Root Reducer', () => {
	((tests: Array<TReducerTestCase<TTurnPhase.FERTILIZE, TFertilizePhase, TFertilizeAction>>) => {
		for (let i = 0; i < tests.length; i++) {
			const { input, label = TFertilizePhase.IDLE, msg, numberOfFunctionCalls = 0 } = tests[i];
			const originalInput: typeof input = JSON.parse(JSON.stringify(input));

			test(`${msg} ::: Root reducer calls ${getStateLabel(
				label
			)} Reducer exactly ${numberOfFunctionCalls} times `, () => {
				const spiedFunction = jest.spyOn(functions.reducersMap, label);
				expect(typeof spiedFunction).toBe('function');
				functions.turnPhaseReducer_Fertilize.apply(null, input);
				expect(spiedFunction).toBeCalledTimes(numberOfFunctionCalls);
				if (numberOfFunctionCalls) expect(spiedFunction).toBeCalledWith(...input);
			});

			test(`${msg} ::: Root Reducer does not mutate args`, () => {
				functions.turnPhaseReducer_Fertilize.apply(null, input);
				expect(input).toMatchObject(originalInput);
			});
		}
	})(rootReducerCases);
});
