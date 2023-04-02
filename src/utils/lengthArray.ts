import { LengthArray } from '~/src/types/shared';

export function lengthArray<T = number, N extends number = number>(item: null | ((index?: number) => T) | T, n: N) {
	if (item === null)
		return Array(n)
			.fill(null)
			.map((_, ix) => ix + 1) as LengthArray<T, N>;
	if (item instanceof Function)
		return Array(n)
			.fill(null)
			.map((_, ix) => item(ix)) as LengthArray<T, N>;
	return Array(n).fill(item) as LengthArray<T, N>;
}
