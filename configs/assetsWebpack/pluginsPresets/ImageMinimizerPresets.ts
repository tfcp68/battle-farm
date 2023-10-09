import { TUIAllSizes } from '../../../frontend/constants/assetSizes';
import * as ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import { extTypes, TAssetNamesKeys } from '../../../src/types/build/assetBuilderTypes';
import { getPresetName } from '../uitls';

const formatSettings: {
	[T in string]: any;
} = {
	// https://sharp.pixelplumbing.com/api-output#avif
	avif: {
		effort: 9,
		quality: 75,
	},

	// https://sharp.pixelplumbing.com/api-output#webp
	webp: {
		effort: 6,
		quality: 75,
	},
	// https://sharp.pixelplumbing.com/api-output#jpeg
	jpeg: {
		quality: 75,
	},
};
type baseDefaultLayout = {
	implementation: typeof ImageMinimizerPlugin.sharpGenerate;
	options: {
		[T in string]: any;
	};
	preset: string;
	filename: () => string;
};

export function getPresets(sizes: TUIAllSizes, assetType: TAssetNamesKeys) {
	const result: baseDefaultLayout[] = [];
	const values = Object.values(sizes);

	const keys = Object.keys(sizes);
	Object.values(extTypes).forEach((ext) => {
		keys.forEach((size, index) => {
			result.push({
				implementation: ImageMinimizerPlugin.sharpGenerate,
				preset: getPresetName(ext, size, assetType),
				filename: () => `[path]/${size}/${ext}/[name][ext]`,
				options: {
					encodeOptions: {
						[ext]: {
							...formatSettings[ext],
						},
					},

					resize: {
						enabled: true,
						width: values[index],
					},
				},
			});
		});
	});

	return result;
}
