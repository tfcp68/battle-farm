import { UICardSize, UIClassSize } from '../../../frontend/assetBuilder/assetSIzes';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import { assetNamesDictTypesKeys, extTypes } from '../../../frontend/assetBuilder/assetBuilderTypes';

export const getPresetName = (ext: string, size: string, assetName: string) => {
	return [ext, size, assetName].join('');
};
const formatSettings: {
	[T in string]: any;
} = {
	// https://sharp.pixelplumbing.com/api-output#avif
	avif: {
		effort: 1,
		quality: 75,
	},

	// https://sharp.pixelplumbing.com/api-output#webp
	webp: {
		effort: 1,
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
};

export function getPresets(sizes: typeof UIClassSize | typeof UICardSize, assetType: assetNamesDictTypesKeys) {
	const result: baseDefaultLayout[] = [];
	const values = Object.values(sizes);
	const keys = Object.keys(sizes);
	Object.values(extTypes).forEach((ext) => {
		keys.forEach((size, index) => {
			result.push({
				implementation: ImageMinimizerPlugin.sharpGenerate,
				preset: getPresetName(ext, size, assetType),
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
