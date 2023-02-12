// @ts-check
const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin').TsconfigPathsPlugin;
const CopyPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

/** @type {webpack.Configuration} */
const configuration = {
	mode: 'none',
	target: 'webworker',
	entry: {
		'src/web': './src/web.ts',
		'test/runner-web.test': { import: './test/runner-web.test.ts', dependOn: 'src/web' }
	},
	externals: {
		'vscode': 'commonjs vscode'
	},
	resolve: {
		alias: { '../../src/main': __dirname },
		extensions: ['.ts', '.js'],
		fallback: { crypto: false },
		plugins: [ new TsconfigPathsPlugin() ]
	},
	module: {
		rules: [
			{ test: /\.ts$/, loader: 'ts-loader' },
			{ test: /\.wasm$/, loader: 'arraybuffer-loader' }
		]
	},
	plugins: [
		new NodePolyfillPlugin({ includeAliases: ['path', 'assert'] })
	]
};

module.exports = configuration;
