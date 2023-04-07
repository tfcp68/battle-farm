const path = require('path');
const paths = require('../paths');
const { getPlugins, getRules, getBaseLayoutSettings } = require('./utils');
const { ROOT_DIR } = require('../paths');
const isDev = process.env.NODE_ENV === 'development';

const config = {
	entry: {
		index: [path.resolve(ROOT_DIR, 'src/UI', 'index.tsx')],
	},
	resolve: {
		alias: {
			'~/components': path.resolve(paths.ROOT_DIR, 'src/UI/components'),
			'~/assets': path.resolve(paths.ROOT_DIR, 'assets'),
			'~/src': path.resolve(paths.ROOT_DIR, 'src'),
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
			getRules(isDev),
		],
	},

	plugins: getPlugins(isDev),
};

module.exports = Object.assign(config, getBaseLayoutSettings(isDev));
