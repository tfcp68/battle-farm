import { UICardSize, UIClassSize } from '../../frontend/assetBuilder/assetSIzes';
import { GetPresetsDefinePlugin } from './presetBuilder/definePluginPresets';

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('../paths');
const webpack = require('webpack');

export const getPlugins = (isDev: boolean) => {
	let plugins = [
		new webpack.DefinePlugin({
			...GetPresetsDefinePlugin(UIClassSize, 'Classes'),
			...GetPresetsDefinePlugin(UICardSize, 'Cards'),
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(paths.ROOT_DIR, 'public', 'index.html'),
			title: 'Battle farm',
		}),
	];
	plugins = isDev
		? plugins.concat([new ReactRefreshWebpackPlugin()])
		: plugins.concat([
				new CompressionPlugin({
					algorithm: 'gzip',
				}),
		  ]);
	return plugins;
};

export const getBaseLayoutSettings = (isDev: boolean) => {
	return isDev
		? {
				mode: 'development',
				devtool: 'inline-source-map',
				devServer: {
					hot: true,
				},
		  }
		: {
				output: {
					filename: 'js/[name][hash].min.js',
					path: path.resolve(__dirname, '../../dist'),
					publicPath: '/',
					clean: true,
				},
				mode: 'production',
				optimization: {
					minimize: true,
					minimizer: [new TerserPlugin()],
					splitChunks: {
						chunks: 'all',
						cacheGroups: {
							common: {
								test: /[\\/]node_modules[\\/]/,
								name: 'vendors',
								chunks: 'all',
							},
						},
					},
				},
		  };
};
