const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
console.log(path.resolve(__dirname, '../../src/UI/app/'));
module.exports = {
	entry: path.resolve(__dirname, '../../src/UI', 'index.tsx'),
	resolve: {
		alias: {
			components: path.resolve(__dirname, '../../src/UI/components'),
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
			template: path.resolve(__dirname, '../../public/', 'index.html'),
			title: 'Battle farm',
		}),
	],
};
