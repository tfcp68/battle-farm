import { TGameEvent } from '~/src/types/fsm/events';
import { TPlayerClass } from '~/src/types/serializables/players';

export type TValidator<T> = (x: any) => x is T;

export const isNumber = (t: any): t is number => Number.isFinite(t);
export const isPositiveNumber = (t: any): t is number => isNumber(t) && t > 0;
export const isPositiveInteger = (t: any): t is number => isPositiveNumber(t) && Number.isSafeInteger(t);
export const isInteger = (t: any): t is number => Number.isSafeInteger(t);

export const isPlayerClass = (t: any): t is TPlayerClass =>
	Object.values(TPlayerClass).filter(isPositiveInteger).includes(t);

export const isGameEvent = (t: any): t is TGameEvent => Object.values(TGameEvent).filter(isPositiveInteger).includes(t);
