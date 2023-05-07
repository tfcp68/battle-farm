import assetsDictionaryJson from '~/hooks/assetsDictionary.json';
import { TAssetNamesDict, TAssetsDictionary } from '~/src/types/build/assetBuilderTypes';
import { TPlayerClassKeys } from '~/src/types/serializables/players';
import { TUICardSizeKeys, TUIUIClassSizeKeys } from '../constants/assetSIzes';
import { TActionId } from '~/src/types/serializables/actions';
import { TCropId } from '~/src/types/serializables/crops';

const assetDictionary = assetsDictionaryJson as TAssetsDictionary;
export const getClassesAssets = (className: TPlayerClassKeys, size: TUIUIClassSizeKeys) => {
	const assetTypes = assetDictionary[TAssetNamesDict.CLASSES];
	if (!assetTypes) {
		throw new Error('Assets directory is empty');
	} else {
		const assetClass = assetTypes[className];
		if (!assetClass) {
			throw new Error(`Asset is missing with this className: ${className}`);
		} else {
			const assetSize = assetClass[size];
			if (!assetSize) {
				throw new Error(`Asset ${className} doesn't have this size: ${size}`);
			} else {
				return assetSize;
			}
		}
	}
};

export const getActionsAssets = (actionName: TActionId, size: TUICardSizeKeys) => {
	const assetTypes = assetDictionary[TAssetNamesDict.ACTIONS];
	if (!assetTypes) {
		throw new Error('Assets directory is empty');
	} else {
		const assetClass = assetTypes[actionName];
		if (!assetClass) {
			throw new Error(`Asset is missing with this actionName: ${actionName}`);
		} else {
			const assetSize = assetClass[size];
			if (!assetSize) {
				throw new Error(`Asset ${actionName} doesn't have this size: ${size}`);
			} else {
				return assetSize;
			}
		}
	}
};
export const getCropsAssets = (cropName: TCropId, size: TUICardSizeKeys) => {
	const assetTypes = assetDictionary[TAssetNamesDict.CROPS];
	if (!assetTypes) {
		throw new Error('Assets directory is empty');
	} else {
		const assetClass = assetTypes[cropName];
		if (!assetClass) {
			throw new Error(`Asset is missing with this cropName: ${cropName}`);
		} else {
			const assetSize = assetClass[size];
			if (!assetSize) {
				throw new Error(`Asset ${cropName} doesn't have this size: ${size}`);
			} else {
				return assetSize;
			}
		}
	}
};
