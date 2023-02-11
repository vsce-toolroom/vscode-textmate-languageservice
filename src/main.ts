'use strict';

import * as vscode from 'vscode';
import * as textmate from 'vscode-textmate';

import { TokenizerService } from './services/tokenizer';
import { ConfigData } from './config/config';
import { loadJsonFile } from './util/loader';
import { getOniguruma } from './util/oniguruma';
import { TextmateScopeSelector, TextmateScopeSelectorMap } from './util/selectors';
import { GrammarLanguageContribution, ResolverService } from './services/resolver';
import { OutlineService } from './services/outline';
import { DocumentService } from './services/document';
import { TextmateFoldingRangeProvider } from './folding';
import { TextmateDefinitionProvider } from './definition';
import { TextmateDocumentSymbolProvider } from './document-symbol';
import { TextmateWorkspaceSymbolProvider } from './workspace-symbol';

import type { ConfigJson } from './config/config';
import type { PackageJSON } from './services/resolver';

export default class LSP {
	constructor(public readonly languageId: string, public readonly context: vscode.ExtensionContext) {
		this._packageJSON = this.context.extension.packageJSON as PackageJSON;

		const contributes = this._packageJSON?.contributes || {};
		const grammars = (contributes?.grammars || [])
			.filter((g): g is GrammarLanguageContribution => !g.injectTo);
		const languages = contributes?.languages || [];
		const onigLibPromise = getOniguruma(context.extensionUri);

		this._resolver = new ResolverService(context, grammars, languages, onigLibPromise);
		this._registry = new textmate.Registry(this._resolver);
		const grammarData = this._resolver.findGrammarByLanguageId(this.languageId);
		this._grammarPromise = this._registry.loadGrammar(grammarData.scopeName);

		const mapping = this._packageJSON['textmate-languageservices'] || {};
		const path = mapping[this.languageId] || './textmate-configuration.json';
		const uri = vscode.Uri.joinPath(this.context.extensionUri, path);
		const languageData = this._resolver.findLanguageById(this.languageId);
		this._configPromise = loadJsonFile<ConfigJson>(uri).then(json => new ConfigData(json, languageData));
	}

	static utils = { loadJsonFile, TextmateScopeSelector, TextmateScopeSelectorMap };

	private _packageJSON?: PackageJSON;
	private _resolver: ResolverService;
	private _registry: textmate.Registry;
	private _configPromise: Promise<ConfigData>;
	private _grammarPromise: Promise<textmate.IGrammar>;
	private _tokenService: TokenizerService;
	private _outlineService?: OutlineService;
	private _documentService?: DocumentService;
	private _foldingRangeProvider?: TextmateFoldingRangeProvider;
	private _documentSymbolProvider?: TextmateDocumentSymbolProvider;
	private _workspaceSymbolProvider?: TextmateWorkspaceSymbolProvider;
	private _definitionProvider?: TextmateDefinitionProvider;

	public async initTokenService(): Promise<TokenizerService> {
		if (this._tokenService) return this._tokenService;
		const config = await this._configPromise;
		const grammar = await this._grammarPromise;
		this._tokenService = new TokenizerService(config, grammar);
		return this._tokenService;
	}

	public async initOutlineService(): Promise<OutlineService> {
		if (this._outlineService) return this._outlineService;

		const config = await this._configPromise;
		const tokenService = await this.initTokenService();
		this._outlineService = new OutlineService(config, tokenService);

		return this._outlineService;
	}

	public async initDocumentService(): Promise<DocumentService> {
		if (this._documentService) return this._documentService;

		const id = this.languageId;
		const config = await this._configPromise;
		this._documentService = new DocumentService(id, config);

		return this._documentService;
	}

	public async createFoldingRangeProvider(): Promise<TextmateFoldingRangeProvider> {
		if (this._foldingRangeProvider) return this._foldingRangeProvider;

		const config = await this._configPromise;
		const tokenService = await this.initTokenService();
		const outlineService = await this.initOutlineService();
		this._foldingRangeProvider = new TextmateFoldingRangeProvider(config, tokenService, outlineService);

		return this._foldingRangeProvider;
	}

	public async createDocumentSymbolProvider(): Promise<TextmateDocumentSymbolProvider> {
		if (this._documentSymbolProvider) return this._documentSymbolProvider;

		const outlineService = await this.initOutlineService();
		this._documentSymbolProvider = new TextmateDocumentSymbolProvider(outlineService);

		return this._documentSymbolProvider;
	}

	public async createWorkspaceSymbolProvider(): Promise<TextmateWorkspaceSymbolProvider> {
		if (this._workspaceSymbolProvider) return this._workspaceSymbolProvider;

		const documentService = await this.initDocumentService();
		const documentSymbolProvider = await this.createDocumentSymbolProvider();
		this._workspaceSymbolProvider = new TextmateWorkspaceSymbolProvider(documentService, documentSymbolProvider);

		return this._workspaceSymbolProvider;
	}

	public async createDefinitionProvider(): Promise<TextmateDefinitionProvider> {
		if (this._definitionProvider) return this._definitionProvider;

		const config = await this._configPromise;
		const outlineService = await this.initOutlineService();
		this._definitionProvider = new TextmateDefinitionProvider(config, outlineService);

		return this._definitionProvider;
	}
}
