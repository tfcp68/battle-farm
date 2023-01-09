import { TBed } from '~/src/types/crops';
import { TCard } from '~/src/types/cards';

export enum TPlayerClass {
	EMPTY,
	LAND_BARON,
	GRIM_REAPER,
	MASTER_GARDENER,
	CROP_SCIENTIST,
	SEED_TRADER,
	WEATHER_WATCHER,
}

export type TPlayer = {
	id: string;
	class: TPlayerClass;
	coins: number;
	fertilizers: number;
	hand: TCard[];
	beds: TBed[];
	discardedCards?: TCard[];
};

export type TPlayerTarget = {
	targetClass: TPlayerClass;
};
