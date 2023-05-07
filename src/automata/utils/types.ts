export type LengthArray<T, N extends number, R extends T[] = []> = number extends N
	? T[]
	: R['length'] extends N
	? R
	: LengthArray<T, N, [T, ...R]>;