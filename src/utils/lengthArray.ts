export function lengthArray<T>(item:( (()=>T) |T), n:number):T[] {
	if (item instanceof Function)
		return Array(n).fill(null).map(() => item())
	return Array(n).fill(item);
}
