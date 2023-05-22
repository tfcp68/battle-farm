import assetsDictionaryJson from '~/frontend/hooks/assetsDictionary.json';
import { extTypes, TAssetNamesDict, TAssetsDictionary, TBaseAssetSize } from '~/src/types/build/assetBuilderTypes';

const assetDictionary = assetsDictionaryJson as TAssetsDictionary;

export const getAssetPath = <T extends TAssetNamesDict>(
	assetType: T,
	assetName: keyof TAssetsDictionary[T],
	size: TBaseAssetSize<T>,
	ext: keyof typeof extTypes
) => {
	const assetTypes = assetDictionary[assetType];
	if (!assetTypes) throw new Error('Assets directory is empty');
	else {
		const assetClass = assetTypes[assetName];
		if (!assetClass) throw new Error(`Asset is missing with this className: ${assetName.toString}`);
		else {
			const assetSize = assetClass[size];
			if (!assetSize) throw new Error(`Asset ${assetName.toString} doesn't have this size: ${size}`);
			else {
				const assetExt = assetSize[ext];
				if (!assetExt) throw new Error(`Asset ${assetName.toString} doesn't have this ext: ${ext}`);
				else return assetExt;
			}
		}
	}
};
