import { TPlayerIndex, TTargetIndex, TTrade } from '~/src/types/fsm/shared';
import { TTargetModeContext } from '~/src/types/fsm/slices/target';

export enum TWaitPhase {
	INIT,
	HAS_TRADE,
	OFFER_SENT,
	TARGET_MODE,
	FINISHED,
}

export enum TWaitAction {
	RESET,
	ADD_COINS_TO_OFFER,
	REMOVE_COINS_FROM_OFFER,
	MAKE_OFFER,
	OFFER_ACCEPTED,
	ENTER_TARGET_MODE,
	QUIT_TARGET_MODE,
	SKIP,
}

export type TWaitContext<T extends TWaitPhase> = T extends TWaitPhase.HAS_TRADE
	? TTrade & TTargetIndex
	: T extends TWaitPhase.OFFER_SENT
	? TTrade & TTargetIndex
	: never;

export type TWaitPayload<T extends TWaitAction> =
	T extends TWaitAction.ADD_COINS_TO_OFFER
		? TPlayerIndex
		: T extends TWaitAction.REMOVE_COINS_FROM_OFFER
		? TPlayerIndex
		: T extends TWaitAction.MAKE_OFFER
		? TPlayerIndex & TTrade
		: T extends TWaitAction.OFFER_ACCEPTED
		? TPlayerIndex & TTrade
		: T extends TWaitAction.ENTER_TARGET_MODE
		? TTargetModeContext<any>
		: never;
