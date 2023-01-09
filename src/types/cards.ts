import { TActionId } from '~/src/types/actions';
import { TCrop, TCropId } from '~/src/types/crops';

export enum TCardType {
	UNKNOWN,
	CROP,
	ACTION,
}

export enum TCardRarity {
	UNKNOWN,
	COMMON,
	UNCOMMON,
	RARE,
	EPIC,
	MYTHIC,
}

export type TCardId<T extends TCardType = TCardType> = T extends TCardType.CROP
	? TCropId
	: T extends TCardType.ACTION
	? TActionId
	: never;

export type TGenericCard<T extends TCardType> = T extends TCardType.UNKNOWN
	? never
	: {
			id: TCardId<T>;
			type: T;
			rarity: TCardRarity;
			value: number;
			title: string;
			description: string;
	  };

export type TCropCard = TGenericCard<TCardType.CROP> & TCrop;

export type TActionCard = TGenericCard<TCardType.ACTION>;

export type TCard = TCropCard | TActionCard;

export type TCardDescriptor<T extends TCardType> = T extends TCardType.UNKNOWN
	? never
	: {
			type: T;
			id: TCardId<T>;
	  };

export type TDeck = Record<TCardId, number>;
