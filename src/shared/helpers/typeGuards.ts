export function isRecord(x: unknown): x is Record<string, unknown> {
	return x !== null && typeof x === 'object' && !Array.isArray(x);
}

export function getString(m: Record<string, unknown>, key: string): string | null {
	const v = m[key];
	return typeof v === 'string' ? v : null;
}

export function getBit(m: Record<string, unknown>, key: string): 0 | 1 {
	return m[key] === 1 ? 1 : 0;
}
