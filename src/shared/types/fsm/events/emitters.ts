import { TTurnPhase, TTurnSubAction, TTurnSubPayload } from '~/shared/types/fsm';
import { TGameEvent, TGameEventObject } from '~/shared/types/fsm/events/index';
import { TWaitAction } from '~/shared/types/fsm/slices/waiting';
import { IGame } from '~/shared/types/serializables/game';
import { TPlayerClass } from '~/shared/types/serializables/players';

export type TEventEmitter<T extends TTurnPhase, A extends TTurnSubAction<T> = TTurnSubAction<T>> = {
	turnPhase: T;
	action: A;
	payload: TTurnSubPayload<T, A>;
};

export type TEventMapper<T extends TTurnPhase, A extends TTurnSubAction<T>> = (
	emitter: TEventEmitter<T, A>,
	game: IGame,
	source: TPlayerClass | null
) => Array<TGameEventObject<any>>;

// @TODO WIP
export const EventDispatchMap: {
	[T in TTurnPhase]?: {
		[A in TTurnSubAction<T>]?: TEventMapper<T, A>;
	};
} = {
	[TTurnPhase.WAITING]: {
		[TWaitAction.RESET]: (e, game, source = null) => [
			{
				event: TGameEvent.TURN_PHASE_STARTED,
				source,
				game,
				payload: {
					phase: TTurnPhase.WAITING,
					targetClass: game?.turns?.currentTurn,
				},
			},
		],
		[TWaitAction.OFFER_ACCEPTED]: (e, game, source = null) => [
			{
				event: TGameEvent.PLAYER_TRADE_ACCEPTED,
				source: e.payload.targetClass,
				game,
				payload: {
					targetClass: game?.turns?.currentTurn,
					index: e.payload.index,
					cards: e.payload.cards,
				},
			},
		],
	},
};
