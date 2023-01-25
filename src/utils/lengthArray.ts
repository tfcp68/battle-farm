import { LengthArray } from '~/src/types/shared';

export function lengthArray<T, N extends number = number>(
	item: (() => T) | T,
	n: N
) {
	if (item instanceof Function)
		return Array(n)
			.fill(null)
			.map(() => item()) as LengthArray<T, N>;
	return Array(n).fill(item) as LengthArray<T, N>;
}
