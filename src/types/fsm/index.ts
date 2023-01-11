import {
	TTradeAction,
	TTradeContext,
	TTradePayload,
	TTradePhase,
} from '~/src/types/fsm/trade';
import {
	TShoppingAction,
	TShoppingContext,
	TShoppingPayload,
	TShoppingPhase,
} from '~/src/types/fsm/shopping';
import {
	TPlayAction,
	TPlayContext,
	TPlayPayload,
	TPlayPhase,
} from '~/src/types/fsm/play';
import {
	TFertilizeAction,
	TFertilizeContext,
	TFertilizePayload,
	TFertilizePhase,
} from '~/src/types/fsm/fertilize';
import {
	TWaitAction,
	TWaitContext,
	TWaitPayload,
	TWaitPhase,
} from '~/src/types/fsm/waiting';
import { TGame } from '~/src/types/game';

export enum TTurnPhase {
	HARVEST,
	SHOPPING,
	TRADE,
	PLAYING,
	FERTILIZE,
	CALCULATION,
	WAITING,
}

export type TTurnSubPhaseDict = {
	[TTurnPhase.WAITING]: TWaitPhase;
	[TTurnPhase.TRADE]: TTradePhase;
	[TTurnPhase.SHOPPING]: TShoppingPhase;
	[TTurnPhase.PLAYING]: TPlayPhase;
	[TTurnPhase.FERTILIZE]: TFertilizePhase;
	[TTurnPhase.HARVEST]: never;
	[TTurnPhase.CALCULATION]: never;
};

export type TTurnSubActionDict = {
	[TTurnPhase.WAITING]: TWaitAction;
	[TTurnPhase.TRADE]: TTradeAction;
	[TTurnPhase.SHOPPING]: TShoppingAction;
	[TTurnPhase.PLAYING]: TPlayAction;
	[TTurnPhase.FERTILIZE]: TFertilizeAction;
	[TTurnPhase.HARVEST]: TFertilizeAction;
	[TTurnPhase.CALCULATION]: TFertilizeAction;
};

export type TTurnSubPhase<T extends TTurnPhase> = TTurnSubPhaseDict[T];
export type TTurnSubAction<T extends TTurnPhase> = TTurnSubActionDict[T];

export type TTurnSubContextDict = {
	[T in TTurnPhase]: {
		[K in TTurnSubPhaseDict[T]]: T extends TTurnPhase.WAITING
			? K extends TTurnSubPhase<T>
				? TWaitContext<K>
				: never
			: T extends TTurnPhase.TRADE
			? K extends TTurnSubPhase<T>
				? TTradeContext<K>
				: never
			: T extends TTurnPhase.SHOPPING
			? K extends TTurnSubPhase<T>
				? TShoppingContext<K>
				: never
			: T extends TTurnPhase.FERTILIZE
			? K extends TTurnSubPhase<T>
				? TFertilizeContext<K>
				: never
			: T extends TTurnPhase.PLAYING
			? K extends TTurnSubPhase<T>
				? TPlayContext<K>
				: never
			: never;
	};
};

export type TTurnSubPayloadDict = {
	[T in TTurnPhase]: {
		[K in TTurnSubActionDict[T]]: T extends TTurnPhase.WAITING
			? K extends TTurnSubAction<T>
				? TWaitPayload<K>
				: never
			: T extends TTurnPhase.TRADE
			? K extends TTurnSubAction<T>
				? TTradePayload<K>
				: never
			: T extends TTurnPhase.SHOPPING
			? K extends TTurnSubAction<T>
				? TShoppingPayload<K>
				: never
			: T extends TTurnPhase.FERTILIZE
			? K extends TTurnSubAction<T>
				? TFertilizePayload<K>
				: never
			: T extends TTurnPhase.PLAYING
			? K extends TTurnSubAction<T>
				? TPlayPayload<K>
				: never
			: never;
	};
};

export type TTurnSubContext<
	T extends TTurnPhase,
	K extends TTurnSubPhaseDict[T] = TTurnSubPhase<T>
> = TTurnSubContextDict[T][K];

export type TTurnSubPayload<
	T extends TTurnPhase,
	K extends TTurnSubActionDict[T] = TTurnSubAction<T>
> = TTurnSubPayloadDict[T][K];

export type TTurnSubDispatchParam<
	T extends TTurnPhase,
	K extends TTurnSubActionDict[T] = TTurnSubActionDict[T]
> = { action: K; payload: TTurnSubPayload<T, K> };

export type TTurnSubReducerContext<
	T extends TTurnPhase,
	K extends TTurnSubPhaseDict[T] = TTurnSubPhase<T>
> = {
	subPhase: K;
	context: TTurnSubContext<T, K>;
	game: TGame;
};

export type TWithTurnSubPhase<
	T extends TTurnPhase,
	M extends TTurnSubPhase<T> = TTurnSubPhase<T>
> = {
	subPhase: M;
};

// Synchronously updates the Turn Context Returns new SubPhase inside Turn Phase
export type TTurnBasedDispatch<
	T extends TTurnPhase,
	M extends TTurnSubPhase<T> = TTurnSubPhase<T>,
	K extends TTurnSubAction<T> = TTurnSubAction<T>
> = (params: TWithTurnSubPhase<T, M> & TTurnSubDispatchParam<T, K>) => M;

// Synchronously calculates new Turn Context and Game State for a given action
export type TTurnBasedReducer<
	T extends TTurnPhase,
	M extends TTurnSubPhase<T> = TTurnSubPhase<T>,
	K extends TTurnSubAction<T> = TTurnSubAction<T>,
	O extends TTurnSubContext<T, M> = TTurnSubContext<T, M>,
	P extends TTurnSubPayload<T, K> = TTurnSubPayload<T, K>
> = (
	params: TTurnSubReducerContext<T, M> & TTurnSubDispatchParam<T, K>
) => TTurnSubReducerContext<T, TTurnSubPhase<any>>;
