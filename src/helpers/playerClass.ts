import { TPlayerClass } from '~/src/types/serializables/players';

export const getPlayerClassName = (ix: number) => Object.keys(TPlayerClass)[Object.values(TPlayerClass).indexOf(ix)];
