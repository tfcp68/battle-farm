import { TPlayer, TPlayerClass } from '~/src/types/players';
import { TCard, TDeck } from '~/src/types/cards';
import { LengthArray } from '~/src/types/shared';
import { TTurnPhase } from '~/src/types/turns';

export const MARKET_SIZE = 6;

export type TTurnOrder = TPlayerClass[];

export enum TGamePhase {
	PLANNED,
	ROLLING_CHARACTERS,
	ROLLING_TURN_ORDER,
	SETUP,
	IN_PROGRESS,
	LAST_TURN,
	FINISHED,
}

export type TGame = {
	phase: TGamePhase;
	players: TPlayer[];
	turnOrder: TTurnOrder;
	currentTurn: TPlayerClass;
	currentTurnPhase: TTurnPhase;
	deck: TDeck;
	winLimit: number;
	turnsPlayed: number;
	market: LengthArray<TCard, typeof MARKET_SIZE>;
};
