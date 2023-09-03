'use strict';

import TextmateLanguageService from '../../src/main';

// Factory function for language service.
function constructLanguageService(id: string): TextmateLanguageService {
	return new TextmateLanguageService(id, globalThis.languageId === 'matlab' ? globalThis.extensionContext : void 0);
}

// Factory function for language service component.
function initServiceComponent<T>(ls: TextmateLanguageService, name: string): T {
	return ls[name]() as T;
}

type DocumentService = ReturnType<TextmateLanguageService['initDocumentService']>;
type TokenService = ReturnType<TextmateLanguageService['initTokenService']>;
type TextmateOutlineService = ReturnType<TextmateLanguageService['initOutlineService']>;
type TextmateFoldingRangeProvider = ReturnType<TextmateLanguageService['createFoldingRangeProvider']>;
type TextmateDefinitionProvider = ReturnType<TextmateLanguageService['createDefinitionProvider']>;
type TextmateDocumentSymbolProvider = ReturnType<TextmateLanguageService['createDocumentSymbolProvider']>;
type TextmateWorkspaceSymbolProvider = ReturnType<TextmateLanguageService['createWorkspaceSymbolProvider']>;

/** `TextmateLanguageService` factory. */
export const textmateService = constructLanguageService(globalThis.languageId);

/** `DocumentService` component. */
export const documentServicePromise = initServiceComponent<DocumentService>(textmateService, 'initDocumentService');

/** `TokenizerService` component. */
export const tokenServicePromise = initServiceComponent<TokenService>(textmateService, 'initTokenService');

/** `OutlineService` component. */
export const outlineServicePromise = initServiceComponent<TextmateOutlineService>(textmateService, 'initOutlineService');

/** `TextmateFoldingRangeProvider` component. */
export const foldingRangeProviderPromise = initServiceComponent<TextmateFoldingRangeProvider>(textmateService, 'createFoldingRangeProvider');

/** `TextmateDefinitionProvider` component. */
export const definitionProviderPromise = initServiceComponent<TextmateDefinitionProvider>(textmateService, 'createDefinitionProvider');

/** `TextmateDocumentSymbolProvider` component. */
export const documentSymbolProviderPromise = initServiceComponent<TextmateDocumentSymbolProvider>(textmateService, 'createDocumentSymbolProvider');


/** `TextmateWorkspaceSymbolProvider` component. */
export const workspaceSymbolProviderPromise = initServiceComponent<TextmateWorkspaceSymbolProvider>(textmateService, 'createWorkspaceSymbolProvider');

/** API methods for grammar and token scope resolution. */
export const api = TextmateLanguageService.api;
