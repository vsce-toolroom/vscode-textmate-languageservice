'use strict';

import TextmateLanguageService from '../../src/main';

// Factory function for language service.
function constructLanguageService(id: string): TextmateLanguageService {
	return new TextmateLanguageService(id, globalThis.extensionContext);
}

// Factory function for language service component.
function initServiceComponent<T>(ls: TextmateLanguageService, name: string): T {
	return ls[name]() as T;
}

/** `TextmateLanguageService` factory. */
export const textmateService = constructLanguageService(globalThis.languageId);

/** `DocumentService` component. */
type DocumentService = ReturnType<TextmateLanguageService['initDocumentService']>;
export const documentServicePromise = initServiceComponent<DocumentService>(textmateService, 'initDocumentService');

/** `TokenizerService` component. */
type TokenService = ReturnType<TextmateLanguageService['initTokenService']>;
export const tokenServicePromise = initServiceComponent<TokenService>(textmateService, 'initTokenService');

/** `OutlineService` component. */
type TextmateOutlineService = ReturnType<TextmateLanguageService['initOutlineService']>;
export const outlineServicePromise = initServiceComponent<TextmateOutlineService>(textmateService, 'initOutlineService');

/** `TextmateFoldingRangeProvider` component. */
type TextmateFoldingRangeProvider = ReturnType<TextmateLanguageService['createFoldingRangeProvider']>;
export const foldingRangeProviderPromise = initServiceComponent<TextmateFoldingRangeProvider>(textmateService, 'createFoldingRangeProvider');

/** `TextmateDefinitionProvider` component. */
type TextmateDefinitionProvider = ReturnType<TextmateLanguageService['createDefinitionProvider']>;
export const definitionProviderPromise = initServiceComponent<TextmateDefinitionProvider>(textmateService, 'createDefinitionProvider');

/** `TextmateDocumentSymbolProvider` component. */
type TextmateDocumentSymbolProvider = ReturnType<TextmateLanguageService['createDocumentSymbolProvider']>;
export const documentSymbolProviderPromise = initServiceComponent<TextmateDocumentSymbolProvider>(textmateService, 'createDocumentSymbolProvider');

/** `TextmateWorkspaceSymbolProvider` component. */
type TextmateWorkspaceSymbolProvider = ReturnType<TextmateLanguageService['createWorkspaceSymbolProvider']>;
export const workspaceSymbolProviderPromise = initServiceComponent<TextmateWorkspaceSymbolProvider>(textmateService, 'createWorkspaceSymbolProvider');
