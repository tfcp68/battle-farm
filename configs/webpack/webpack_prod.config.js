const common = require('./webpack.config');
const { merge } = require('webpack-merge');
const path = require('path');

module.exports = merge(common, {
	mode: 'production',
	output: {
		filename: 'js/bundle.[contenthash].min.js',
		path: path.resolve(__dirname, '../../dist'),
		publicPath: '/',
		clean: true,
	},
	devtool: 'source-map',
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
	},
});
