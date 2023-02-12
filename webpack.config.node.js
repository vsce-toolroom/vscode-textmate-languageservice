// @ts-check
const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin').TsconfigPathsPlugin;

/** @type {webpack.Configuration} */
const configuration = {
	mode: 'none',
	target: 'node',
	entry: './src/main.ts',
	externals: {
		'vscode': 'commonjs vscode'
	},
	resolve: {
		extensions: ['.ts', '.js'],
		plugins: [ new TsconfigPathsPlugin() ]
	},
	module: {
		rules: [
			{ test: /\.ts$/, loader: 'ts-loader' },
			{ test: /\.wasm$/, loader: 'arraybuffer-loader' }
		]
	},
	output: {
		chunkFormat: 'commonjs',
		filename: 'main.js',
		path: path.join(__dirname, 'dist', 'src'),
	}
};

module.exports = configuration;
