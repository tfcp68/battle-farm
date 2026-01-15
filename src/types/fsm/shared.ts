import { TCard } from '~/types/serializables/cards';
import { TPlayerClass, TPlayerTarget } from '~/types/serializables/players';

export type TTargetIndex = {
	index: number;
};

export type TPlayerIndex = TTargetIndex & TPlayerTarget;

export type TTargetIndexList = {
	indexList: number[];
};
export type TOffers = { offers: Record<TPlayerClass, number> };
export type TTrade = { cards: TCard[] };
