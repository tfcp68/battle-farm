import { baseAssetNamesTypes, } from './assetBuilderTypes';
import assetsDictionary from "./assetBuilder";


export const getClassesAssets = () => {
	return assetsDictionary[baseAssetNamesTypes.CLASSES];
};
export const getActionsAssets = () => {
	return assetsDictionary[baseAssetNamesTypes.ACTIONS];
};
export const getCropsAssets = () => {
	return assetsDictionary[baseAssetNamesTypes.CROPS];
};
