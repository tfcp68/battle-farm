import { LengthArray } from './types';

export function sampleRange(min = 1, max = 100) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

export function pickFromArray<T>(arr: T[], n = 1): T[] {
	const acc: T[] = [];
	if (!arr?.length || n <= 0) return acc;
	const a = JSON.parse(JSON.stringify(arr));
	while (acc.length < n) acc.push(...a.splice(Math.floor(Math.random() * a.length), 1));
	return acc;
}

export function sampleArray<T = number, N extends number = number>(item: null | ((index?: number) => T) | T, n: N) {
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
