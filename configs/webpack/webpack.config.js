const path = require('path');
const paths = require('../paths');
const { getPlugins, getBaseLayoutSettings } = require('./utils');
const { ROOT_DIR } = require('../paths');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';

const config = {
	entry: {
		index: [path.resolve(ROOT_DIR, 'frontend', 'index.tsx')],
	},
	resolve: {
		alias: {
			'~/components': path.resolve(paths.ROOT_DIR, 'frontend/components'),
			'~/assets': path.resolve(paths.ROOT_DIR, 'assets'),
			'~/src': path.resolve(paths.ROOT_DIR, 'src'),
			'~/hooks': path.resolve(paths.ROOT_DIR, 'frontend/hooks'),
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
				test: /\.(png|jpe?g|gif)$/i,
				type: 'asset/resource',
				generator: {
					filename: isDev ? '[path][name][ext]' : '[path][hash][ext]',
				},
			},

			{
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
											quality: 100,
										},
										webp: {
											// https://sharp.pixelplumbing.com/api-output#webp
											lossless: true,
										},
										avif: {
											// https://sharp.pixelplumbing.com/api-output#avif
											lossless: true,
										},

										// png by default sets the quality to 100%, which is same as lossless
										// https://sharp.pixelplumbing.com/api-output#png
										png: {
											progressive: true,
											quality: 80,
											lossless: true,
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
			},
		],
	},

	plugins: getPlugins(isDev),
};
module.exports = Object.assign(config, getBaseLayoutSettings(isDev));
