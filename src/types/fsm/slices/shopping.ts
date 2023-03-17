import { TTargetIndex } from '~/src/types/fsm/shared';

export enum TShoppingPhase {
	IDLE,
	CONFIRM_TRADE,
	FINISHED,
}

export enum TShoppingAction {
	RESET,
	HOVER,
	CHOOSE_MARKET_SLOT,
	CONFIRM_DEAL,
	CANCEL_SELECTION,
	SKIP,
}

export type TShoppingContext<T extends TShoppingPhase> = T extends TShoppingPhase.IDLE
	? TTargetIndex
	: T extends TShoppingPhase.CONFIRM_TRADE
	? TTargetIndex
	: never;

export type TShoppingPayload<T extends TShoppingAction> = T extends TShoppingAction.HOVER
	? TTargetIndex
	: T extends TShoppingAction.CHOOSE_MARKET_SLOT
	? TTargetIndex
	: T extends TShoppingAction.CONFIRM_DEAL
	? TTargetIndex
	: null;
