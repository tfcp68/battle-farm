export const getStateName = <T extends Record<string, number>>(
	statesDictionary: T,
	stateValue: number | null,
): string | null => {
	if (stateValue === null) return null;
	const entry = Object.entries(statesDictionary).find(([, v]) => v === stateValue);
	return entry?.[0] ?? null;
};
