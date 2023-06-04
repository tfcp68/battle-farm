import { TPlayerClass, TPlayerClassKeys } from '~/src/types/serializables/players';
import { isPlayerClassKey } from '../types/guards/player';

export const getPlayerClassName = (ix: TPlayerClass): TPlayerClassKeys => {
	const playerClassName = Object.entries(TPlayerClass).filter((key, value) => value === ix)[0][1];
	if (isPlayerClassKey(playerClassName)) return playerClassName;
	return 'EMPTY';
};
