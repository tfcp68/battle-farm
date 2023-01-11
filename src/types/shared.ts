import { TPlayerClass } from '~/src/types/serializables/players';

export type LengthArray<
	T,
	N extends number,
	R extends T[] = []
> = number extends N
	? T[]
	: R['length'] extends N
	? R
	: LengthArray<T, N, [T, ...R]>;

export type TPlayerRecord<K extends any> = Partial<Record<TPlayerClass, K>>;
