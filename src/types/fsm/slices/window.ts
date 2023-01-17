import { TGame, TGameScore } from '~/src/types/serializables/game';
import { TTargetIndex } from '~/src/types/fsm/shared';

export enum TWindowState {
	INIT,
	INTRO,
	MAIN_MENU,
	GAME_LOBBY,
	GAME_STARTING,
	SCORE_SCREEN,
	IN_GAME,
}

export enum TWindowAction {
	RESET,
	RUN,
	TO_MENU,
	MENU_HOVER,
	CREATE_GAME,
	JOIN_GAME,
	START_GAME,
	BEGIN_GAME,
	END_GAME,
	EXIT,
}

export type TWindowPayload<T extends TWindowAction> =
	T extends TWindowAction.CREATE_GAME
		? { playerId: string }
		: T extends TWindowAction.JOIN_GAME
		? { gameId: string; playerId: string }
		: T extends TWindowAction.START_GAME
		? { gameId: string; playerIds: string[] }
		: T extends TWindowAction.BEGIN_GAME
		? { gameId: string; game: TGame }
		: T extends TWindowAction.END_GAME
		? { gameId: string }
		: never;

export type TWindowContext<T extends TWindowState> =
	T extends TWindowState.MAIN_MENU
		? TTargetIndex
		: T extends TWindowState.GAME_LOBBY
		? {
				gameId: string;
				playerIds: string[];
		  }
		: T extends TWindowState.GAME_STARTING
		? {
				gameId: string;
				playerIds: string[];
		  }
		: T extends TWindowState.IN_GAME
		? {
				gameId: string;
				game: TGame;
		  }
		: T extends TWindowState.SCORE_SCREEN
		? {
				gameId: string;
				score: TGameScore;
		  }
		: never;
