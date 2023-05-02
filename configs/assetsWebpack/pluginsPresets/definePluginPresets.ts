import { extTypes, TAssetNamesKeys } from '../assetBuilder/assetBuilderTypes';
import { TUIAllSizes } from '../../../frontend/assetBuilder/assetSIzes';
import { getPresetName } from './ImageMinimizerPresets';

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
