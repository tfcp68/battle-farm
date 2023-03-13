export default function arraySample<T>(arr: T[], n = 1): T[] {
	const acc: T[] = [];
	if (!arr?.length || n <= 0) return acc;
	const a = JSON.parse(JSON.stringify(arr));
	while (acc.length < n) acc.push(...a.splice(Math.floor(Math.random() * a.length), 1));
	return acc;
}
