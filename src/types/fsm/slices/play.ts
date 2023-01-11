import { TPlayerTarget } from '~/src/types/serializables/players';
import { TTargetIndex } from '~/src/types/fsm/shared';
import { TTargetContext, TTargetMode } from '~/src/types/fsm/slices/target';
import { ICard, TCardType } from '~/src/types/serializables/cards';

export enum TPlayPhase {
	IDLE,
	TARGET_CROP,
	TARGET_ACTION,
	TARGET_EFFECT,
	FINISHED,
}

export enum TPlayAction {
	RESET,
	HOVER_CARD,
	CHOOSE_CARD,
	TARGET_MODE,
	PLANT_CROP,
	AFTER_PLANT,
	EXECUTE_ACTION,
	CANCEL_SELECTION,
	SKIP,
}

export type TPlayContext<T extends TPlayPhase> =
	T extends TPlayPhase.TARGET_ACTION
		? TTargetContext<any>
		: T extends TPlayPhase.TARGET_EFFECT
		? TTargetContext<any>
		: T extends TPlayPhase.TARGET_CROP
		? TTargetContext<TTargetMode.BED_OWN>
		: T extends TPlayPhase.IDLE
		? TTargetIndex
		: never;

export type TPlayPayload<T extends TPlayAction> =
	T extends TPlayAction.HOVER_CARD
		? TTargetIndex
		: T extends TPlayAction.CHOOSE_CARD
		? TTargetIndex
		: T extends TPlayAction.TARGET_MODE
		? TTargetContext<any>
		: T extends TPlayAction.PLANT_CROP
		? { card: ICard<TCardType.CROP> } & TTargetIndex
		: T extends TPlayAction.AFTER_PLANT
		? { card: ICard<TCardType.CROP> } & Partial<
				TTargetIndex & TPlayerTarget
		  >
		: T extends TPlayAction.EXECUTE_ACTION
		? { card: ICard<TCardType.ACTION> } & Partial<
				TTargetIndex & TPlayerTarget
		  >
		: never;
