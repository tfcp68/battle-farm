import { TPlayerIndex, TTrade } from '~/src/types/fsm/shared';
import { TTargetModeContext } from '~/src/types/fsm/slices/target';
import { TGameEffect } from '~/src/types/fsm';
import { TPlayerTarget } from '~/src/types/serializables/players';

export enum TWaitPhase {
	INIT,
	HAS_TRADE,
	OFFER_SENT,
	TARGETING,
	EFFECT_APPLIED,
	FINISHED,
}

export enum TWaitAction {
	RESET,
	START_TRADE,
	CHANGE_TRADE_OFFER,
	MAKE_OFFER,
	OFFER_ACCEPTED,
	ENTER_TARGET_MODE,
	APPLY_EFFECT,
	CANCEL_SELECTION,
	SKIP,
}

export type TWaitContext<T extends TWaitPhase> = T extends TWaitPhase.HAS_TRADE
	? TTrade & TPlayerIndex
	: T extends TWaitPhase.OFFER_SENT
	? TTrade & TPlayerIndex
	: never;

export type TWaitPayload<T extends TWaitAction> = T extends TWaitAction.START_TRADE
	? TTrade & TPlayerTarget
	: T extends TWaitAction.CHANGE_TRADE_OFFER
	? TPlayerIndex
	: T extends TWaitAction.MAKE_OFFER
	? TPlayerIndex & TTrade
	: T extends TWaitAction.OFFER_ACCEPTED
	? TPlayerIndex & TTrade
	: T extends TWaitAction.ENTER_TARGET_MODE
	? TTargetModeContext<any>
	: T extends TWaitAction.APPLY_EFFECT
	? { effect: TGameEffect } & Partial<TPlayerIndex>
	: never;
