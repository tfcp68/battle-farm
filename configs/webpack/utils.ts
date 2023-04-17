const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('../paths');
const webpack = require('webpack');
const sizes = require('../../frontend/assetBuilder/assetSharedSIzes');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { ROOT_DIR } = require('../paths');

/*const getRules = (isDev) => {
	return isDev
		? {
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: 'file-loader',
					},
				],
		  }
		: {
				test: /\.(png|jpe?g|gif|webp)$/i,
				type: 'asset/resource',
		  };
};*/
export const getPlugins = (isDev: boolean) => {
	let plugins = [
		new webpack.DefinePlugin({
			...sizes,
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(paths.ROOT_DIR, 'public', 'index.html'),
			title: 'Battle farm',
		}),
	];
	plugins = isDev
		? plugins.concat([new ReactRefreshWebpackPlugin()])
		: plugins.concat([
				new CompressionPlugin({
					algorithm: 'gzip',
				}),
				new CopyPlugin({
					patterns: [
						{
							from: path.resolve(ROOT_DIR, 'assets'),
							to: 'asset/[path][hash][ext]',
						},
					],
				}),
		  ]);
	return plugins;
};

export const getBaseLayoutSettings = (isDev: boolean) => {
	return isDev
		? {
				mode: 'development',
				devtool: 'inline-source-map',
				devServer: {
					hot: true,
				},
		  }
		: {
				output: {
					filename: 'js/[name][hash].min.js',
					path: path.resolve(__dirname, '../../dist'),
					publicPath: '/',
					clean: true,
					assetModuleFilename: '[path][hash][ext]',
				},
				mode: 'production',
				optimization: {
					minimize: true,
					minimizer: [
						new TerserPlugin(),
						new ImageMinimizerPlugin({
							// Disable loader
							loader: false,
							// Allows to keep original asset and minimized assets with different filenames
							deleteOriginalAssets: true,
							generator: [
								{
									type: 'asset',
									preset: 'webp-100',
									implementation: async (original: any, options: any) => {
										const inputExt = path.extname(original.filename).toLowerCase();
										console.log(original, options);
										if (inputExt !== '.xxx') {
											// Store error and return `null` if the implementation does not support this file type
											original.errors.push('error');
											return null;
										}

										let result;

										try {
											result = '';
										} catch (error) {
											// Store error and return `null` if there was an error
											original.errors.push(error);
											return null;
										}

										return {
											filename: original.filename,
											data: result,
											warnings: [...original.warnings],
											errors: [...original.errors],
											info: {
												...original.info,
												// Please always set it to prevent double minification
												generated: true,
												// Optional
												generatedBy: ['custom-name-of-minification'],
											},
										};
									},
									options: {
										resize: {
											enabled: true,
											width: 100,
											height: 10,
										},
										encodeOptions: {
											webp: {
												quality: 90,
											},
										},
									},
								},
							],

							minimizer: {
								implementation: ImageMinimizerPlugin.sharpMinify,
								options: {
									encodeOptions: {
										jpeg: {
											quality: 90,
										},
									},
								},
							},
						}),
					],
					splitChunks: {
						chunks: 'all',
						cacheGroups: {
							common: {
								test: /[\\/]node_modules[\\/]/,
								name: 'vendors',
								chunks: 'all',
							},
						},
					},
				},
		  };
};
