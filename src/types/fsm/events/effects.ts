import { TGameEvent, TGameEventObject } from '~/types/fsm/events/index';
import { TGameContainer } from '~/types/serializables/game';
import { TPlayerClass } from '~/types/serializables/players';

export type TEffectTrigger<GameEvent extends TGameEvent> = {
	on: GameEvent;
	for: TPlayerClass;
};

export type TEffectCallback<T extends TGameEvent> = (
	game: TGameContainer,
	event: TGameEventObject<T>
) => TGameContainer;
