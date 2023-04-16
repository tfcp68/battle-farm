import { TOffers, TTargetIndex, TTargetIndexList, TTrade } from '~/src/types/fsm/shared';
import { TPlayerTarget } from '~/src/types/serializables/players';

export enum TTradePhase {
	INIT,
	COLLECT,
	OFFERS_WAITING,
	OFFERS_CHOOSING,
	OFFER_ACCEPTED,
	FINISHED,
}

export enum TTradeAction {
	RESET,
	START_COLLECT,
	HOVER,
	ADD_CARD_TO_TRADE,
	REMOVE_CARD_FROM_TRADE,
	SEND_TRADE,
	ACCEPT_OFFER,
	GATHER_OFFERS,
	SKIP,
}

export type TTradeContext<T extends TTradePhase> = T extends TTradePhase.INIT
	? TTargetIndex
	: T extends TTradePhase.COLLECT
	? TTargetIndex & TTargetIndexList
	: T extends TTradePhase.OFFERS_CHOOSING
	? TOffers
	: T extends TTradePhase.OFFER_ACCEPTED
	? TTrade & TTargetIndex
	: never;

export type TTradePayload<T extends TTradeAction> = T extends TTradeAction.HOVER
	? TTargetIndex
	: T extends TTradeAction.ADD_CARD_TO_TRADE
	? TTargetIndex
	: T extends TTradeAction.REMOVE_CARD_FROM_TRADE
	? TTargetIndex
	: T extends TTradeAction.SEND_TRADE
	? TTrade
	: T extends TTradeAction.ACCEPT_OFFER
	? TPlayerTarget
	: T extends TTradeAction.GATHER_OFFERS
	? TOffers
	: never;
