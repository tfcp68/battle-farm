import { assetNamesDictTypes } from './assetBuilderTypes';
import assetsDictionary from './assetBuilder';

export const getClassesAssets = () => {
	return assetsDictionary[assetNamesDictTypes.CLASSES];
};
export const getActionsAssets = () => {
	return assetsDictionary[assetNamesDictTypes.ACTIONS];
};
export const getCropsAssets = () => {
	return assetsDictionary[assetNamesDictTypes.CROPS];
};
