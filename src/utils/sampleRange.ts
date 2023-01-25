export function sampleRange(min: number = 1, max: number = 100) {
	return min + Math.floor(Math.random() * (max - min + 1));
}
