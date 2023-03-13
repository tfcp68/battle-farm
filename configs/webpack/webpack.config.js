const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('../paths');
const development = require('./webpack_dev.config');
const production = require('./webpack_prod.config');
const isDev = process.env.NODE_ENV === 'development';

const config = {
	entry: {
		index: [path.resolve(paths.SRC, './UI/index')],
	},
	resolve: {
		alias: {
			'~/components': path.resolve(paths.SRC, 'UI/components'),
			'~/assets': paths.ASSETS,
		},
		extensions: ['.tsx', '.ts', '.js'],
	},
	...(isDev ? development.getSettings() : development.getSettings()),
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
			...(isDev ? development.getRules() : production.getRules()),
		],
	},

	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(paths.ROOT_DIR, 'public', 'index.html'),
			title: 'Battle farm',
		}),
		...(isDev ? development.getPlugins() : production.getPlugins()),
	],
};
module.exports = config;
