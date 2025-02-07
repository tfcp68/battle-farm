import { TCropId } from '~/src/types/serializables/crops';
import { TActionId } from '~/src/types/serializables/actions';
import { TPlayerClassKeys } from '~/src/types/serializables/players';
import { UICardSize, UIClassSize } from '~/frontend/constants/assetSizes';

export type TAssetsDictionary = {
	[T in TAssetNamesDict]: Partial<
		Record<TBaseAsset<T>, Partial<Record<TBaseAssetSize<T>, Partial<Record<ExtKeysT, string>>>>>
	>;
};

export enum TAssetNamesDict {
	ACTIONS = 'ACTIONS',
	CLASSES = 'CLASSES',
	CROPS = 'CROPS',
}

export type TAssetNamesKeys = 'Classes' | 'Cards';
export const extTypes = {
	AVIF: 'avif',
	WEBP: 'webp',
	JPEG: 'jpeg',
};
export type ExtKeysT = keyof typeof extTypes;

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
export type TBaseSizeKeys<K extends TActionId | TCropId | TPlayerClassKeys> = K extends TActionId
	? keyof typeof UICardSize
	: K extends TCropId
	? keyof typeof UICardSize
	: K extends TPlayerClassKeys
	? keyof typeof UIClassSize
	: never;
