import { TActionId } from '~/src/types/serializables/actions';
import { TCropId } from '~/src/types/serializables/crops';
import { TTPlayerClass } from '~/src/types/serializables/players';

export enum baseAssetNamesTypes {
	ACTIONS = 'actions',
	CLASSES = 'classes',
	CROPS = 'crops',
}

export type TBaseAssetType<K extends baseAssetNamesTypes> = K extends baseAssetNamesTypes.ACTIONS
	? TActionId
	: K extends baseAssetNamesTypes.CROPS
	? TCropId
	: K extends baseAssetNamesTypes.CLASSES
	? TTPlayerClass
	: never;
