const common = require('./webpack.config');
const { merge } = require('webpack-merge');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
	mode: 'development',
	devServer: {
		hot: true,
		static: {
			directory: path.join(__dirname, 'dist'),
		},
		port: 3000,

	},
	plugins: [new ReactRefreshPlugin()],
});
