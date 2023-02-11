// @ts-check
const path = require('node:path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin').TsconfigPathsPlugin;
const CopyPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const onigWasmSource = path.join(__dirname, 'node_modules', 'vscode-oniguruma', 'release', 'onig.wasm');
const onigWasmTargetDir = path.join(__dirname, 'dist', 'bin');

/** @type {webpack.Configuration} */
const configuration = {
	mode: 'none',
	target: 'node',
	entry: {
		'src/main': './src/main.ts'
	},
	externals: {
		'vscode': 'commonjs vscode'
	},
	resolve: {
		extensions: ['.ts', '.js'],
		plugins: [ new TsconfigPathsPlugin() ]
	},
	module: {
		rules: [{ test: /\.ts$/, loader: 'ts-loader' }]
	},
	plugins: [
		new CopyPlugin({ patterns: [{ from: onigWasmSource, to: onigWasmTargetDir }] }),
		new NodePolyfillPlugin()
	]
};

module.exports = configuration;
