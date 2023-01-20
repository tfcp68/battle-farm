import { TPlayerClass, TPlayerTarget } from '~/src/types/serializables/players';
import { TCard } from '~/src/types/serializables/cards';

export type TTargetIndex = {
	index: number;
};

export type TPlayerIndex = TTargetIndex & TPlayerTarget;

export type TTargetIndexList = {
	indexList: number[];
};
export type TOffers = { offers: Record<TPlayerClass, number> };
export type TTrade = { cards: TCard[] };
