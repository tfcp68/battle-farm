import { TPlayerClass } from '~/src/types/serializables/players';

export const getPlayerClassName = (ix: number) => {
	const findedNameClass = Object.entries(TPlayerClass).filter((key, value) => value === ix)?.[0]?.[1];
	if (typeof findedNameClass === 'string') {
		return findedNameClass;
	} else {
		return '';
	}
};
