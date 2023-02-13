const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin').TsconfigPathsPlugin;
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
		'vscode': 'commonjs vscode',
		'crypto': 'commonjs crypto'
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
			{ test: /\.wasm$/, type: 'javascript/auto', loader: 'encoded-uint8array-loader' }
		]
	},
	plugins: [
		new NodePolyfillPlugin({ includeAliases: ['path', 'assert'] })
	]
};

module.exports = configuration;
