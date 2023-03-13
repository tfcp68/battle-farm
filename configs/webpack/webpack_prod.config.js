const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const getSettings = () => {
	return {
		mode: 'production',
		output: {
			filename: 'js/[name][hash].min.js',
			path: path.resolve(__dirname, '../../dist'),
			assetModuleFilename: 'assets/[hash][ext][query]',
			publicPath: '/',
			clean: true,
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
	};
};
const getPlugins = () => {
	return [
		new CompressionPlugin({
			algorithm: 'gzip',
		}),
	];
};
const getRules = () => {
	return [
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
	];
};

module.exports = { getRules, getPlugins, getSettings };
