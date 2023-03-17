import { TGameEvent, TGameEventObject } from '~/src/types/fsm/events/index';
import { TGameContainer } from '~/src/types/serializables/game';
import { TPlayerClass } from '~/src/types/serializables/players';

export type TEffectTrigger<GameEvent extends TGameEvent> = {
	on: GameEvent;
	for: TPlayerClass;
};

export type TEffectCallback<T extends TGameEvent> = (
	game: TGameContainer,
	event: TGameEventObject<T>
) => TGameContainer;
