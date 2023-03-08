import { TActionCard, TActionId } from '~/src/types/serializables/actions';
import { TCropCard, TCropId } from '~/src/types/serializables/crops';
import {
	TGameEffect,
	TTurnPhase,
	TTurnSubPhase,
	TTurnSubphaseContext,
} from '~/src/types/fsm';

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

export type TCardDiscriminator<T extends TCardType> = {
	type: T;
	id: TCardId<T>;
};

export type TCardDescriptor<T extends TCardType> = {
	type: T;
	id: number;
};

export type TGenericCard<T extends TCardType> = TCardDiscriminator<T> & {
	value: number;
	uuid: number;
};

export type TCard<T extends TCardType = TCardType> = T extends TCardType.CROP
	? TCropCard
	: T extends TCardType.ACTION
	? TActionCard
	: never;

export type TCardSet = Record<TCardId, number>;
export type TDeck = TCard[];

export interface ICard<T extends TCardType = TCardType.CROP | TCardType.ACTION>
	extends TGenericCard<T> {
	load: (card: TCard<T>) => this;
	save: () => TCard<T>;
	rarity: TCardRarity;
	title: string;
	description: string;
	addValue: (value: number) => this;
	setValue: (value: number) => this;
	getEffect?: <
		T extends TTurnPhase,
		S extends TTurnSubPhase<T>,
		С extends TTurnSubphaseContext<T, S>
	>(
		context: С
	) => TGameEffect<T>;
}

export type IDeck = ICard<any>[];
