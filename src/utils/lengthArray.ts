export function lengthArray(item: any, n: number = 1) {
	if (typeof item === 'function')
		return Array(n).fill(null).map(()=>item())
	return Array(n).fill(item);
}

