import { TTurnPhase, TTurnSubPhase, TTurnSubphaseContext } from '~/src/types/fsm';
import { TTargetModeContext } from '~/src/types/fsm/slices/target';
import { ICard, IDeck, TCard, TDeck } from '~/src/types/serializables/cards';
import { IPlayer, TPlayer, TPlayerClass } from '~/src/types/serializables/players';
import { TGameStat } from '~/src/types/serializables/stat';
import { LengthArray, TPlayerRecord } from '~/src/types/shared';

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
	RESET,
	ROLL_CHARACTERS,
	ROLL_TURN_ORDER,
	PREPARE,
	START,
	TURN_START,
	TURN_PHASE_START,
	TURN_PHASE_END,
	NEXT_PLAYER,
	TURN_END,
	END,
}

export type TTurnContext<
	TurnPhase extends TTurnPhase = TTurnPhase,
	TurnSubPhase extends TTurnSubPhase<TurnPhase> = TTurnSubPhase<TurnPhase>
> = {
	currentTurnPhase: TurnPhase;
	context?: TTurnSubphaseContext<TurnPhase, TurnSubPhase>;
};

export type TTurnContainer = {
	currentTurn: TPlayerClass;
	turnsPlayed: number;
	state: TPlayerRecord<TTurnContext>;
	turnOrder: TTurnOrder | null;
};

export type TGame = {
	uuid: number;
	phase: TGamePhase;
	players: TPlayerRecord<TPlayer> | null;
	deck: TDeck;
	winLimit: number;
	market: LengthArray<TCard, typeof MARKET_SIZE>;
};

export type TGameScore = {
	uuid: number;
	winLimit: number;
	stat: TGameStat;
	playerNames: TPlayerRecord<string>;
	playerScore: TPlayerRecord<number>;
};

export type TGameContainer = TGame & {
	turns: TTurnContainer;
};

export interface IGame {
	players: TPlayerRecord<IPlayer>;
	winLimit: TPlayerRecord<number>;
	deck: IDeck;
	turns: TTurnContainer;
	phase: TGamePhase;
	market: LengthArray<ICard, typeof MARKET_SIZE>;
	targetingContext: TTargetModeContext<any>;
	exportGame: () => TGameContainer;
	importGame: (savedGame: TGameContainer) => this;
	putCardToDeck: (card: ICard) => this;
	drawCardFromDeck: () => ICard;
	drawCardFromMarket: (index: number) => TCard | null;
	putCardToMarket: (card: ICard, index: number) => this;
	getMarketCards: ICard[];
	giveCoinsToPlayer: (player: TPlayerClass, coins: number) => this;
	discardCoinsFromPlayer: (player: TPlayerClass, coins: number) => this;
	nextTurnPhase: () => this;
	nextTurn: () => this;
	dispatch: (action: TGameAction) => this;
}
