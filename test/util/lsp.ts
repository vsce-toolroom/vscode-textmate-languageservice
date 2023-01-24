'use strict';

import { LSP } from '../../src';
import mockedContext from './context';

const lsp = new LSP('matlab', mockedContext);

export default lsp;
