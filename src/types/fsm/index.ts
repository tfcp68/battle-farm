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
	[TTurnPhase.WAITING]: TTradePhase;
	[TTurnPhase.TRADE]: TTradePhase;
	[TTurnPhase.SHOPPING]: TShoppingPhase;
	[TTurnPhase.PLAYING]: TPlayPhase;
	[TTurnPhase.FERTILIZE]: TFertilizePhase;
	[TTurnPhase.HARVEST]: never;
	[TTurnPhase.CALCULATION]: never;
};

export type TTurnSubActionDict = {
	[TTurnPhase.WAITING]: TTradeAction;
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
				? TTradeContext<K>
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
			? K extends TTurnSubPhase<T>
				? TTradePayload<K>
				: never
			: T extends TTurnPhase.TRADE
			? K extends TTurnSubPhase<T>
				? TTradePayload<K>
				: never
			: T extends TTurnPhase.SHOPPING
			? K extends TTurnSubPhase<T>
				? TShoppingPayload<K>
				: never
			: T extends TTurnPhase.FERTILIZE
			? K extends TTurnSubPhase<T>
				? TFertilizePayload<K>
				: never
			: T extends TTurnPhase.PLAYING
			? K extends TTurnSubPhase<T>
				? TPlayPayload<K>
				: never
			: never;
	};
};

export type TTurnSubContext<
	T extends TTurnPhase,
	K extends TTurnSubPhaseDict[T]
> = TTurnSubContextDict[T][K];

export type TTurnSubPayload<
	T extends TTurnPhase,
	K extends TTurnSubActionDict[T]
> = TTurnSubPayloadDict[T][K];
