const path = require('path');
const webpack = require('webpack');

/** @type {webpack.Configuration} */
const configuration = {
	mode: 'none',
	target: 'webworker',
	entry: {
		'test/runner-web': './test/runner-web.ts',
	},
	output: {
		globalObject: 'globalThis',
		libraryTarget: 'commonjs',
		path: path.join(__dirname, 'dist')
	},
	resolve: {
		extensions: ['.ts', '.js'],
		fallback: {
			crypto: false,
			path: require.resolve('path-browserify')
		},
		mainFields: ['browser', 'module', 'main']
	},
	module: {
		rules: [
			{ test: /\.ts$/, loader: 'ts-loader', options: { configFile: 'test/tsconfig.test.json' } },
			{ test: /\.wasm$/, type: 'javascript/auto', loader: 'encoded-uint8array-loader' }
		]
	},
	plugins: [
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
        new webpack.ProvidePlugin({ process: 'process/browser' })
	],
	externals: {
		'vscode': 'commonjs vscode',
		'crypto': 'commonjs crypto'
	}
};

module.exports = configuration;
