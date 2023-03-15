'use strict';

import * as vscode from 'vscode';

import { MockExtensionContext } from './context';
import TextmateLanguageService from '../../src/main';

type TextmateLanguageServiceType = typeof TextmateLanguageService.prototype;

// The API for runtime detection is frankly not sane.
// This is the best way to detect if we are in a web runtime.
// microsoft/vscode#104436; microsoft/vscode#134568
const isWebUI = vscode.env.uiKind === vscode.UIKind.Web;
const isRemote = typeof vscode.env.remoteName === 'string';
export const isWebRuntime = isWebUI && !isRemote;

// Factory function for extension context mock.
function mockupExtensionContext(id: string): MockExtensionContext {
	if (!vscode.extensions.getExtension(id)) {
		return void 0 as unknown as MockExtensionContext;
	}
	return new MockExtensionContext(id);
}

// Factory function for language service.
function constructLanguageService(id: string, context: MockExtensionContext): TextmateLanguageService {
	if (!context) {
		return void 0 as unknown as TextmateLanguageService;
	}
	return new TextmateLanguageService(id, context);
}

// Factory function for language service component.
function initServiceComponent<T extends NonNullable<object>>(languageService: TextmateLanguageService, methodName: string): T {
	if (!languageService) {
		return void 0 as unknown as T;
	}
	return languageService[methodName]() as T;
}

/** `vscode.ExtensionContext` mock for MATLAB. */
export const matlabContext = mockupExtensionContext('Gimly81.matlab');

/** `vscode.ExtensionContext` mock for TypeScript. */
export const typescriptContext = mockupExtensionContext('sndst00m.vscode-typescript-textmate');

/** `TextmateLanguageService` factory for `matlab`. */
export const matlabTextmateService = constructLanguageService('matlab', matlabContext);

/** `DocumentService` component for `matlab`. */
type DocumentService = ReturnType<TextmateLanguageServiceType['initDocumentService']>;
export const matlabDocumentServicePromise = initServiceComponent<DocumentService>(matlabTextmateService, 'initDocumentService');

/** `TokenizerService` component for `matlab`. */
type TokenService = ReturnType<TextmateLanguageServiceType['initTokenService']>;
export const matlabTokenServicePromise = initServiceComponent<TokenService>(matlabTextmateService, 'initTokenService');

/** `OutlineService` component for `matlab`. */
type TextmateOutlineService = ReturnType<TextmateLanguageServiceType['initOutlineService']>;
export const matlabOutlineServicePromise = initServiceComponent<TextmateOutlineService>(matlabTextmateService, 'initOutlineService');

/** `TextmateFoldingRangeProvider` component for `matlab`. */
type TextmateFoldingRangeProvider = ReturnType<TextmateLanguageServiceType['createFoldingRangeProvider']>;
export const matlabFoldingRangeProviderPromise = initServiceComponent<TextmateFoldingRangeProvider>(matlabTextmateService, 'createFoldingRangeProvider');

/** `TextmateDefinitionProvider` component for `matlab`. */
type TextmateDefinitionProvider = ReturnType<TextmateLanguageServiceType['createDefinitionProvider']>;
export const matlabDefinitionProviderPromise = initServiceComponent<TextmateDefinitionProvider>(matlabTextmateService, 'createDefinitionProvider');

/** `TextmateDocumentSymbolProvider` component for `matlab`. */
type TextmateDocumentSymbolProvider = ReturnType<TextmateLanguageServiceType['createDocumentSymbolProvider']>;
export const matlabDocumentSymbolProviderPromise = initServiceComponent<TextmateDocumentSymbolProvider>(matlabTextmateService, 'createDocumentSymbolProvider');

/** `TextmateWorkspaceSymbolProvider` component for `matlab`. */
type TextmateWorkspaceSymbolProvider = ReturnType<TextmateLanguageServiceType['createWorkspaceSymbolProvider']>;
export const matlabWorkspaceSymbolProviderPromise = initServiceComponent<TextmateWorkspaceSymbolProvider>(matlabTextmateService, 'createWorkspaceSymbolProvider');

/** `TextmateLanguageService` `typescript` factory. */
export const typescriptTextmateService = constructLanguageService('typescript', typescriptContext);

/** `DocumentService` component for lang ID `typescript`. */
export const typescriptDocumentServicePromise = initServiceComponent<DocumentService>(typescriptTextmateService, 'initDocumentService');

/** `TokenizerService` component for lang ID `typescript`. */
export const typescriptTokenServicePromise = initServiceComponent<TokenService>(typescriptTextmateService, 'initTokenService');

/** `loadJsonFile` utility. */
export const loadJsonFile = TextmateLanguageService.utils.loadJsonFile;

/** `TextmateScopeSelector` utility. */
export const TextmateScopeSelector = TextmateLanguageService.utils.TextmateScopeSelector;

/** `TextmateScopeSelectorMap` utility. */
export const TextmateScopeSelectorMap = TextmateLanguageService.utils.TextmateScopeSelectorMap;
