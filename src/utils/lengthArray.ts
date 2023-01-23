export function lengthArray(item: any, n: number = 1) {
	if (typeof item === 'function')
		return Array(n).fill(item());
	return Array(n).fill(item);
}

