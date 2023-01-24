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
	private _grammarPromise: Promise<vscodeTextmate.IGrammar>;
	private _configPromise: Promise<ConfigData>;
	private _tokenizer: TextmateTokenizerService;
	private _outliner?: DocumentOutlineService;
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
		this._registry = new vscodeTextmate.Registry(this.resolver);
		const grammarData = this.resolver.findGrammarByLanguageId(this.languageId);
		this._grammarPromise = this._registry.loadGrammar(grammarData.scopeName);

		const mapping = this._packageJSON['textmate-languageservices'] || {};
		const path = mapping[this.languageId] || './textmate-configuration.json';
		const uri = vscode.Uri.joinPath(this.context.extensionUri, path);
		const languageData = this.resolver.findLanguageById(this.languageId);
		this._configPromise = loadJsonFile<ConfigJson>(uri).then(json => new ConfigData(json, languageData));
		this._tokenizer = new TextmateTokenizerService(this._configPromise, this._grammarPromise);
	}

	public get resolver(): ResolverService {
		return this._resolver;
	}

	public get registry(): vscodeTextmate.Registry {
		return this._registry;
	}

	public get grammarPromise(): Promise<vscodeTextmate.IGrammar> {
		return this._grammarPromise;
	}

	public get configPromise(): Promise<ConfigData> {
		return this._configPromise;
	}

	public get tokenizer(): TextmateTokenizerService {
		return this._tokenizer;
	}

	public async createWorkspaceDocumentService(): Promise<WorkspaceDocumentService> {
		if (this._workspaceDocumentService) return this._workspaceDocumentService;
		const languageId = this.languageId;
		const config = await this.configPromise;
		this._workspaceDocumentService = new WorkspaceDocumentService(languageId, config);
		return this._workspaceDocumentService;
	}

	public async createDocumentOutlineService(): Promise<DocumentOutlineService> {
		if (this._outliner) return this._outliner;
		const tokenizer = this._tokenizer;
		const config = await this.configPromise;
		this._outliner = new DocumentOutlineService(tokenizer, config);
		return this._outliner;
	}

	public async createFoldingRangeProvider(): Promise<TextmateFoldingProvider> {
		const config = await this._configPromise;
		const tokenizer = this._tokenizer;
		const outliner = await this.createDocumentOutlineService();
		return new TextmateFoldingProvider(config, tokenizer, outliner);
	}

	public async createDocumentSymbolProvider(): Promise<TextmateDocumentSymbolProvider> {
		if (this._documentSymbolProvider) return this._documentSymbolProvider;
		const outliner = await this.createDocumentOutlineService();
		this._documentSymbolProvider = new TextmateDocumentSymbolProvider(outliner);
		return this._documentSymbolProvider;
	}

	public async createWorkspaceSymbolProvider(): Promise<TextmateWorkspaceSymbolProvider> {
		if (this._workspaceSymbolProvider) return this._workspaceSymbolProvider;
		const workspaceDocumentService = await this.createWorkspaceDocumentService();
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
