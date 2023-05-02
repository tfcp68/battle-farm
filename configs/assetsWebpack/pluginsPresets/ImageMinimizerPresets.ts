import { TUIAllSizes } from '../../../frontend/assetBuilder/assetSIzes';
import * as ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import { extTypes, TAssetNamesKeys } from '../assetBuilder/assetBuilderTypes';

const isDev = process.env.NODE_ENV === 'development';
export const getPresetName = (ext: string, size: string, assetName: string) => {
	return [ext, size, assetName].join('');
};
const formatSettings: {
	[T in string]: any;
} = {
	// https://sharps.pixelplumbing.com/api-output#avif
	avif: {
		effort: isDev ? 1 : 9,
		qualitys: 75,
	},

	// https://sharp.pixelplumbing.com/api-output#webp
	webp: {
		effort: isDev ? 1 : 6,
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

export function getPresets(sizes: TUIAllSizes, assetType: TAssetNamesKeys) {
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
