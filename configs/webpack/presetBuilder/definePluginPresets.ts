import { assetNamesDictTypesKeys, extTypes } from '../../../frontend/assetBuilder/assetBuilderTypes';
import { UICardSize, UIClassSize } from '../../../frontend/assetBuilder/assetSIzes';
import { getPresetName } from './generatorBuilder';

export const GetPresetsDefinePlugin = (
	sizes: typeof UIClassSize | typeof UICardSize,
	assetType: assetNamesDictTypesKeys
) => {
	const preset: any = {};
	const keys = Object.keys(sizes);
	Object.values(extTypes).forEach((ext) => {
		for (const size of keys) {
			const presetName = getPresetName(ext, size, assetType);
			preset[presetName] = JSON.stringify(presetName);
		}
	});

	return preset;
};
