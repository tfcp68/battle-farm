import { beforeEach, describe, expect, test } from '@jest/globals';
import {
	TFertilizeAction,
	TFertilizePhase,
} from '~/src/types/fsm/slices/fertilize';
import { gameContainerFixture } from '../fixtures/gameFixtures';
import {
	reducer_Fertilize_IDLE,
	turnPhaseReducer_Fertilize,
} from '~/src/reducers/fertilize';
import { TTurnPhase, TTurnSubContext, TTurnSubPayload } from '~/src/types/fsm';
import { sampleRange } from '~/src/utils/sampleRange';

type testBody = {
	readonly msg: string;
	readonly dt: {
		action: TFertilizeAction;
		game: ReturnType<typeof gameContainerFixture>;
		context: ReturnType<typeof defaultContextFixture>;
		payload: ReturnType<typeof defaultPayloadFixture>;
	};
	readonly res: {
		game: ReturnType<typeof gameContainerFixture>;
		context: Partial<
			TTurnSubContext<
				TTurnPhase.FERTILIZE,
				| TFertilizePhase.IDLE
				| TFertilizePhase.CROP_CONFIRM
				| TFertilizePhase.FINISHED
			>
		>;
	};
};

function defaultParamsDt() {
	return {
		action: TFertilizeAction.HOVER,
		game: gameContainerFixture(),
		context: defaultContextFixture(),
		payload: defaultPayloadFixture(),
	};
}

function defaultContextFixture(
	props: Partial<
		TTurnSubContext<TTurnPhase.FERTILIZE, TFertilizePhase.IDLE>
	> = {}
) {
	const defaults: TTurnSubContext<
		TTurnPhase.FERTILIZE,
		TFertilizePhase.IDLE
	> = {
		index: sampleRange(0, 100),
		subPhase: TFertilizePhase.IDLE,
	};
	return { ...defaults, ...props };
}

function defaultPayloadFixture(props: Partial<TTurnSubPayload<any>> = {}) {
	const defaults: TTurnSubPayload<any> = {
		index: sampleRange(0, 100),
	};
	return { ...defaults, ...props };
}

/**
 * https://github.com/octaharon/battle-farm/blob/main/docs/diagrams.md#fertilizing
 */
describe('FSM/Fertilizing: IDLE', () => {
	let defaultDt: testBody['dt'] = defaultParamsDt();
	let defaultGame = defaultDt.game;
	let defaultContext = defaultDt.context;

	beforeEach(() => {
		defaultDt = defaultParamsDt();
		defaultGame = defaultDt.game;
		defaultContext = defaultDt.context;
	});

	function makeTest(tests: testBody[]) {
		for (let i = 0; i < tests.length; i++) {
			test(tests[i]?.msg, () => {
				expect(reducer_Fertilize_IDLE(tests[i].dt)).toMatchObject(
					tests[i].res
				);
			});
		}
	}

	const tests: testBody[] = [
		{
			msg: 'IDLE-->IDLE: HOVER (index)',
			dt: {
				...defaultDt,
			},
			res: {
				context: {
					...defaultContext,
					index: defaultDt.payload.index,
				},
				game: defaultGame,
			},
		},
		{
			msg: 'IDLE-->FINISHED: SKIP',
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
			msg: 'IDLE-->CROP_CONFIRM: CHOOSE_CROP (index)',
			dt: {
				...defaultDt,
				action: TFertilizeAction.CHOOSE_CROP,
			},
			res: {
				context: {
					...defaultContext,
					index: defaultDt.payload.index,
					subPhase: TFertilizePhase.CROP_CONFIRM,
				},
				game: defaultGame,
			},
		},
		{
			msg: 'ignores CROP_CONFIRM',
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
			msg: 'ignores CANCEL_SELECTION',
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
		{
			msg: 'ignores RESET',
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
	];
	makeTest(tests);
});

describe('FSM/Fertilizing: Root Reducer', () => {
	let defaultDt: testBody['dt'] = defaultParamsDt();
	let defaultGame = defaultDt.game;
	let defaultContext = defaultDt.context;

	beforeEach(() => {
		defaultDt = defaultParamsDt();
		defaultGame = defaultDt.game;
		defaultContext = defaultDt.context;
	});

	function makeTest(tests: testBody[]) {
		for (let i = 0; i < tests.length; i++) {
			test(tests[i]?.msg, () => {
				expect(turnPhaseReducer_Fertilize(tests[i].dt)).toMatchObject(
					tests[i].res
				);
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
					index: defaultDt.payload.index,
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
					index: defaultDt.payload.index,
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
});
