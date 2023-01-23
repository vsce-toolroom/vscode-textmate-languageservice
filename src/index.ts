'use strict';

import * as vscode from 'vscode';
import vscodeTextmate = require('vscode-textmate');
import { TextmateTokenizerService } from './services/tokenizer';
import { ConfigJson, ConfigData } from './config/config';
import { loadJsonFile } from './util/loader';
import { getOniguruma } from './util/oniguruma';
import { PackageJSON, ResolverService } from './services/resolver';
import { OutlineGenerator } from './services/outline';
import { TextmateFoldingProvider } from './folding';
import { DocumentSymbolProvider } from './document-symbol';
import { WorkspaceDocumentService } from './services/document';
import { WorkspaceSymbolProvider } from './workspace-symbol';
import { DefinitionProvider } from './definition';

export class LSP {
	private _packageJSON?: PackageJSON;
	private _resolver: ResolverService;
	private _registry: vscodeTextmate.Registry;
	private _grammarPromise: Promise<vscodeTextmate.IGrammar>;
	private _configPromise: Promise<ConfigData>;
	private _tokenizer: TextmateTokenizerService;
	private _outliner?: OutlineGenerator;
	private _workspaceDocumentService?: WorkspaceDocumentService;
	private _documentSymbolProvider?: DocumentSymbolProvider;
	private _workspaceSymbolProvider?: WorkspaceSymbolProvider;
	private _definitionProvider?: DefinitionProvider;

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
		this._tokenizer = new TextmateTokenizerService(this);
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

	public async createOutlineGeneratorService(): Promise<OutlineGenerator> {
		if (this._outliner) return this._outliner;
		const tokenizer = this._tokenizer;
		const config = await this.configPromise;
		this._outliner = new OutlineGenerator(tokenizer, config);
		return this._outliner;
	}

	public async createFoldingRangeProvider(): Promise<TextmateFoldingProvider> {
		const config = await this._configPromise;
		const tokenizer = this._tokenizer;
		const outliner = await this.createOutlineGeneratorService();
		return new TextmateFoldingProvider(config, tokenizer, outliner);
	}

	public async createDocumentSymbolProvider(): Promise<DocumentSymbolProvider> {
		if (this._documentSymbolProvider) return this._documentSymbolProvider;
		const outliner = await this.createOutlineGeneratorService();
		this._documentSymbolProvider = new DocumentSymbolProvider(outliner);
		return this._documentSymbolProvider;
	}

	public async createWorkspaceSymbolProvider(): Promise<WorkspaceSymbolProvider> {
		if (this._workspaceSymbolProvider) return this._workspaceSymbolProvider;
		const workspaceDocumentService = await this.createWorkspaceDocumentService();
		const documentSymbolProvider = await this.createDocumentSymbolProvider();
		this._workspaceSymbolProvider = new WorkspaceSymbolProvider(workspaceDocumentService, documentSymbolProvider);
		return this._workspaceSymbolProvider;
	}

	public async createDefinitionProvider(): Promise<DefinitionProvider> {
		if (this._definitionProvider) return this._definitionProvider;
		const config = await this._configPromise;
		const documentSymbolProvider = await this.createDocumentSymbolProvider();
		this._definitionProvider = new DefinitionProvider(config, documentSymbolProvider);
		return this._definitionProvider;
	}
}
