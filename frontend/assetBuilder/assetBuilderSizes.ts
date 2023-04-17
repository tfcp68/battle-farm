import { baseAssetNamesTypes } from './assetBuilderTypes';
import assetsDictionary from './assetBuilder';
import sizes from './assetSharedSIzes';

export const getClassesAssets = (size: keyof typeof sizes.UIClassSize) => {
	return assetsDictionary[baseAssetNamesTypes.CLASSES][size];
};
export const getActionsAssets = (size: keyof typeof sizes.UICardSize) => {
	return assetsDictionary[baseAssetNamesTypes.ACTIONS][size];
};
export const getCropsAssets = (size: keyof typeof sizes.UICardSize) => {
	return assetsDictionary[baseAssetNamesTypes.CROPS][size];
};
