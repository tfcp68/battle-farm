const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
	entry: {
		index: ['./src/UI/index.tsx'],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.jsx'],
		alias: {
			'~/assets': path.resolve(__dirname, '../../assets/'),
			'~/src': path.resolve(__dirname, '../../src/'),
		},
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
			template: path.resolve(__dirname, '../../public/', 'index.html'),
			title: 'Battle farm',
		}),
	],
};
