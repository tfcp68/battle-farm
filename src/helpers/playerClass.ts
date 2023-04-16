import { TPlayerClass } from '~/src/types/serializables/players';

export const getPlayerClassName = (ix: number) =>
	Object.entries(TPlayerClass).filter((key, value) => value === ix)?.[0]?.[1];
