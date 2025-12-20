export const getStateName = (statesDictionary: Record<string, number>, stateValue: number | null) => {
	if (stateValue === null) return null;
	return Object.keys(statesDictionary).find(key => statesDictionary[key] === stateValue) || null;
}