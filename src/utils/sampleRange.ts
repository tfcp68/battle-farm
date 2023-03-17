export function sampleRange(min = 1, max = 100) {
	return min + Math.floor(Math.random() * (max - min + 1));
}
