import assetsDictionaryJson from '../../preBuild/assetDictionary.json';
import { TAssetNamesDict, TAssetsDictionary } from '../../configs/assetsWebpack/assetBuilder/assetBuilderTypes';

const assetDictionary = assetsDictionaryJson as TAssetsDictionary;
export const getClassesAssets = () => {
	return assetDictionary[TAssetNamesDict.CLASSES];
};

export const getActionsAssets = () => {
	return assetDictionary[TAssetNamesDict.ACTIONS];
};
export const getCropsAssets = () => {
	return assetDictionary[TAssetNamesDict.CROPS];
};
