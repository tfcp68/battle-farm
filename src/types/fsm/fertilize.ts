import { TTargetIndex } from '~/src/types/fsm/shared';

export enum TFertilizePhase {
	IDLE = 0,
	PICK_CROP,
	FINISHED,
}

export enum TFertilizeAction {
	RESET = 0,
	HOVER,
	CHOOSE_CROP,
	CONFIRM,
	CANCEL_SELECTION,
	SKIP,
}

export type TFertilizeContext<T extends TFertilizePhase> =
	T extends TFertilizePhase.IDLE
		? TTargetIndex
		: T extends TFertilizePhase.PICK_CROP
		? TTargetIndex
		: never;

export type TFertilizePayload<T extends TFertilizeAction> =
	T extends TFertilizeAction.HOVER
		? TTargetIndex
		: T extends TFertilizeAction.CHOOSE_CROP
		? TTargetIndex
		: T extends TFertilizeAction.CONFIRM
		? TTargetIndex
		: never;

export const CONTEXT_FERTILIZE: TFertilizeContext<any> = {
	index: 0,
};
