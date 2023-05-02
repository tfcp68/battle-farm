import * as webpack from 'webpack';
import * as ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import { getPresets } from './pluginsPresets/ImageMinimizerPresets';
import { UICardSize, UIClassSize } from '../../frontend/assetBuilder/assetSIzes';
import * as path from 'path';
import { ROOT_DIR } from '../paths';
import { GetPresetsDefinePlugin } from './pluginsPresets/definePluginPresets';

const config: webpack.Configuration = {
	mode: 'production',
	entry: [path.resolve(ROOT_DIR, 'configs/assetsWebpack/assetBuilder', 'assetBuilder.ts')],
	resolve: {
		alias: {
			'~/assets': path.resolve(ROOT_DIR, 'assets'),
		},
		extensions: ['.js', '.ts'],
	},
	target: 'node',
	output: {
		clean: true,
		filename: 'dictGenerate.js',
		path: path.resolve(ROOT_DIR, 'preBuild'),
	},
	plugins: [
		new webpack.DefinePlugin({
			...GetPresetsDefinePlugin(UIClassSize, 'Classes'),
			...GetPresetsDefinePlugin(UICardSize, 'Cards'),
		}),
	],
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
				test: /\.(jpe?g|gif|png|svg)$/i,
				type: 'asset',
				generator: {
					filename: '[path][hash:4]_[name][ext]',
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
};
export default config;
