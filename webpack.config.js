// @ts-check
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

/** @type {webpack.Configuration} */
module.exports = {
	mode: 'none',
	target: 'node',
	entry: {
		index: './src/index.ts',
		'runner-web.test': './test/runner-web.test.ts',
		'runner-electron.test': './test/runner-electron.test.ts',
		'suite.test': './test/suite.test.ts'
	},
	externals: {
		'vscode': 'commonjs vscode',
		'crypto': 'commonjs crypto',
		'fs': 'commonjs fs',
		'@vscode/test-electron': 'commonjs @vscode/test-electron',
		'@vscode/test-web': 'commonjs @vscode/test-electron'
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
			{ test: /\.ts$/, loader: 'ts-loader' }
		]
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{
					from: path.join(__dirname, 'node_modules', 'vscode-oniguruma', 'release', 'onig.wasm'),
					to: path.resolve(__dirname, 'dist')
				}
			]
		})
	]
};
