import { TTargetIndex, TTrade } from '~/src/types/fsm/shared';

export enum TWaitPhase {
	INIT,
	HAS_TRADE,
	OFFER_SENT,
	FINISHED,
}

export enum TWaitAction {
	RESET,
	SEND_TRADE,
	ADD_COINS_TO_OFFER,
	REMOVE_COINS_FROM_OFFER,
	MAKE_OFFER,
	CANCEL_OFFER,
	OFFER_ACCEPTED,
	END_TRADE,
	SKIP,
}

export type TTradeContext<T extends TWaitPhase> = T extends TWaitPhase.HAS_TRADE
	? TTrade & TTargetIndex
	: T extends TWaitPhase.OFFER_SENT
	? TTrade & TTargetIndex
	: never;

export type TTradePayload<T extends TWaitAction> =
	T extends TWaitAction.SEND_TRADE
		? TTrade
		: T extends TWaitAction.ADD_COINS_TO_OFFER
		? TTargetIndex
		: T extends TWaitAction.REMOVE_COINS_FROM_OFFER
		? TTargetIndex
		: T extends TWaitAction.MAKE_OFFER
		? TTargetIndex
		: T extends TWaitAction.OFFER_ACCEPTED
		? TTargetIndex
		: never;
