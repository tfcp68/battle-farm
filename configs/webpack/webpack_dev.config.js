const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const getPlugins = () => {
	return [new ReactRefreshWebpackPlugin()];
};
const getRules = () => {
	return [
		{
			test: /\.(png|jpe?g|gif|svg)$/i,
			use: ['file-loader'],
		},
	];
};
const getSettings = () => {
	return {
		mode: 'development',
		devtool: 'inline-source-map',
		devServer: {
			hot: true,
		},
	};
};
module.exports = { getSettings, getRules, getPlugins };
