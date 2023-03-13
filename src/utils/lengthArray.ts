import { LengthArray } from '~/src/types/shared';

export function lengthArray<T, N extends number = number>(item: ((index?: number) => T) | T, n: N) {
	if (item instanceof Function)
		return Array(n)
			.fill(null)
			.map((_, ix) => item(ix)) as LengthArray<T, N>;
	return Array(n).fill(item) as LengthArray<T, N>;
}
