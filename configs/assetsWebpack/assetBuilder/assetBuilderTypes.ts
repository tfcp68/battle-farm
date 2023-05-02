import { TActionId } from 'src/types/serializables/actions';
import { TCropId } from 'src/types/serializables/crops';
import { TPlayerClassKeys } from 'src/types/serializables/players';
import { UICardSize, UIClassSize } from '../../../frontend/assetBuilder/assetSIzes';

export type TAssetsDictionary = {
	[T in TAssetNamesDict]: Partial<
		Record<TBaseAssetSize<T>, Partial<Record<ExtKeysT, Partial<Record<TBaseAsset<T>, string>>>>>
	>;
};

export enum TAssetNamesDict {
	ACTIONS = 'ACTIONS',
	CLASSES = 'CLASSES',
	CROPS = 'CROPS',
}

export const extTypes = {
	AVIF: 'avif',
	WEBP: 'webp',
	JPEG: 'jpeg',
};
export type ExtKeysT = keyof typeof extTypes;

export type TAssetNamesKeys = 'Classes' | 'Cards';

export type TBaseAsset<K extends TAssetNamesDict> = K extends TAssetNamesDict.ACTIONS
	? TActionId
	: K extends TAssetNamesDict.CROPS
	? TCropId
	: K extends TAssetNamesDict.CLASSES
	? TPlayerClassKeys
	: never;

export type TBaseAssetSize<K extends TAssetNamesDict> = K extends TAssetNamesDict.ACTIONS
	? keyof typeof UICardSize
	: K extends TAssetNamesDict.CROPS
	? keyof typeof UICardSize
	: K extends TAssetNamesDict.CLASSES
	? keyof typeof UIClassSize
	: never;