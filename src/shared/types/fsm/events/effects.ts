import { TGameEvent, TGameEventObject } from '~/shared/types/fsm/events/index';
import { TGameContainer } from '~/shared/types/serializables/game';
import { TPlayerClass } from '~/shared/types/serializables/players';

export type TEffectTrigger<GameEvent extends TGameEvent> = {
	on: GameEvent;
	for: TPlayerClass;
};

export type TEffectCallback<T extends TGameEvent> = (
	game: TGameContainer,
	event: TGameEventObject<T>
) => TGameContainer;
