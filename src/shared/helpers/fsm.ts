/**
 * Возвращает строковое имя состояния по его числовому значению.
 * Типобезопасная версия: возвращает ключ словаря состояний или null.
 */
export const getStateName = <T extends Record<string, number>>(
	statesDictionary: T,
	stateValue: number | null,
): keyof T | null => {
	if (stateValue === null) return null;
	const found = Object.entries(statesDictionary).find(([, v]) => v === stateValue);
	return (found ? (found[0] as keyof T) : null);
};

