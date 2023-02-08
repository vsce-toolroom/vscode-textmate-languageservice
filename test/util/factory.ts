'use strict';

import { MockExtensionContext } from './context';
import { LSP } from '../../src/index';

export const context = new MockExtensionContext('Gimly81.matlab');
export const lsp = new LSP('matlab', context);

export const documentServicePromise = lsp.initDocumentService();
export const tokenServicePromise = lsp.initTokenService();
export const outlineServicePromise = lsp.initOutlineService();
export const foldingRangeProviderPromise = lsp.createFoldingRangeProvider();
export const definitionProviderPromise = lsp.createDefinitionProvider();
export const documentSymbolProviderPromise = lsp.createDocumentSymbolProvider();
export const workspaceSymbolProviderPromise = lsp.createWorkspaceSymbolProvider();
