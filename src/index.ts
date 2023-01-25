'use strict';

import * as vscode from 'vscode';
import vscodeTextmate = require('vscode-textmate');
import { TextmateTokenizerService } from './services/tokenizer';
import { ConfigData } from './config/config';
import { loadJsonFile } from './util/loader';
import { getOniguruma } from './util/oniguruma';
import { ResolverService } from './services/resolver';
import { DocumentOutlineService } from './services/outline';
import { TextmateFoldingProvider } from './folding';
import { TextmateDocumentSymbolProvider } from './document-symbol';
import { WorkspaceDocumentService } from './services/document';
import { TextmateWorkspaceSymbolProvider } from './workspace-symbol';
import { TextmateDefinitionProvider } from './definition';

import type { ConfigJson } from './config/config';
import type { PackageJSON } from './services/resolver';

export default class LSP {
	private _packageJSON?: PackageJSON;
	private _resolver: ResolverService;
	private _registry: vscodeTextmate.Registry;
	private _configPromise: Promise<ConfigData>;
	private _grammarPromise: Promise<vscodeTextmate.IGrammar>;
	private _tokenService: TextmateTokenizerService;
	private _outlineService?: DocumentOutlineService;
	private _workspaceDocumentService?: WorkspaceDocumentService;
	private _documentSymbolProvider?: TextmateDocumentSymbolProvider;
	private _workspaceSymbolProvider?: TextmateWorkspaceSymbolProvider;
	private _definitionProvider?: TextmateDefinitionProvider;

	constructor(public readonly languageId: string, public readonly context: vscode.ExtensionContext) {
		this._packageJSON = this.context.extension.packageJSON as PackageJSON;

		const contributes = this._packageJSON?.contributes || {};
		const grammars = contributes?.grammars || [];
		const languages = contributes?.languages || [];
		const onigLibPromise = getOniguruma();

		this._resolver = new ResolverService(context, grammars, languages, onigLibPromise);
		this._registry = new vscodeTextmate.Registry(this._resolver);
		const grammarData = this._resolver.findGrammarByLanguageId(this.languageId);
		this._grammarPromise = this._registry.loadGrammar(grammarData.scopeName);

		const mapping = this._packageJSON['textmate-languageservices'] || {};
		const path = mapping[this.languageId] || './textmate-configuration.json';
		const uri = vscode.Uri.joinPath(this.context.extensionUri, path);
		const languageData = this._resolver.findLanguageById(this.languageId);
		this._configPromise = loadJsonFile<ConfigJson>(uri).then(json => new ConfigData(json, languageData));
	}

	public async initTokenizerService(): Promise<TextmateTokenizerService> {
		if (this._tokenService) return this._tokenService;
		const config = await this._configPromise;
		const grammar = await this._grammarPromise;
		this._tokenService = new TextmateTokenizerService(config, grammar);
		return this._tokenService;
	}

	public async initWorkspaceDocumentService(): Promise<WorkspaceDocumentService> {
		if (this._workspaceDocumentService) return this._workspaceDocumentService;
		const id = this.languageId;
		const config = await this._configPromise;
		this._workspaceDocumentService = new WorkspaceDocumentService(id, config);
		return this._workspaceDocumentService;
	}

	public async initDocumentOutlineService(): Promise<DocumentOutlineService> {
		if (this._outlineService) return this._outlineService;
		const config = await this._configPromise;
		const tokenizer = await this.initTokenizerService();
		this._outlineService = new DocumentOutlineService(config, tokenizer);
		return this._outlineService;
	}

	public async createFoldingRangeProvider(): Promise<TextmateFoldingProvider> {
		const config = await this._configPromise;
		const tokenizer = await this.initTokenizerService();
		const outlineService = await this.initDocumentOutlineService();
		return new TextmateFoldingProvider(config, tokenizer, outlineService);
	}

	public async createDocumentSymbolProvider(): Promise<TextmateDocumentSymbolProvider> {
		if (this._documentSymbolProvider) return this._documentSymbolProvider;
		const outlineService = await this.initDocumentOutlineService();
		this._documentSymbolProvider = new TextmateDocumentSymbolProvider(outlineService);
		return this._documentSymbolProvider;
	}

	public async createWorkspaceSymbolProvider(): Promise<TextmateWorkspaceSymbolProvider> {
		if (this._workspaceSymbolProvider) return this._workspaceSymbolProvider;
		const workspaceDocumentService = await this.initWorkspaceDocumentService();
		const documentSymbolProvider = await this.createDocumentSymbolProvider();
		this._workspaceSymbolProvider = new TextmateWorkspaceSymbolProvider(workspaceDocumentService, documentSymbolProvider);
		return this._workspaceSymbolProvider;
	}

	public async createDefinitionProvider(): Promise<TextmateDefinitionProvider> {
		if (this._definitionProvider) return this._definitionProvider;
		const config = await this._configPromise;
		const documentSymbolProvider = await this.createDocumentSymbolProvider();
		this._definitionProvider = new TextmateDefinitionProvider(config, documentSymbolProvider);
		return this._definitionProvider;
	}
}
