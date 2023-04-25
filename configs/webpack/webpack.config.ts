import { Configuration } from 'webpack';
import { getBaseLayoutSettings, getPlugins } from './utils';
import { ROOT_DIR } from '../paths';
import { getPresets } from './presetBuilder/generatorBuilder';
import { UICardSize, UIClassSize } from '../../frontend/assetBuilder/assetSIzes';
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
				test: /\.(jpe?g|gif|png|svg)$/i,
				type: 'asset',
				generator: {
					filename: '[path][hash][ext]',
				},
				use: [
					{
						loader: ImageMinimizerPlugin.loader,
						options: {
							generator: [...getPresets(UIClassSize, 'Classes'), ...getPresets(UICardSize, 'Cards')],
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
