import { TActionId } from '~/src/types/serializables/actions';
import { TCropId } from '~/src/types/serializables/crops';
import { TTPlayerClass } from '~/src/types/serializables/players';
import sizes from './assetSharedSIzes';

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
	? keyof typeof sizes.UICardSize
	: K extends baseAssetNamesTypes.CROPS
	? keyof typeof sizes.UICardSize
	: K extends baseAssetNamesTypes.CLASSES
	? keyof typeof sizes.UIClassSize
	: never;
