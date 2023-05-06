import { extTypes, TAssetNamesKeys } from '../assetBuilder/assetBuilderTypes';
import { TUIAllSizesKeys } from '../../../frontend/notion/assetSIzes';
import { getPresetName } from '../uitls';

export const GetPresetsDefinePlugin = (sizes: TUIAllSizesKeys, assetType: TAssetNamesKeys) => {
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
