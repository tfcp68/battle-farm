import { TPlayerClass } from '~/src/types/players';
import { TCard } from '~/src/types/cards';

export type TTargetIndex = {
	index: number;
};

export type TTargetIndexList = {
	indexList: number[];
};
export type TOffers = { offers: Record<TPlayerClass, number> };
export type TTrade = { cards: TCard[] };
