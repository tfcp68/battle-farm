const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('../paths');

function getBaseConfig() {
	return {
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
			],
		},

		plugins: [
			new HtmlWebpackPlugin({
				template: path.resolve(paths.ROOT_DIR, 'public', 'index.html'),
				title: 'Battle farm',
			}),
		],
	};
}

module.exports = { ...getBaseConfig };
