import { TGameEvent } from '~/shared/types/fsm/events';
import { TPlayerClass } from '~/shared/types/serializables/players';
import { isPositiveInteger } from '@yantrix/core';

export const isPlayerClass = (t: any): t is TPlayerClass =>
	Object.values(TPlayerClass).filter(isPositiveInteger).includes(t);

export const isGameEvent = (t: any): t is TGameEvent => Object.values(TGameEvent).filter(isPositiveInteger).includes(t);
