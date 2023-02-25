'use strict';

import * as vscode from 'vscode';

import { MockExtensionContext } from './context';
import TextmateLanguageService from '../../src/main';

// The API for runtime detection is frankly not sane.
// This is the best way to detect if we are in a web runtime.
// microsoft/vscode#104436; microsoft/vscode#134568
const isWebUI = vscode.env.uiKind === vscode.UIKind.Web;
const isRemote = typeof vscode.env.remoteName === 'string';
export const isWebRuntime = isWebUI && !isRemote;

/** {@link vscode.ExtensionContext} mock. */
export const extensionContext = new MockExtensionContext('Gimly81.matlab');

/** {@link TextmateLanguageService} factory. */
export const textmateService = new TextmateLanguageService('matlab', extensionContext);

/** {@link DocumentService} component. */
export const documentServicePromise = textmateService.initDocumentService();

/** {@link TokenizerService} component. */
export const tokenServicePromise = textmateService.initTokenService();

/** {@link OutlineService} component. */
export const outlineServicePromise = textmateService.initOutlineService();

/** {@link TextmateFoldingRangeProvider} component. */
export const foldingRangeProviderPromise = textmateService.createFoldingRangeProvider();

/** {@link TextmateDefinitionProvider} component. */
export const definitionProviderPromise = textmateService.createDefinitionProvider();

/** {@link TextmateDocumentSymbolProvider} component. */
export const documentSymbolProviderPromise = textmateService.createDocumentSymbolProvider();

/** {@link TextmateWorkspaceSymbolProvider} component. */
export const workspaceSymbolProviderPromise = textmateService.createWorkspaceSymbolProvider();

/** {@link loadJsonFile} utility. */
export const loadJsonFile = TextmateLanguageService.utils.loadJsonFile;

/** {@link TextmateScopeSelector} utility. */
export const TextmateScopeSelector = TextmateLanguageService.utils.TextmateScopeSelector;

/** {@link TextmateScopeSelectorMap} utility. */
export const TextmateScopeSelectorMap = TextmateLanguageService.utils.TextmateScopeSelectorMap;
