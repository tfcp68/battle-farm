import { beforeEach, describe, expect, test,jest, } from '@jest/globals';
import {
	TFertilizeAction,
	TFertilizePhase,
} from '~/src/types/fsm/slices/fertilize';
import { gameContainerFixture } from '../fixtures/gameFixtures';
import * as functions from '~/src/reducers/fertilize';
import {TTurnBasedReducer, TTurnPhase, TTurnSubContext, TTurnSubPayload} from '~/src/types/fsm';
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
	numberOfFunctionCalls?: number
	spiedFunction?:  jest.SpiedFunction<TTurnBasedReducer<TTurnPhase.FERTILIZE, TFertilizePhase.IDLE, TFertilizeAction>>
};


function defaultParamsDt() {
	return {
		action: TFertilizeAction.HOVER,
		game: gameContainerFixture(),
		context: defaultContextFixture(),
		payload: defaultPayloadFixture(),
	};
}

function defaultContextFixture<T extends TFertilizePhase>(
	props: Partial<
		TTurnSubContext<TTurnPhase.FERTILIZE, T>
	> = {}
) {
	const defaults: TTurnSubContext<
		TTurnPhase.FERTILIZE,
		any
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

let defaultDt: testBody['dt'] = defaultParamsDt();
let defaultGame = defaultDt.game;
let defaultContext = defaultDt.context;

let tests: testBody[] = [
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
		msg: 'ignores FERTILIZE',
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



/**
 * https://github.com/octaharon/battle-farm/blob/main/docs/diagrams.md#fertilizing
 */
describe('FSM/Fertilizing: IDLE', () => {

	beforeEach(() => {
		defaultDt = defaultParamsDt();
		defaultGame = defaultDt.game;
		defaultContext = defaultDt.context;
		jest.clearAllMocks()
	});


	function makeTest(tests: testBody[]) {
		for (let i = 0; i < tests.length; i++) {
			test(tests[i]?.msg, () => {
				expect(functions.reducer_Fertilize_IDLE(tests[i].dt)).toMatchObject(
					tests[i].res
				);
			});
		}
	}


	makeTest(tests);
});
describe('FSM/Fertilizing: Root Reducer', () => {
	const spiedFunction = jest.spyOn(functions, 'reducer_Fertilize_IDLE');
	let defaultDt: testBody['dt'] = defaultParamsDt();
	let defaultGame = defaultDt.game;
	let defaultContext = defaultDt.context;

	beforeEach(() => {
		defaultDt = defaultParamsDt();
		defaultGame = defaultDt.game;
		defaultContext = defaultDt.context;
		jest.clearAllMocks()
	});

	function makeTest(tests: testBody[]) {
		for (let i = 0; i < tests.length; i++) {
			test(tests[i]?.msg, () => {
				functions.turnPhaseReducer_Fertilize(tests[i].dt);
				const calls = tests[i].numberOfFunctionCalls;
				const spiedFunction = tests[i].spiedFunction;
				if (calls && spiedFunction){
					expect(spiedFunction).toBeCalledTimes(calls);
					expect(spiedFunction).toBeCalledWith(tests[i].dt);
				}
			});
		}
	}

	tests.map((test)=>{
		test.spiedFunction = spiedFunction
		test.numberOfFunctionCalls = 1
		return test
	})

	tests.push(
		{
		msg: 'ignores TFertilizePhase.FINISHED',
		dt: {
			...defaultDt,
		},
		res:{
			context: {
				index: defaultDt.payload.index,
				subPhase: TFertilizePhase.FINISHED,
			},
			game: defaultGame,
		},
		numberOfFunctionCalls:0,
		spiedFunction:spiedFunction
		},
		{
			msg: 'ignores TFertilizePhase.CROP_CONFIRM',
			dt: {
				...defaultDt,
			},
			res:{
				context: {
					index: defaultDt.payload.index,
					subPhase: TFertilizePhase.CROP_CONFIRM,
				},
				game: defaultGame,
			},
			numberOfFunctionCalls:1,
			spiedFunction:spiedFunction
		}
	)

	makeTest(tests)
});
