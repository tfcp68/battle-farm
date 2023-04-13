const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('../paths');

/*const getRules = (isDev) => {
	return isDev
		? {
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: 'file-loader',
					},
				],
		  }
		: {
				test: /\.(png|jpe?g|gif)$/i,
				type: 'asset/resource',
		  };
};*/
const getPlugins = (isDev) => {
	let plugins = [
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

const getBaseLayoutSettings = (isDev) => {
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
					assetModuleFilename: '[path][hash][ext]',
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
module.exports = { getBaseLayoutSettings /*getRules*/, getPlugins };
