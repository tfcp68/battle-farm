import { extTypes, TAssetNamesKeys } from '../../../src/types/build/assetBuilderTypes';
import { TUIAllSizes } from '../../../frontend/constants/assetSizes';
import { getPresetName } from '../uitls';

export const GetPresetsDefinePlugin = (sizes: TUIAllSizes, assetType: TAssetNamesKeys) => {
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
