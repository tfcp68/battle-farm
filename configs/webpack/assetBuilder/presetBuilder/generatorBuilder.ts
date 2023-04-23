import { UICardSize, UIClassSize } from '../assetSIzes';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import { targetFormat } from '../assetBuilderTypes';

const a = ['webpSmallClasses', 'webpLargeClasses', 'avifSmallClasses'];
const formatSettings: {
	[T in string]: any;
} = {
	// https://sharp.pixelplumbing.com/api-output#avif
	avif: () => {
		return {
			effort: 9,
			quality: 75,
		};
	},
	// https://sharp.pixelplumbing.com/api-output#webp
	webp: () => {
		return {
			effort: 6,
			quality: 75,
		};
	},
	// https://sharp.pixelplumbing.com/api-output#jpeg
	jpeg: () => {
		return {
			quality: 75,
		};
	},
};
type baseDefaultLayout = {
	implementation: typeof ImageMinimizerPlugin.sharpGenerate;
	options: {
		[T in string]: any;
	};
	preset: string;
};

export function getPresets(sizes: typeof UIClassSize | typeof UICardSize, assetType: 'Classes' | 'Cards') {
	const result: baseDefaultLayout[] = [];
	const values = Object.values(sizes).filter((v) => !isNaN(Number(v)));
	const keys = Object.values(sizes).filter((v) => isNaN(Number(v)));

	for (const ext of targetFormat) {
		keys.forEach((size, index) => {
			result.push({
				implementation: ImageMinimizerPlugin.sharpGenerate,
				preset: ext + size + assetType,
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
	}
	return result;
}
