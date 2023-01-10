import { TPlayerTarget } from '~/src/types/players';
import { TTargetIndex } from '~/src/types/fsm/shared';

export enum TPlayPhase {
	IDLE,
	TARGET_MODE,
	FINISHED,
}

export enum TPlayTargetMode {
	UNKNOWN,
	FOE,
	PLAYER,
	BED_FOE,
	BED_OWN,
	BED_ANY,
	CROP_FOE,
	CROP_OWN,
	CROP_ANY,
	CARD_OWN,
	CARD_MARKET,
	CARD_DISCARDED,
}

export enum TPlayAction {
	RESET,
	HOVER_CARD,
	CHOOSE_CARD,
	CHOOSE_PLAYER,
	CHOOSE_BED,
	CHOOSE_CROP,
	CHOOSE_MARKET_SLOT,
	CANCEL_SELECTION,
	SKIP,
}

export type TPlayContext<T extends TPlayPhase> =
	T extends TPlayPhase.TARGET_MODE
		? { targetMode: TPlayTargetMode }
		: T extends TPlayPhase.IDLE
		? TTargetIndex
		: never;

export type TPlayPayload<T extends TPlayAction> =
	T extends TPlayAction.HOVER_CARD
		? TTargetIndex
		: T extends TPlayAction.CHOOSE_CARD
		? TTargetIndex
		: T extends TPlayAction.CHOOSE_PLAYER
		? TPlayerTarget
		: T extends TPlayAction.CHOOSE_CARD
		? TTargetIndex
		: T extends TPlayAction.CHOOSE_MARKET_SLOT
		? TTargetIndex
		: T extends TPlayAction.CHOOSE_BED
		? TTargetIndex & TPlayerTarget
		: T extends TPlayAction.CHOOSE_CROP
		? TTargetIndex & TPlayerTarget
		: never;
