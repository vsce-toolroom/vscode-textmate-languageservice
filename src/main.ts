'use strict';

import * as vscode from 'vscode';
import * as vscodeTextmate from 'vscode-textmate';

import { TokenizerService } from './services/tokenizer';
import { ConfigData } from './config/config';
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

import type { ConfigJson } from './config/config';
import type { ExtensionManifest, GrammarLanguageContribution } from './services/resolver';

export default class LSP {
	public static utils = { TextmateScopeSelector, TextmateScopeSelectorMap, loadJsonFile };

	// In order to support default class export we need to use `#` private properties.
	// Refs: microsoft/TypeScript#30355
	#_extensionManifest?: ExtensionManifest;
	#_resolver: ResolverService;
	#_registry: vscodeTextmate.Registry;
	#_configPromise: Promise<ConfigData>;
	#_grammarPromise: Promise<vscodeTextmate.IGrammar>;
	#_tokenService: TokenizerService;
	#_outlineService?: OutlineService;
	#_documentService?: DocumentService;
	#_foldingRangeProvider?: TextmateFoldingRangeProvider;
	#_documentSymbolProvider?: TextmateDocumentSymbolProvider;
	#_workspaceSymbolProvider?: TextmateWorkspaceSymbolProvider;
	#_definitionProvider?: TextmateDefinitionProvider;

	constructor(public readonly languageId: string, public readonly context: vscode.ExtensionContext) {
		this.#_extensionManifest = this.context.extension.packageJSON as ExtensionManifest;

		const contributes = this.#_extensionManifest?.contributes || {};
		const grammars = (contributes?.grammars || [])
			.filter((g): g is GrammarLanguageContribution => g && !g.injectTo);
		const languages = contributes?.languages || [];
		const onigLibPromise = getOniguruma();

		this.#_resolver = new ResolverService(context, grammars, languages, onigLibPromise);
		this.#_registry = new vscodeTextmate.Registry(this.#_resolver);
		const grammarData = this.#_resolver.findGrammarByLanguageId(this.languageId);
		this.#_grammarPromise = this.#_registry.loadGrammar(grammarData.scopeName);

		const mapping = this.#_extensionManifest['textmate-languageservices'] || {};
		const path = mapping[this.languageId] || './textmate-configuration.json';
		const uri = vscode.Uri.joinPath(this.context.extensionUri, path);
		const languageData = this.#_resolver.findLanguageById(this.languageId);
		this.#_configPromise = loadJsonFile<ConfigJson>(uri).then(json => new ConfigData(json, languageData));
	}

	public async initTokenService(): Promise<TokenizerService> {
		if (this.#_tokenService) {
			return this.#_tokenService;
		}

		const config = await this.#_configPromise;
		const grammar = await this.#_grammarPromise;
		this.#_tokenService = new TokenizerService(config, grammar);

		return this.#_tokenService;
	}

	public async initOutlineService(): Promise<OutlineService> {
		if (this.#_outlineService) {
			return this.#_outlineService;
		}

		const config = await this.#_configPromise;
		const tokenService = await this.initTokenService();
		this.#_outlineService = new OutlineService(config, tokenService);

		return this.#_outlineService;
	}

	public async initDocumentService(): Promise<DocumentService> {
		if (this.#_documentService) {
			return this.#_documentService;
		}

		const id = this.languageId;
		const config = await this.#_configPromise;
		this.#_documentService = new DocumentService(id, config);

		return this.#_documentService;
	}

	public async createFoldingRangeProvider(): Promise<TextmateFoldingRangeProvider> {
		if (this.#_foldingRangeProvider) {
			return this.#_foldingRangeProvider;
		}

		const config = await this.#_configPromise;
		const tokenService = await this.initTokenService();
		const outlineService = await this.initOutlineService();
		this.#_foldingRangeProvider = new TextmateFoldingRangeProvider(config, tokenService, outlineService);

		return this.#_foldingRangeProvider;
	}

	public async createDocumentSymbolProvider(): Promise<TextmateDocumentSymbolProvider> {
		if (this.#_documentSymbolProvider) {
			return this.#_documentSymbolProvider;
		}

		const outlineService = await this.initOutlineService();
		this.#_documentSymbolProvider = new TextmateDocumentSymbolProvider(outlineService);

		return this.#_documentSymbolProvider;
	}

	public async createWorkspaceSymbolProvider(): Promise<TextmateWorkspaceSymbolProvider> {
		if (this.#_workspaceSymbolProvider) {
			return this.#_workspaceSymbolProvider;
		}

		const documentService = await this.initDocumentService();
		const documentSymbolProvider = await this.createDocumentSymbolProvider();
		this.#_workspaceSymbolProvider = new TextmateWorkspaceSymbolProvider(documentService, documentSymbolProvider);

		return this.#_workspaceSymbolProvider;
	}

	public async createDefinitionProvider(): Promise<TextmateDefinitionProvider> {
		if (this.#_definitionProvider) {
			return this.#_definitionProvider;
		}

		const config = await this.#_configPromise;
		const outlineService = await this.initOutlineService();
		this.#_definitionProvider = new TextmateDefinitionProvider(config, outlineService);

		return this.#_definitionProvider;
	}
}
