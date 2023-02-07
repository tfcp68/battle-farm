import { describe, expect, test } from '@jest/globals';
import {
	TFertilizeAction,
	TFertilizePhase,
} from '~/src/types/fsm/slices/fertilize';
import { reducer_Fertilize_IDLE } from '~/src/reducers/fertilize';
import {
	TTurnBasedReducer,
	TTurnPhase,
	TTurnSubAction,
	TTurnSubPhase,
	TTurnSubphaseAction,
	TTurnSubphaseContext,
} from '~/src/types/fsm';
import { sampleRange } from '~/src/utils/sampleRange';
import {
	isFertilizeContext,
	isFertilizePayload,
} from '~/src/types/guards/turnPhases';

type testBody<
	T extends TTurnPhase,
	S extends TTurnSubPhase<T>,
	A extends TTurnSubAction<T>
> = {
	readonly msg: string;
	readonly input: Parameters<TTurnBasedReducer<T, S, A>>;
	readonly output: ReturnType<TTurnBasedReducer<T, S, A>>;
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

function defaultContextFixture<
	T extends TTurnPhase,
	S extends TTurnSubPhase<T>
>(props: Partial<TTurnSubphaseContext<T, S>> = {}): TTurnSubphaseContext<T, S> {
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

function defaultPayloadFixture<
	T extends TTurnPhase,
	A extends TTurnSubAction<T>
>(props: Partial<TTurnSubphaseAction<T, A>> = {}): TTurnSubphaseAction<T, A> {
	for (let action of [
		TFertilizeAction.SKIP,
		TFertilizeAction.RESET,
		TFertilizeAction.CANCEL_SELECTION,
	])
		if (isFertilizePayload(action)(props))
			return Object.assign(
				{},
				{
					action: action,
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
	const originalInput: typeof defaultInput = JSON.parse(
		JSON.stringify(defaultInput)
	);
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
 * https://github.com/octaharon/battle-farm/blob/main/docs/diagrams.md#fertilizing
 */
describe('FSM/Fertilizing: IDLE', () => {
	const tests: testBody<
		TTurnPhase.FERTILIZE,
		TFertilizePhase.IDLE,
		TFertilizeAction
	>[] = [
		{
			msg: 'IDLE-->IDLE: HOVER (index)',
			...(() => {
				const { defaultInput, originalInput, originalContext } =
					setupFixtures(
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
				const { defaultInput, originalInput, originalContext } =
					setupFixtures(
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
				const { defaultInput, originalInput, originalContext } =
					setupFixtures(
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
				const { defaultInput, originalInput, originalContext } =
					setupFixtures(
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
				const { defaultInput, originalInput, originalContext } =
					setupFixtures(
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
				const { defaultInput, originalInput, originalContext } =
					setupFixtures(
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

	/**
	 * Unit Tests
	 */
	((
		tests: testBody<
			TTurnPhase.FERTILIZE,
			TFertilizePhase.IDLE,
			TFertilizeAction
		>[]
	) => {
		for (let i = 0; i < tests.length; i++) {
			const { input, output, msg } = tests[i];
			const originalInput: typeof input = JSON.parse(
				JSON.stringify(input)
			);
			const result = reducer_Fertilize_IDLE.apply(null, input);

			test(`${msg}: Works as intended`, () => {
				expect(result).toMatchObject(output);
			});
			test(`${msg}: Does not mutate input data`, () => {
				expect(input).toMatchObject(originalInput);
			});
		}
	})(tests);
});

/*describe('FSM/Fertilizing: Root Reducer', () => {
	let defaultDt: testBody['input'] = defaultTestInput();
	let defaultGame = defaultDt.game;
	let defaultContext = defaultDt.context;

	beforeEach(() => {
		defaultDt = defaultTestInput();
		defaultGame = defaultDt.game;
		defaultContext = defaultDt.context;
	});

	function makeTest(tests: testBody[]) {
		for (let i = 0; i < tests.length; i++) {
			test(tests[i]?.msg, () => {
				expect(
					turnPhaseReducer_Fertilize(tests[i].input)
				).toMatchObject(tests[i].output);
			});
		}
	}

	const tests: testBody[] = [
		{
			msg: 'with action SKIP should return new context with another subPhase',
			dt: {
				...defaultDt,
				action: TFertilizeAction.SKIP,
			},
			res: {
				context: {
					subPhase: TFertilizePhase.FINISHED,
				},
				game: defaultGame,
			},
		},
		{
			msg: 'with action RESET should return defaultContextFixture',
			dt: {
				...defaultDt,
				action: TFertilizeAction.RESET,
			},
			res: {
				context: {
					...defaultContext,
				},
				game: defaultGame,
			},
		},
		{
			msg: 'with action FERTILIZE should return defaultContextFixture',
			dt: {
				...defaultDt,
				action: TFertilizeAction.FERTILIZE,
			},
			res: {
				context: {
					...defaultContext,
				},
				game: defaultGame,
			},
		},
		{
			msg: 'with action CHOOSE_CROP should return new context with another subPhase & index',
			dt: {
				...defaultDt,
				action: TFertilizeAction.CHOOSE_CROP,
			},
			res: {
				context: {
					...defaultContext,
					subPhase: TFertilizePhase.CROP_CONFIRM,
					context: {
						...defaultContext.context,
						index: defaultDt.payload.index,
					},
				},
				game: defaultGame,
			},
		},
		{
			msg: 'with action HOVER should return new context with another index',
			dt: {
				...defaultDt,
				action: TFertilizeAction.HOVER,
			},
			res: {
				context: {
					...defaultContext,
					context: {
						...defaultContext.context,
						index: defaultDt.payload.index,
					},
				},
				game: defaultGame,
			},
		},
		{
			msg: 'with action CANCEL_SELECTION should return defaultContextFixture',
			dt: {
				...defaultDt,
				action: TFertilizeAction.CANCEL_SELECTION,
			},
			res: {
				context: {
					...defaultContext,
				},
				game: defaultGame,
			},
		},
	];

	makeTest(tests);
});*/
