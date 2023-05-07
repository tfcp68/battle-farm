import { TGameEvent } from '~/src/types/fsm/events';
import { TPlayerClass } from '~/src/types/serializables/players';
import { Utils } from '~/src/automata';

const { isPositiveInteger } = Utils;

export const isPlayerClass = (t: any): t is TPlayerClass =>
	Object.values(TPlayerClass).filter(isPositiveInteger).includes(t);

export const isGameEvent = (t: any): t is TGameEvent => Object.values(TGameEvent).filter(isPositiveInteger).includes(t);
