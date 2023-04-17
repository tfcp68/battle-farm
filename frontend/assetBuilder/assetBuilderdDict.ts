import { baseAssetNamesTypes } from './assetBuilderTypes';
import assetsDictionary from './assetBuilder';
import { UICardSize, UIClassSize } from './assetSharedSIzes';

export const getClassesAssets = (size: keyof typeof UIClassSize) => {
	return assetsDictionary[baseAssetNamesTypes.CLASSES][size];
};
export const getActionsAssets = (size: keyof typeof UICardSize) => {
	return assetsDictionary[baseAssetNamesTypes.ACTIONS][size];
};
export const getCropsAssets = (size: keyof typeof UICardSize) => {
	return assetsDictionary[baseAssetNamesTypes.CROPS][size];
};
