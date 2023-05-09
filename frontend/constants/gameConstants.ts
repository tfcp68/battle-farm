import { TCard, TCardType } from '~/src/types/serializables/cards';
import { TCropColor, TGardenBedType } from '~/src/types/serializables/crops';
import { TPlayer, TPlayerClass } from '~/src/types/serializables/players';

export const GAME_AMOUNT_PLAYERS = 4;
export const TOTAL_SUM_VALUES_IN_DECK = 582;

export const AMOUNT_CROP_CARDS = 105;
export const listCards: TCard[] = [
	{
		uuid: 1,
		type: TCardType.CROP,
		id: 'WHEAT',
		value: 5,
		fertilized: 10,
		ripeTimer: 30,
		group: TCropColor.GREEN,
	},
	{
		uuid: 2,
		type: TCardType.CROP,
		id: 'BEANS',
		value: 5,
		fertilized: 50,
		ripeTimer: 30,
		group: TCropColor.RED,
	},
	{
		uuid: 3,
		type: TCardType.CROP,
		id: 'BLUEBERRY',
		value: 5,
		fertilized: 50,
		ripeTimer: 30,
		group: TCropColor.RED,
	},
	{
		uuid: 4,
		type: TCardType.CROP,
		id: 'CARROTS',
		value: 5,
		fertilized: 50,
		ripeTimer: 30,
		group: TCropColor.GREEN,
	},
	{
		uuid: 5,
		type: TCardType.ACTION,
		id: `CARTEL_AGREEMENT`,
		value: 5,
	},
	{
		uuid: 6,
		type: TCardType.CROP,
		id: `CLOUDBERRY`,
		value: 5,
		fertilized: 50,
		ripeTimer: 30,
		group: TCropColor.GREEN,
	},
];

export const playerInfo: TPlayer = {
	id: '1',
	coins: 10,
	class: TPlayerClass.WEATHER_WATCHER,
	fertilizers: 4,
	hand: [
		{
			uuid: 1,
			type: TCardType.CROP,
			id: 'WHEAT',
			value: 5,
			fertilized: 10,
			ripeTimer: 30,
			group: TCropColor.GREEN,
		},
		{
			uuid: 2,
			type: TCardType.ACTION,
			id: 'RED_HEAT',
			value: 52,
		},
	],
	beds: [
		{
			type: TGardenBedType.COMMON,
			crop: {
				id: 'WHEAT',
				value: 5,
				fertilized: 10,
				ripeTimer: 30,
				group: TCropColor.GREEN,
			},
		},
		{
			type: TGardenBedType.RAISED,
			crop: {
				id: 'CABBAGE',
				value: 3,
				fertilized: 2,
				ripeTimer: 15,
				group: TCropColor.RED,
			},
		},
	],
};

export const enemyInfo: TPlayer = {
	id: '1',
	coins: 17,
	class: TPlayerClass.GRIM_REAPER,
	fertilizers: 3,
	hand: [
		{
			uuid: 1,
			type: TCardType.CROP,
			id: 'CHERRY',
			value: 5,
			fertilized: 10,
			ripeTimer: 30,
			group: TCropColor.GREEN,
		},
		{
			uuid: 2,
			type: TCardType.ACTION,
			id: 'CHEMICAL_BLISS',
			value: 52,
		},
	],
	beds: [
		{
			type: TGardenBedType.COMMON,
			crop: {
				id: 'WHEAT',
				value: 5,
				fertilized: 10,
				ripeTimer: 30,
				group: TCropColor.GREEN,
			},
		},
		{
			type: TGardenBedType.RAISED,
			crop: {
				id: 'CABBAGE',
				value: 3,
				fertilized: 2,
				ripeTimer: 15,
				group: TCropColor.RED,
			},
		},
	],
};

export const GAME_WIN_LIMIT = (amountPlayer: number, sumValuesInDeck: number): number =>
	Math.ceil(44 + 6 * amountPlayer + sumValuesInDeck / (1 + amountPlayer));
