import { ROOT_DIR } from '../paths';

const CopyPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

export const getPlugins = (isDev: boolean) => {
	let plugins = [
		new HtmlWebpackPlugin({
			template: path.resolve(ROOT_DIR, 'public', 'index.html'),
			title: 'Battle farm',
		}),
	];
	plugins = isDev
		? plugins.concat()
		: plugins.concat([
				new CompressionPlugin({
					algorithm: 'gzip',
				}),
				new CopyPlugin({
					patterns: [
						{
							from: path.resolve(ROOT_DIR, 'assets', 'thumbs'),
							to: path.resolve(ROOT_DIR, 'dist'),
						},
					],
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
					static: {
						directory: path.join(ROOT_DIR, 'assets/thumbs/'),
						publicPath: '/',
					},
				},
		  }
		: {
				output: {
					filename: 'js/[name][hash].min.js',
					path: path.resolve(ROOT_DIR, 'dist'),
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
