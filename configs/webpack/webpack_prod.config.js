const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { getBaseConfig } = require('./webpack.config');

const prodConfig = {
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
			...getBaseConfig().module.rules,
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
		...getBaseConfig().plugins,
	],
};

module.exports = { ...getBaseConfig(), ...prodConfig };
