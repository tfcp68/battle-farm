const common = require('./webpack.config');
const { merge } = require('webpack-merge');
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
	mode: 'production',
	output: {
		filename: 'js/[name][hash].min.js',
		path: path.resolve(__dirname, '../../dist'),
		assetModuleFilename: 'assets/[hash][ext][query]',
		publicPath: '/',
		clean: true,
	},

	module: {
		rules: [
			{
				test: /\.(scss)$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: false,
							modules: false,
						},
					},
					'sass-loader',
				],
			},
			{
				test: /\.(gif|png|jpe?g|svg)$/i,
				type: 'asset/resource',
				use: [
					{
						loader: 'image-webpack-loader',
						options: {
							pngquant: {
								quality: [0.35, 0.9],
								speed: 11,
							},
						},
					},
				],
			},
		],
	},

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

	plugins: [
		new CompressionPlugin({
			algorithm: 'gzip',
		}),
		new MiniCssExtractPlugin(),
	],
});
