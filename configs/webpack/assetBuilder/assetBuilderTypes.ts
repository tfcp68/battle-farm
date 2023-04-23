import { TActionId } from '~/src/types/serializables/actions';
import { TCropId } from '~/src/types/serializables/crops';
import { TTPlayerClass } from '~/src/types/serializables/players';
import { UICardSize, UIClassSize } from './assetSIzes';
export const targetFormat = ['avif', 'webp', 'jpeg'];
export enum baseAssetNamesTypes {
	ACTIONS = 'actions',
	CLASSES = 'classes',
	CROPS = 'crops',
}

export type baseAssetType<K extends baseAssetNamesTypes> = K extends baseAssetNamesTypes.ACTIONS
	? TActionId
	: K extends baseAssetNamesTypes.CROPS
	? TCropId
	: K extends baseAssetNamesTypes.CLASSES
	? TTPlayerClass
	: never;

export type baseAssetSizeType<K extends baseAssetNamesTypes> = K extends baseAssetNamesTypes.ACTIONS
	? keyof typeof UICardSize
	: K extends baseAssetNamesTypes.CROPS
	? keyof typeof UICardSize
	: K extends baseAssetNamesTypes.CLASSES
	? keyof typeof UIClassSize
	: never;
