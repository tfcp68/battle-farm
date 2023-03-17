import { TTargetIndex } from '~/src/types/fsm/shared';

export enum TFertilizePhase {
	IDLE = 0,
	CROP_CONFIRM,
	FINISHED,
}

export enum TFertilizeAction {
	RESET = 0,
	HOVER,
	CHOOSE_CROP,
	FERTILIZE,
	CANCEL_SELECTION,
	SKIP,
}

export type TFertilizeContext<T extends TFertilizePhase> = T extends TFertilizePhase.IDLE
	? TTargetIndex
	: T extends TFertilizePhase.CROP_CONFIRM
	? TTargetIndex
	: never;

export type TFertilizePayload<T extends TFertilizeAction> = T extends TFertilizeAction.HOVER
	? TTargetIndex
	: T extends TFertilizeAction.CHOOSE_CROP
	? TTargetIndex
	: T extends TFertilizeAction.FERTILIZE
	? TTargetIndex
	: never;

export const CONTEXT_FERTILIZE: TFertilizeContext<TFertilizePhase.IDLE> = {
	index: 0,
};

export type TFertilizeMappedContext = {
	[K in TFertilizePhase]: TFertilizeContext<K>;
};

export type TFertilizeMappedPayload = {
	[K in TFertilizeAction]: TFertilizePayload<K>;
};
