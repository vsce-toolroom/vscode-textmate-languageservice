// @ts-check
const path = require('node:path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin').TsconfigPathsPlugin;
const CopyPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const webEntryTypeSource = path.join(__dirname, 'dist', 'types', 'src', 'main.d.ts');
const webEntryTypeTarget = path.resolve(__dirname, 'dist', 'types', 'src', 'web.d.ts');

/** @type {webpack.Configuration} */
const configuration = {
	mode: 'none',
	target: 'webworker',
	entry: {
		'src/web': './src/main.ts',
		'test/runner-web.test': { import: './test/runner-web.test.ts', dependOn: 'src/web' }
	},
	externals: {
		'vscode': 'commonjs vscode'
	},
	resolve: {
		alias: {
			'src/main': path.resolve(__dirname, 'dist', 'src', 'web')
		},
		extensions: ['.ts', '.js'],
		plugins: [ new TsconfigPathsPlugin() ]
	},
	module: {
		rules: [{ test: /\.ts$/, loader: 'ts-loader' }]
	},
	plugins: [
		new CopyPlugin({
			patterns: [{ from: webEntryTypeSource, to: webEntryTypeTarget, toType: 'file' }]
		}),
		new NodePolyfillPlugin()
	]
};

module.exports = configuration;
