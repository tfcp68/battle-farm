import { TActionId } from '~/src/types/serializables/actions';
import { TCropId } from '~/src/types/serializables/crops';
import { TTPlayerClass } from '~/src/types/serializables/players';
import { UICardSize, UIClassSize } from './assetSIzes';

export const extTypes = {
	AVIF: 'avif',
	WEBP: 'webp',
	JPEG: 'jpeg',
};
export type extTypesKey = keyof typeof extTypes;

export enum assetNamesDictTypes {
	ACTIONS = 'actions',
	CLASSES = 'classes',
	CROPS = 'crops',
}

export type assetNamesDictTypesKeys = 'Classes' | 'Cards';
export type baseAssetType<K extends assetNamesDictTypes> = K extends assetNamesDictTypes.ACTIONS
	? TActionId
	: K extends assetNamesDictTypes.CROPS
	? TCropId
	: K extends assetNamesDictTypes.CLASSES
	? TTPlayerClass
	: never;

export type baseAssetSizeType<K extends assetNamesDictTypes> = K extends assetNamesDictTypes.ACTIONS
	? keyof typeof UICardSize
	: K extends assetNamesDictTypes.CROPS
	? keyof typeof UICardSize
	: K extends assetNamesDictTypes.CLASSES
	? keyof typeof UIClassSize
	: never;
