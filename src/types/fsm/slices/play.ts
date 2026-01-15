import { TPlayerIndex, TTargetIndex } from '~/types/fsm/shared';
import { TCardType, TGenericCard } from '~/types/serializables/cards';
import { TTargetContext } from '~/types/fsm/slices/target';
import { TGameEffect } from '~/types/fsm';
import { TCrop } from '~/types/serializables/crops';

export enum TPlayPhase {
	IDLE,
	PLAYING,
	PLANTING,
	CROP_PLANTED,
	TARGETING,
	EXECUTION,
	FINISHED,
}

export enum TPlayAction {
	RESET,
	START_PLAY,
	HOVER_CARD,
	CHOOSE_CARD,
	PLANT_CROP,
	EXECUTE_ACTION,
	CANCEL_SELECTION,
	SKIP,
}

export type TPlayContext<T extends TPlayPhase> = T extends TPlayPhase.PLANTING
	? TTargetIndex & TGenericCard<TCardType.CROP>
	: T extends TPlayPhase.CROP_PLANTED
	? { crop: TCrop } & TTargetIndex
	: T extends TPlayPhase.TARGETING
	? TTargetContext<any> & TGenericCard<any>
	: T extends TPlayPhase.PLAYING
	? TTargetIndex
	: never;

export type TPlayPayload<T extends TPlayAction> = T extends TPlayAction.HOVER_CARD
	? TTargetIndex
	: T extends TPlayAction.CHOOSE_CARD
	? TTargetIndex
	: T extends TPlayAction.CANCEL_SELECTION
	? TTargetIndex
	: T extends TPlayAction.PLANT_CROP
	? { crop: TCrop } & TTargetIndex
	: T extends TPlayAction.EXECUTE_ACTION
	? { effect: TGameEffect } & Partial<TPlayerIndex>
	: never;
