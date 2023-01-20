import { TBed, TCrop, TGardenBedType } from '~/src/types/serializables/crops';
import { ICard, TCard } from '~/src/types/serializables/cards';
import { TTargetModeContext, TTargetMode } from '~/src/types/fsm/slices/target';

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

export interface IPlayer {
	load: (player: TPlayer) => this;
	save: () => TPlayer;
	getHand: () => ICard[];
	getBeds: () => TBed[];
	getCrops: () => TCrop[];
	getFertilizers: () => number;
	giveFertilizers: (count: number) => this;
	discardFertilizers: (count: number) => this;
	giveCoins: (coins: number) => this;
	discardCoins: (coins: number) => this;
	discardRandomCards: (count: number) => this;
	discardCards: (uuids: number[] | number) => this;
	setTargetMode: <T extends TTargetMode>(mode: TTargetModeContext<T>) => this;
	quitTargetMode: () => this;
	getCrop: (bedIndex: number) => TCrop | null;
	getBed: (bedIndex: number) => TBed | null;
	setGardenBedType: (bedIndex: number, type: TGardenBedType) => this;
	updateCropTimer: (bedIndex?: number, delta?: number) => this;
	fertilizeCrop: (bedIndex?: number) => this;
	harvestCrop: (crop: TCrop) => this;
}
