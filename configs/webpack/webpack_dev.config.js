const common = require('./webpack.config');
const { merge } = require('webpack-merge');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = merge(common, {
	mode: 'development',
	devServer: {
		hot: true,
	},
	plugins: [new ReactRefreshPlugin()],
});
