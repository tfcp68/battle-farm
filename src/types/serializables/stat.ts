import {
	CropCardId,
	TCropColor,
	TCropId,
} from '~/src/types/serializables/crops';
import { TActionId } from '~/src/types/serializables/actions';
import { TPlayerRecord } from '~/src/types/shared';

export type TPlayerStat = {
	cardsBought: number;
	cardsAcquired: number;
	cardsDiscarded: number;
	actionCardsPlayed: Record<TActionId, number>;
	cropsPlanted: Record<TCropId, number>;
	cropsHarvested: Record<TCropId, number>;
	coinsAcquired: number;
	coinsFromHarvest: number;
	fertilizerUsed: number;
	fertilizerExpended: number;
	fertilizerAcquired: number;
};

export type TGameStat = {
	players: TPlayerRecord<TPlayerStat>;
	cropsDestroyed: number;
	totalMarketCards: number;
	totalCropValue: number;
};
