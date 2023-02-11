const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: path.resolve(__dirname, 'src/UI', 'index.tsx'),
	resolve: {
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
				test: /\.(css|scss)$/,
				use: ['style-loader', 'css-loader', 'sass-loader'],
			},
		],
	},

	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
		clean: true,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(
				__dirname,
				'src/UI/',
				'index.html.ejs'
			),
		}),
	],
};
