import { TActionId } from '~/shared/types/serializables/actions';
import { TCropId } from '~/shared/types/serializables/crops';
import { TPlayerRecord } from '~/shared/types/shared';

export type TPlayerStat = {
	cardsBought: number;
	cardsAcquired: number;
	cardsDiscarded: number;
	actionCardsPlayed: Record<TActionId, number>;
	cropsPlanted: Record<TCropId, number>;
	cropsHarvested: Record<TCropId, number>;
	cropsDestroyed: number;
	coinsAcquired: number;
	coinsFromHarvest: number;
	fertilizerUsed: number;
	fertilizerExpended: number;
	fertilizerAcquired: number;
};

export type TGameStat = {
	players: TPlayerRecord<TPlayerStat>;
	totalMarketCards: number;
	totalCropValue: number;
};
