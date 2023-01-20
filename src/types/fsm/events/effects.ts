import { TTurnPhase, TTurnSubAction, TTurnSubPhase } from '~/src/types/fsm';
import {
	TGame,
	TGameContainer,
	TTurnContainer,
} from '~/src/types/serializables/game';
import { TGameEvent, TGameEventObject } from '~/src/types/fsm/events/index';
import { TPlayerClass } from '~/src/types/serializables/players';

export type TEffectTrigger<GameEvent extends TGameEvent> = {
	on: GameEvent;
	for: TPlayerClass;
};

export type TEffectCallback<T extends TGameEvent> = (
	game: TGameContainer,
	event: TGameEventObject<T>
) => TGameContainer;
