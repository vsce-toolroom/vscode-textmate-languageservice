'use strict';

import * as vscode from 'vscode';
import * as vscodeTextmate from 'vscode-textmate';

import { TokenizerService } from './services/tokenizer';
import { ConfigData } from './config';
import { loadJsonFile } from './util/loader';
import { getOniguruma } from './util/oniguruma';
import { TextmateScopeSelector, TextmateScopeSelectorMap } from './util/selectors';
import { ResolverService } from './services/resolver';
import { OutlineService } from './services/outline';
import { DocumentService } from './services/document';
import { TextmateFoldingRangeProvider } from './folding';
import { TextmateDefinitionProvider } from './definition';
import { TextmateDocumentSymbolProvider } from './document-symbol';
import { TextmateWorkspaceSymbolProvider } from './workspace-symbol';

import type { ConfigJson } from './config';
import type { ExtensionManifest } from './util/contributes';

const _private = Symbol('private');

interface Private {
	configPromise?: Promise<ConfigData>;
	grammarPromise?: Promise<vscodeTextmate.IGrammar>;

	tokenService?: TokenizerService;
	outlineService?: OutlineService;
	documentService?: DocumentService;

	foldingRangeProvider?: TextmateFoldingRangeProvider;
	documentSymbolProvider?: TextmateDocumentSymbolProvider;
	workspaceSymbolProvider?: TextmateWorkspaceSymbolProvider;
	definitionProvider?: TextmateDefinitionProvider;
}

export default class TextmateLanguageService {
	public static utils = { ResolverService, TextmateScopeSelector, TextmateScopeSelectorMap, loadJsonFile, getOniguruma };

	// In order to support default class export cleanly, we use Symbol private keyword.
	// Refs: microsoft/TypeScript#30355
	private [_private]: Private;
	public resolver: ResolverService;

	constructor(public readonly languageId: string, public readonly context?: vscode.ExtensionContext) {
		this[_private] = {};

		const onigLibPromise = getOniguruma();
		const resolver = this.resolver = new ResolverService(onigLibPromise, context);

		const extension = context?.extension || resolver.findExtensionByLanguageId(languageId);
		const manifest = extension?.packageJSON as ExtensionManifest | undefined;

		if (!manifest) {
			throw new Error('could not find extension contributing language ID "' + languageId + '"');
		}

		const registry = new vscodeTextmate.Registry(resolver);

		const grammarData = resolver.findGrammarDataByLanguageId(languageId);
		this[_private].grammarPromise = registry.loadGrammar(grammarData.scopeName);

		const paths = manifest['textmate-languageservices'] || {};
		const filepath = paths[languageId] || './textmate-configuration.json';

		const uri = vscode.Uri.joinPath(extension.extensionUri, filepath);
		const languageData = resolver.findLanguageDataById(languageId);
		this[_private].configPromise = loadJsonFile<ConfigJson>(uri)
			.then(json => new ConfigData(json, languageData))
			.catch(() => new ConfigData({}, languageData));
	}

	public async initTokenService(): Promise<TokenizerService> {
		if (this[_private].tokenService) {
			return this[_private].tokenService;
		}

		const config = await this[_private].configPromise;
		const grammar = await this[_private].grammarPromise;
		this[_private].tokenService = new TokenizerService(config, grammar);

		return this[_private].tokenService;
	}

	public async initOutlineService(): Promise<OutlineService> {
		if (this[_private].outlineService) {
			return this[_private].outlineService;
		}

		const config = await this[_private].configPromise;
		const tokenService = await this.initTokenService();
		this[_private].outlineService = new OutlineService(config, tokenService);

		return this[_private].outlineService;
	}

	public async initDocumentService(): Promise<DocumentService> {
		if (this[_private].documentService) {
			return this[_private].documentService;
		}

		const id = this.languageId;
		const config = await this[_private].configPromise;
		this[_private].documentService = new DocumentService(id, config);

		return this[_private].documentService;
	}

	public async createFoldingRangeProvider(): Promise<TextmateFoldingRangeProvider> {
		if (this[_private].foldingRangeProvider) {
			return this[_private].foldingRangeProvider;
		}

		const config = await this[_private].configPromise;
		const tokenService = await this.initTokenService();
		const outlineService = await this.initOutlineService();
		this[_private].foldingRangeProvider = new TextmateFoldingRangeProvider(config, tokenService, outlineService);

		return this[_private].foldingRangeProvider;
	}

	public async createDocumentSymbolProvider(): Promise<TextmateDocumentSymbolProvider> {
		if (this[_private].documentSymbolProvider) {
			return this[_private].documentSymbolProvider;
		}

		const outlineService = await this.initOutlineService();
		this[_private].documentSymbolProvider = new TextmateDocumentSymbolProvider(outlineService);

		return this[_private].documentSymbolProvider;
	}

	public async createWorkspaceSymbolProvider(): Promise<TextmateWorkspaceSymbolProvider> {
		if (this[_private].workspaceSymbolProvider) {
			return this[_private].workspaceSymbolProvider;
		}

		const documentService = await this.initDocumentService();
		const documentSymbolProvider = await this.createDocumentSymbolProvider();
		this[_private].workspaceSymbolProvider = new TextmateWorkspaceSymbolProvider(documentService, documentSymbolProvider);

		return this[_private].workspaceSymbolProvider;
	}

	public async createDefinitionProvider(): Promise<TextmateDefinitionProvider> {
		if (this[_private].definitionProvider) {
			return this[_private].definitionProvider;
		}

		const config = await this[_private].configPromise;
		const outlineService = await this.initOutlineService();
		this[_private].definitionProvider = new TextmateDefinitionProvider(config, outlineService);

		return this[_private].definitionProvider;
	}
}
