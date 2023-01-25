export default function arraySample<T>(arr: T[], n: number = 1): T[] {
	const acc: T[] = [];
	if (n <= 0) return acc;
	while (acc.length < n)
		acc.push(...arr.splice(Math.floor(Math.random() * arr.length), 1));
	return acc;
}
