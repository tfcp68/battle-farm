const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { getBaseConfig } = require('./webpack.config');

const devConfig = {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		hot: true,
	},
	module: {
		rules: [
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				use: ['file-loader'],
			},
			...getBaseConfig().module.rules,
		],
	},
	plugins: [new ReactRefreshWebpackPlugin(), ...getBaseConfig().plugins],
};

module.exports = { ...getBaseConfig(), ...devConfig };
