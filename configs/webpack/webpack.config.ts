import { Configuration } from 'webpack';
import { getBaseLayoutSettings, getPlugins } from './utils';
import { ROOT_DIR } from '../paths';
import * as ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

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
			'~/frontend': path.resolve(ROOT_DIR, 'frontend'),
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
					filename: '[path][hash:4][name][ext]',
				},
				use: [
					{
						loader: ImageMinimizerPlugin.loader,
						options: {
							generator: [
								{
									preset: 'webp',
									implementation: ImageMinimizerPlugin.sharpGenerate,
									options: {
										encodeOptions: {
											webp: {
												quality: 75,
												effort: 6,
											},
										},
									},
								},
								{
									preset: 'jpeg',
									implementation: ImageMinimizerPlugin.sharpGenerate,
									options: {
										encodeOptions: {
											jpeg: {
												quality: 75,
											},
										},
									},
								},
								{
									preset: 'avif',
									implementation: ImageMinimizerPlugin.sharpGenerate,
									options: {
										encodeOptions: {
											avif: {
												quality: 75,
												effort: 9,
											},
										},
									},
								},
							],
						},
					},
				],
			},
		],
	},

	plugins: getPlugins(isDev),
};
const Config: Configuration = { ...Object.assign(config, getBaseLayoutSettings(isDev)) };
export default Config;
