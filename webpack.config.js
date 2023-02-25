const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin').TsconfigPathsPlugin;

/** @type {webpack.Configuration} */
const configuration = {
	mode: 'production',
	target: 'node',
	entry: { 'src/main': './src/main.ts' },
	output: {
		globalObject: 'globalThis',
		library: 'TextmateLanguageService',
		libraryTarget: 'umd',
		path: path.join(__dirname, 'dist')
	},
	resolve: {
		extensions: ['.ts', '.js'],
		mainFields: ['module', 'main'],
		plugins: [new TsconfigPathsPlugin()]
	},
	module: {
		rules: [
			{ test: /\.ts$/, loader: 'ts-loader' },
			{ test: /\.wasm$/, type: 'javascript/auto', loader: 'encoded-uint8array-loader' }
		]
	},
	externals: {
		'vscode': 'commonjs vscode',
		'crypto': 'commonjs crypto'
	}
};

module.exports = configuration;
