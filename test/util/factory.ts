'use strict';

import { MockExtensionContext } from './context';
import LSP from '../../src/main';

export const extensionContext = new MockExtensionContext('Gimly81.matlab');
export const lsp = new LSP('matlab', extensionContext);

export const documentServicePromise = lsp.initDocumentService();
export const tokenServicePromise = lsp.initTokenService();
export const outlineServicePromise = lsp.initOutlineService();
export const foldingRangeProviderPromise = lsp.createFoldingRangeProvider();
export const definitionProviderPromise = lsp.createDefinitionProvider();
export const documentSymbolProviderPromise = lsp.createDocumentSymbolProvider();
export const workspaceSymbolProviderPromise = lsp.createWorkspaceSymbolProvider();

export const loadJsonFile = LSP.utils.loadJsonFile;
export const TextmateScopeSelector = LSP.utils.TextmateScopeSelector;
export const TextmateScopeSelectorMap = LSP.utils.TextmateScopeSelectorMap;
