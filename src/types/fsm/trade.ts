import {
	TOffers,
	TTargetIndex,
	TTargetIndexList,
	TTrade,
} from '~/src/types/fsm/shared';
import { TPlayerClass, TPlayerTarget } from '~/src/types/players';
import { TCard } from '~/src/types/cards';

export enum TTradePhase {
	INIT,
	COLLECT,
	OFFERS_WAITING,
	OFFERS_CHOOSING,
	FINISHED,
}

export enum TTradeAction {
	RESET,
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
