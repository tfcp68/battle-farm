import { Configuration } from 'webpack';
import { getBaseLayoutSettings, getPlugins } from './utils';
import { ROOT_DIR } from '../paths';
import { getPresets } from './assetBuilder/presetBuilder/generatorBuilder';
import { UICardSize, UIClassSize } from './assetBuilder/assetSIzes';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

const config: Configuration = {
	entry: {
		index: [path.resolve(ROOT_DIR, 'frontend', 'index.tsx')],
	},
	cache: {
		type: 'filesystem',
		allowCollectingMemory: true,
	},
	resolve: {
		alias: {
			'~/components': path.resolve(ROOT_DIR, 'frontend/components'),
			'~/assets': path.resolve(ROOT_DIR, 'assets'),
			'~/src': path.resolve(ROOT_DIR, 'src'),
			'~/hooks': path.resolve(ROOT_DIR, 'frontend/hooks'),
		},
		extensions: ['.tsx', '.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.(ts|js)x?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
					},
				],
			},
			{
				test: /\.(scss)$/,
				use: ['style-loader', 'css-loader', 'sass-loader'],
			},

			{
				test: /\.(jpe?g|gif|png|svg|webp|avif)$/i,
				type: 'asset/resource',
				generator: {
					filename: '[path][hash][ext]',
				},
			},
			{
				test: /\.(jpe?g|png|gif|svg|webp)$/i,
				use: [
					{
						loader: ImageMinimizerPlugin.loader,
						options: {
							minimizer: {
								implementation: ImageMinimizerPlugin.sharpMinify,
								options: {
									options: {
										encodeOptions: {
											jpeg: {
												// https://sharp.pixelplumbing.com/api-output#jpeg
												quality: 100,
											},
											webp: {
												quality: 10,
												// https://sharp.pixelplumbing.com/api-output#webp
												lossless: true,
											},
											avif: {
												// https://sharp.pixelplumbing.com/api-output#avif
												lossless: true,
											},

											// png by default sets the quality to 100%, which is same as lossless
											// https://sharp.pixelplumbing.com/api-output#png
											png: {},

											// gif does not support lossless compression at all
											// https://sharp.pixelplumbing.com/api-output#gif
											gif: {},
										},
									},
								},
							},
						},
					},
				],
			},

			{
				test: /\.(jpe?g|png|gif|svg|webp)$/i,
				loader: ImageMinimizerPlugin.loader,
				enforce: 'pre',
				options: {
					generator: [...getPresets(UIClassSize, 'Classes'), ...getPresets(UICardSize, 'Cards')],
				},
			},
		],
	},

	plugins: getPlugins(isDev),
};
const Config: Configuration = { ...Object.assign(config, getBaseLayoutSettings(isDev)) };
export default Config;
