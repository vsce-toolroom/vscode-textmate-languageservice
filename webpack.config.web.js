const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin').TsconfigPathsPlugin;

/** @type {webpack.Configuration} */
const configuration = {
	mode: 'none',
	target: 'webworker',
	entry: {
		'test/runner-web.test': './test/runner-web.test.ts'
	},
	output: {
		globalObject: 'globalThis',
		libraryTarget: 'commonjs',
		path: path.join(__dirname, 'dist')
	},
	resolve: {
		//alias: { 'src/main': 'src/web' },
		extensions: ['.ts', '.js'],
		fallback: {
			crypto: false,
			path: require.resolve('path-browserify')
		},
		mainFields: ['browser', 'module', 'main'],
		plugins: [new TsconfigPathsPlugin()]
	},
	module: {
		rules: [
			{ test: /\.ts$/, loader: 'ts-loader' },
			{ test: /\.wasm$/, type: 'javascript/auto', loader: 'encoded-uint8array-loader' }
		]
	},
	plugins: [
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
	],
	externals: {
		'vscode': 'commonjs vscode',
		'crypto': 'commonjs crypto'
	}
};

module.exports = configuration;
