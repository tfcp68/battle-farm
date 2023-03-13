import { TGameEvent } from '~/src/types/fsm/events';
import { TPlayerClass } from '~/src/types/serializables/players';

export type TValidator<T> = (x: any) => x is T;

export const isPlayerClass = (t: any): t is TPlayerClass =>
	Object.values(TPlayerClass)
		.filter((v) => Number.isFinite(v) && v > 0)
		.includes(t);

export const isGameEvent = (t: any): t is TGameEvent =>
	Object.values(TGameEvent)
		.filter((v) => Number.isFinite(v) && v > 0)
		.includes(t);
