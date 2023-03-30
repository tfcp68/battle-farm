import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as functions from '~/src/reducers/fertilize';
import {
	TTurnBasedReducer,
	TTurnPhase,
	TTurnSubAction,
	TTurnSubPhase,
	TTurnSubphaseAction,
	TTurnSubphaseContext,
} from '~/src/types/fsm';
import { TFertilizeAction, TFertilizePhase } from '~/src/types/fsm/slices/fertilize';
import { isFertilizeContext, isFertilizePayload } from '~/src/types/guards/turnPhases';
import { sampleRange } from '~/src/utils/sampleRange';

type testBody<T extends TTurnPhase, S extends TTurnSubPhase<T>, A extends TTurnSubAction<T>> = {
	readonly msg: string;
	readonly input: Parameters<TTurnBasedReducer<T, S, A>>;
	readonly output: ReturnType<TTurnBasedReducer<T, S, A>>;
	numberOfFunctionCalls?: number;
};

function defaultTestInput<
	T extends TTurnPhase,
	S extends TTurnSubPhase<T> = TTurnSubPhase<T>,
	A extends TTurnSubAction<T> = TTurnSubAction<T>
>(phase: T, action: A, subPhase: S): testBody<T, S, A>['input'] {
	const payload = defaultPayloadFixture<T, A>({ action });
	const context = defaultContextFixture<T, S>({ subPhase });
	const fixture = {
		...payload,
		...context,
	};
	return [fixture];
}

function defaultContextFixture<T extends TTurnPhase, S extends TTurnSubPhase<T>>(
	props: Partial<TTurnSubphaseContext<T, S>> = {}
): TTurnSubphaseContext<T, S> {
	if (isFertilizeContext(null)(props))
		return Object.assign(
			{},
			{
				context: {
					index: sampleRange(0, 100),
				},
				subPhase: TFertilizePhase.IDLE,
			},
			props ?? {}
		);
	return Object.assign(props ?? {}, { subPhase: 0, context: null });
}

function defaultPayloadFixture<T extends TTurnPhase, A extends TTurnSubAction<T>>(
	props: Partial<TTurnSubphaseAction<T, A>> = {}
): TTurnSubphaseAction<T, A> {
	for (const action of [TFertilizeAction.SKIP, TFertilizeAction.RESET, TFertilizeAction.CANCEL_SELECTION])
		if (isFertilizePayload(action)(props))
			return Object.assign(
				{},
				{
					action,
					payload: null,
				},
				props ?? {}
			);
	if (isFertilizePayload(null)(props))
		return Object.assign(
			{},
			{
				action: TFertilizeAction.HOVER,
				payload: {
					index: sampleRange(100),
				},
			},
			props ?? {}
		);
	return Object.assign(props ?? {}, { action: 0, payload: null });
}

function setupFixtures<
	T extends TTurnPhase,
	S extends TTurnSubPhase<T> = TTurnSubPhase<T>,
	A extends TTurnSubAction<T> = TTurnSubAction<T>
>(phase: T, action: A, subPhase: S) {
	const defaultInput = defaultTestInput(phase, action, subPhase);
	const originalInput: typeof defaultInput = JSON.parse(JSON.stringify(defaultInput));
	const originalContext: testBody<T, S, A>['output'] = {
		context: originalInput[0]?.context,
		subPhase: originalInput[0]?.subPhase,
	};
	return {
		defaultInput,
		originalInput,
		originalContext,
	};
}

/**
 * Unit tests for
 * https://github.com/octaharon/battle-farm/blob/main/docs/diagrams.md#fertilizing
 */

const testCasesIDLE: Array<testBody<TTurnPhase.FERTILIZE, TFertilizePhase.IDLE, TFertilizeAction>> = [
	{
		msg: 'IDLE-->IDLE: HOVER (index)',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.HOVER,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: Object.assign({}, originalContext, {
					context: {
						...originalContext.context,
						index: originalInput[0].payload?.index,
					},
				}),
			};
		})(),
	},
	{
		msg: 'IDLE-->FINISHED: SKIP',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.SKIP,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: Object.assign({}, originalContext, {
					context: null,
					subPhase: TFertilizePhase.FINISHED,
				}),
			};
		})(),
	},
	{
		msg: 'IDLE-->CROP_CONFIRM: CHOOSE_CROP (index)',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.CHOOSE_CROP,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: Object.assign({}, originalContext, {
					context: {
						index: defaultInput[0].payload?.index,
					},
					subPhase: TFertilizePhase.CROP_CONFIRM,
				}),
			};
		})(),
	},
	{
		msg: 'IDLE-->IDLE: FERTILIZE ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.FERTILIZE,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'IDLE-->IDLE: CANCEL_SELECTION ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.CANCEL_SELECTION,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'IDLE-->IDLE: RESET ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.RESET,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
];
const testCasesFINISHING: Array<testBody<TTurnPhase.FERTILIZE, TFertilizePhase.FINISHED, TFertilizeAction>> = [
	{
		msg: 'FINISHED-->IDLE: RESET',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.RESET,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: Object.assign({}, originalContext, {
					subPhase: TFertilizePhase.FINISHED,
				}),
			};
		})(),
	},
	{
		msg: 'FINISHED-->FINISHED: HOVER ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.RESET,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'FINISHED-->FINISHED: CHOOSE_CROP ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.RESET,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'FINISHED-->FINISHED: FERTILIZE ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.RESET,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'FINISHED-->FINISHED: CANCEL_SELECTION ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.RESET,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'FINISHED-->FINISHED: SKIP ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.RESET,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
];
describe('FSM/Fertilizing/IDLE', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.clearAllTimers();
	});

	((tests: Array<testBody<TTurnPhase.FERTILIZE, TFertilizePhase.IDLE, TFertilizeAction>>) => {
		for (let i = 0; i < tests.length; i++) {
			const { input, output, msg } = tests[i];
			const originalInput: typeof input = JSON.parse(JSON.stringify(input));
			const result = functions.reducer_Fertilize_IDLE.apply(null, input);

			test(`${msg} ::: Works as intended`, () => {
				expect(result).toMatchObject(output);
			});
			test(`${msg} ::: Does not mutate input data`, () => {
				expect(input).toMatchObject(originalInput);
			});
		}
	})(testCasesIDLE);
});

describe('FSM/Fertilizing/Root Reducer', () => {
	((tests: Array<testBody<TTurnPhase.FERTILIZE, TFertilizePhase, TFertilizeAction>>) => {
		for (let i = 0; i < tests.length; i++) {
			const { input, output, msg, numberOfFunctionCalls = 0 } = tests[i];
			const originalInput: typeof input = JSON.parse(JSON.stringify(input));

			test(`${msg} ::: does ${numberOfFunctionCalls} calls of IDLE reducer`, () => {
				const spiedFunction = jest.spyOn(functions, 'reducer_Fertilize_IDLE');
				const result = functions.turnPhaseReducer_Fertilize.apply(null, input);
				if (spiedFunction && Number.isFinite(numberOfFunctionCalls)) {
					expect(spiedFunction).toBeCalledTimes(numberOfFunctionCalls);
					if (numberOfFunctionCalls) expect(spiedFunction).toBeCalledWith(...input);
				}
				jest.restoreAllMocks();
			});

			test(`${msg} ::: does not mutate input`, () => {
				const result = functions.turnPhaseReducer_Fertilize.apply(null, input);
				expect(input).toMatchObject(originalInput);
			});
		}
	})([
		...testCasesIDLE.map((t) => ({
			...t,
			numberOfFunctionCalls: 1,
		})),
		{
			msg: 'in FINISHED state',
			numberOfFunctionCalls: 0,
			...(() => {
				const { defaultInput, originalInput, originalContext } = setupFixtures(
					TTurnPhase.FERTILIZE,
					TFertilizeAction.SKIP,
					TFertilizePhase.FINISHED
				);
				return {
					input: defaultInput,
					output: originalContext,
				};
			})(),
		},
		{
			msg: 'in CROP_CONFIRM state',
			numberOfFunctionCalls: 0,
			...(() => {
				const { defaultInput, originalInput, originalContext } = setupFixtures(
					TTurnPhase.FERTILIZE,
					TFertilizeAction.SKIP,
					TFertilizePhase.CROP_CONFIRM
				);
				return {
					input: defaultInput,
					output: originalContext,
				};
			})(),
		},
	]);
});
