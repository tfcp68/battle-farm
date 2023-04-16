import { TTurnBasedReducer, TTurnPhase, TTurnSubAction, TTurnSubPhase } from '~/src/types/fsm';

export type TReducerTestCase<T extends TTurnPhase, S extends TTurnSubPhase<T>, A extends TTurnSubAction<T>> = {
	readonly msg: string;
	readonly input: Parameters<TTurnBasedReducer<T, S, A>>;
	readonly output: ReturnType<TTurnBasedReducer<T, S, A>>;
	label?: S;
	numberOfFunctionCalls?: number;
};
