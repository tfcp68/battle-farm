import assetsDictionaryJson from '~/hooks/assetsDictionary.json';
import {
	ExtKeysT,
	TAssetNamesDict,
	TAssetsDictionary,
} from '../../configs/assetsWebpack/assetBuilder/assetBuilderTypes';
import { TPlayerClassKeys } from '~/src/types/serializables/players';
import { TUICardSizeKeys, TUIUIClassSizeKeys } from '../notion/assetSIzes';
import { TActionId } from '~/src/types/serializables/actions';
import { TCropId } from '~/src/types/serializables/crops';

const assetDictionary = assetsDictionaryJson as TAssetsDictionary;
export const getClassesAssets = (className: TPlayerClassKeys, size: TUIUIClassSizeKeys, format: ExtKeysT) => {
	return assetDictionary[TAssetNamesDict.CLASSES]![className]![size]![format];
};
export const getActionsAssets = (actionName: TActionId, size: TUICardSizeKeys, format: ExtKeysT) => {
	return assetDictionary[TAssetNamesDict.ACTIONS]![actionName]![size]![format];
};
export const getCropsAssets = (actionName: TCropId, size: TUICardSizeKeys, format: ExtKeysT) => {
	return assetDictionary[TAssetNamesDict.CROPS]![actionName]![size]![format];
};
