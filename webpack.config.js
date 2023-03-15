const path = require('path');
const webpack = require('webpack');

/** @type {webpack.Configuration} */
const configuration = {
	mode: 'none',
	target: 'node',
	entry: {
		'src/main': './src/main.ts'
	},
	output: {
		globalObject: 'globalThis',
		library: 'TextmateLanguageService',
		libraryTarget: 'umd',
		path: path.join(__dirname, 'dist')
	},
	resolve: {
		extensions: ['.ts', '.js'],
		mainFields: ['module', 'main']
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
