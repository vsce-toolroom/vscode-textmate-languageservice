'use strict';

const shelljs = require('shelljs');

shelljs.exec('webpack-cli --config webpack.config.js --stats-error-details');

shelljs.exec('tsc --project ./test/tsconfig.test.json');
shelljs.mkdir('./dist/test');
shelljs.cp('-r', './out/test/*', './dist/test');

shelljs.exec('webpack-cli --config webpack.config.web.test.js --stats-error-details');

shelljs.rm('-rf', 'out', './dist/types/test', 'dist/test/data/selectors');
