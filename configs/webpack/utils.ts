import {UICardSize, UIClassSize} from './assetBuilder/assetSIzes';
import { getPresets } from './assetBuilder/presetBuilder/generatorBuilder';
import {GetPresetsDefinePlugin} from "./assetBuilder/presetBuilder/definePluginPresets";
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('../paths');
const webpack = require('webpack');

const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');



export const getPlugins = (isDev: boolean) => {
	let plugins = [
		new webpack.DefinePlugin({
			...GetPresetsDefinePlugin(UIClassSize,"Classes"),
			...GetPresetsDefinePlugin(UICardSize,"Cards"),
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
					minimizer: [
						new TerserPlugin(),
						new ImageMinimizerPlugin({
							loader:false,
							generator: [...getPresets(UIClassSize,"Classes"), ...getPresets(UICardSize,'Cards')],
							minimizer: {
								implementation: ImageMinimizerPlugin.sharpMinify,
							},
						}),
					],
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
