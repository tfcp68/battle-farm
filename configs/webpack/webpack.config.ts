import { Configuration } from 'webpack';
import { getBaseLayoutSettings, getPlugins } from './utils';
import { ROOT_DIR } from '../paths';

const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

const config: Configuration = {
	entry: {
		index: [path.resolve(ROOT_DIR, 'frontend', 'index.tsx')],
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
				test: /\.(jpe?g|png|gif|svg|webp|avif)$/i,
				type: 'asset',
				generator: {
					filename: isDev ? '[path][name]_[hash][ext]' : '[path][hash][ext]',
				},
			},

			/*			{
							test: /\.(jpe?g|png|gif|svg)$/i,
							use: [
								{
									loader: ImageMinimizerPlugin.loader,
									options: {
										minimizer: {
											implementation: ImageMinimizerPlugin.sharpMinify,
											options: {
												encodeOptions: {
													jpeg: {
														// https://sharp.pixelplumbing.com/api-output#jpeg
														quality: 70,
													},
													webp: {
														// https://sharp.pixelplumbing.com/api-output#webp
														lossless: true,
														quality: 70,
													},
													avif: {
														// https://sharp.pixelplumbing.com/api-output#avif
														lossless: true,
													},

													// png by default sets the quality to 100%, which is same as lossless
													// https://sharp.pixelplumbing.com/api-output#png
													png: {
														quality: 70,
													},

													// gif does not support lossless compression at all
													// https://sharp.pixelplumbing.com/api-output#gif
													gif: {},
												},
											},
										},
									},
								},
							],
						},*/
		],
	},

	plugins: getPlugins(isDev),
};
const Config: Configuration = { ...Object.assign(config, getBaseLayoutSettings(isDev)) };
export default Config;
