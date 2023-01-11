import { TPlayer, TPlayerClass } from '~/src/types/players';
import { TCard, TDeck } from '~/src/types/cards';
import { LengthArray } from '~/src/types/shared';
import { TTurnPhase, TTurnSubContext, TTurnSubPhase } from '~/src/types/fsm';

export const MARKET_SIZE = 6;
export const MAX_PLAYERS = 6;
export const MIN_PLAYERS = 2;

export type TTurnOrder = Record<TPlayerClass, number>;

export enum TGamePhase {
	PLANNED,
	ROLLING_CHARACTERS,
	ROLLING_TURN_ORDER,
	SETUP,
	IN_PROGRESS,
	LAST_TURN,
	FINISHED,
}

export enum TGameAction {
	UNKNOWN,
	PREPARE,
	START,
	PRE_FINISH,
	END,
}

export type TGame<
	TurnPhase extends TTurnPhase = TTurnPhase,
	TurnSubPhase extends TTurnSubPhase<TurnPhase> = TTurnSubPhase<TurnPhase>
> = {
	phase: TGamePhase;
	players: Partial<Record<TPlayerClass, TPlayer>>;
	turns: {
		turnOrder: TTurnOrder;
		currentTurn: TPlayerClass;
		currentTurnPhase: TurnPhase;
		currentTurnSubPhase: TurnSubPhase;
		context?: TTurnSubContext<TurnPhase, TurnSubPhase>;
		turnsPlayed: number;
	};
	deck: TDeck;
	winLimit: number;
	market: LengthArray<TCard, typeof MARKET_SIZE>;
};
