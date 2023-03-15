'use strict';

const shelljs = require('shelljs');

shelljs.exec('webpack-cli --config webpack.config.js');
shelljs.exec('webpack-cli --config webpack.config.web.test.js');
shelljs.exec('tsc --project tsconfig.test.json');
shelljs.cp('-r', './out/test/*', './dist/test');
shelljs.rm('-rf', 'out', './dist/types/test', 'dist/test/data/selectors');
