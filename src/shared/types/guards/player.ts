import { TPlayerClass, TPlayerClassKeys } from '~/shared/types/serializables/players';

export const isPlayerClassKey = (t: any): t is TPlayerClassKeys => {
	return Object.keys(TPlayerClass)
		.filter((key) => {
			return Number.isNaN(Number(key));
		})
		.includes(t);
};
