'use strict';

import * as vscode from 'vscode';
import type * as vscodeTextmate from 'vscode-textmate';

import type { PartialDeep, JsonObject, PackageJson } from 'type-fest';
import { loadJsonFile, loadMessageBundle } from './loader';

type PartialJsonObject = PartialDeep<JsonObject>;

interface RegExpConfiguration {
	flags?: string;
	pattern: string;
};

type RegExpsStringified<T> = T extends RegExp
	? string | RegExpConfiguration
	: { [K in keyof T]: RegExpsStringified<T[K]> };

const localize = loadMessageBundle();

export interface EmbeddedLanguagesDefinition {
	[scopeName: string]: string;
}

export interface TokenTypeDefinition {
	[scopeName: string]: string;
}

export interface GrammarLanguageDefinition {
	language: string;
	scopeName: string;
	path: string;
	embeddedLanguages?: EmbeddedLanguagesDefinition;
	tokenTypes?: TokenTypeDefinition;
    balancedBracketSelectors?: string[];
    unbalancedBracketSelectors?: string[];
}

export interface GrammarInjectionContribution {
	scopeName: string;
	path: string;
	injectTo: string[];
	embeddedLanguages?: EmbeddedLanguagesDefinition;
	tokenTypes?: TokenTypeDefinition;
}

export type GrammarDefinition = GrammarLanguageDefinition | GrammarInjectionContribution;

export function isGrammarLanguageDefinition(g: GrammarDefinition): g is GrammarLanguageDefinition {
	return g && 'language' in g === true;
}

export function isGrammarInjectionContribution(g: GrammarDefinition): g is GrammarInjectionContribution {
	return g && 'injectTo' in g === true;
}

export interface LanguageDefinition {
	aliases?: string[];
	configuration?: string;
	extensions?: string[];
	filenames?: string[];
	firstLine?: string;
	icon?: string | { light: string; dark: string };
	id: string;
	mimetypes?: string[];
}

export type LanguageData = LanguageDefinition[];
export type GrammarData = GrammarDefinition[];

export interface ExtensionContributions extends PartialJsonObject {
	languages?: PartialJsonObject & LanguageData;
	grammars?: PartialJsonObject & GrammarData;
}

export interface ConfigurationPaths {
	[languageId: string]: string;
}

export interface ExtensionManifest extends PackageJson {
	enabledApiProposals?: string[];
	contributes?: ExtensionContributions;
	/** Mapping from language ID to config path. Default: `./textmate-configuration.json`. */
	'textmate-languageservices'?: ConfigurationPaths;
	/** Ersatz extension contributions - a service wiring to any language grammars. */
	'textmate-languageservice-contributes'?: ExtensionContributions;
}

export const contributionKeys: ExtensionManifestContributionKey[] = [
	'textmate-languageservice-contributes',
	'contributes'
];

export type ExtensionManifestContributionKey = 'textmate-languageservice-contributes' | 'contributes';

export type ExtensionData = Record<string, vscode.Extension<unknown> | undefined>;

class IndentationRule implements vscode.IndentationRule {
	public decreaseIndentPattern: RegExp;
	public increaseIndentPattern: RegExp;
	public indentNextLinePattern?: RegExp;
	public unIndentedLinePattern?: RegExp;
	constructor(data: RegExpsStringified<vscode.IndentationRule>) {
		this.decreaseIndentPattern = fromEntryToRegExp(data.decreaseIndentPattern);
		this.increaseIndentPattern = fromEntryToRegExp(data.increaseIndentPattern);
		if (this.indentNextLinePattern) {
			this.indentNextLinePattern = fromEntryToRegExp(data.indentNextLinePattern);
		}
		if (this.unIndentedLinePattern) {
			this.unIndentedLinePattern = fromEntryToRegExp(data.unIndentedLinePattern);
		}
	}
}

class OnEnterRule implements vscode.OnEnterRule {
	public action: vscode.EnterAction;
	public afterText?: RegExp;
	public beforeText: RegExp;
	public previousLineText?: RegExp;
	constructor(data: RegExpsStringified<vscode.OnEnterRule>) {
		this.beforeText = fromEntryToRegExp(data.beforeText);
		this.action = data.action;
		if (data.afterText) {
			this.afterText = fromEntryToRegExp(data.afterText);
		}
		if (data.previousLineText) {
			this.previousLineText = fromEntryToRegExp(data.previousLineText);
		}
	}
}

export const plaintextLanguageDefinition: LanguageDefinition = {
	aliases: [localize('plainText.alias', 'Plain Text'), 'text'],
	extensions: ['.txt'],
	id: 'plaintext',
	mimetypes: ['text/plain']
};

export const plaintextGrammarDefinition = {
	language: 'plaintext',
	path: './out/vs/editor/common/languages/plaintext.tmLanguage.json',
	scopeName: 'text'
};

export const plaintextLanguageConfiguration: vscode.LanguageConfiguration = {
	brackets: [
		['(', ')'],
		['[', ']'],
		['{', '}']
	]
};

function getAllContributes() {
	const languages: LanguageData = [plaintextLanguageDefinition];
	const grammars: GrammarData = [plaintextGrammarDefinition];
	const sources = {
		grammars: {} as ExtensionData,
		languages: {} as ExtensionData
	};
	for (const extension of vscode.extensions.all) {
		const manifest = extension.packageJSON as ExtensionManifest | void;
		if (!manifest) {
			continue;
		}

		for (const key of contributionKeys) {
			const contributes = manifest[key] as ExtensionManifest[ExtensionManifestContributionKey] | void;
			if (!contributes) {
				continue;
			}

			const l = contributes.languages || [];
			const g = contributes.grammars || [];
			languages.push(...l);
			grammars.push(...g);

			for (const language of l) {
				sources.languages[language.id] = extension;
			}
			for (const grammar of g) {
				sources.grammars[grammar.scopeName] = extension;
			}
		}
	}
	return { grammars, languages, sources };
}

const vscodeContributes = getAllContributes();

export class ContributorData {
	private _languages: LanguageData;
	private _grammars: GrammarData;
	private _injections: { [scopeName: string]: string[] };
	private _sources: Record<'grammars' | 'languages', ExtensionData>;
	private _injectedEmbeddedLanguages: Record<string, EmbeddedLanguagesDefinition[]>;

	constructor(context?: vscode.ExtensionContext) {
		const manifest = context?.extension?.packageJSON as ExtensionManifest | void;
		this._languages = vscodeContributes.languages;
		this._grammars = vscodeContributes.grammars;
		this._sources = vscodeContributes.sources;

		if (manifest) {
			const priorityLanguages = manifest?.contributes?.languages;
			const priorityGrammars = manifest?.contributes?.grammars;

			if (priorityLanguages && !!priorityLanguages.length) {
				this._languages = sortContributionsExtensionLast(priorityLanguages, this._languages, 'id');
			}

			if (priorityGrammars && !!priorityGrammars.length) {
				this._grammars = sortContributionsExtensionLast(priorityGrammars, this._grammars, 'scopeName');
			}
		}

		this._injections = computeInjections(this._grammars);
		this._injectedEmbeddedLanguages = computeInjectedEmbeddedLanguages(this._grammars);
	}

	public get languages() {
		return this._languages;
	}

	public get grammars() {
		return this._grammars;
	}

	public get injections() {
		return this._injections;
	}

	public get sources() {
		return this._sources;
	}

	public findLanguageByExtension(fileExtension: string): string {
		for (const language of this.languages.reverse()) {
			if (!language.extensions) {
				continue;
			}
			for (const extension of language.extensions) {
				if (extension === fileExtension) {
					return language.id;
				}
			}
		}
		return plaintextLanguageDefinition.id;
	}

	public findLanguageByFilename(fileLabel: string): string {
		for (const language of this.languages.reverse()) {
			if (!language.filenames) {
				continue;
			}
			for (const filename of language.filenames) {
				if (filename === fileLabel) {
					return language.id;
				}
			}
		}
		return plaintextLanguageDefinition.id;
	}

	public findGrammarScopeNameFromFilename(fileLabel: string): string {
		const extname = fileLabel.substring(fileLabel.lastIndexOf('.'));
		const language = this.findLanguageByFilename(fileLabel) || this.findLanguageByExtension(extname);
		if (!language) {
			return plaintextGrammarDefinition.scopeName;
		}

		const grammar = this.getGrammarDefinitionFromLanguageId(language);
		return grammar ? grammar.scopeName : plaintextGrammarDefinition.scopeName;
	}

	public findLanguageIdFromScopeName(scopeName: string): string {
		const grammarData = this.getGrammarDefinitionFromScopeName(scopeName);
		if (grammarData && isGrammarLanguageDefinition(grammarData)) {
			return grammarData.language;
		}
		return plaintextLanguageDefinition.id;
	}

	public getInjections(scopeName: string): string[] {
		const injections: string[] = [];
		const scopeParts = scopeName.split('.');
		for (let i = 1; i <= scopeParts.length; i++) { // order matters
			const subScopeName = scopeParts.slice(0, i).join('.');
			injections.push(...(this._injections[subScopeName] || []));
		}
		return injections;
	}

	public getEncodedLanguageId(languageId: string): number | undefined {
		const index = vscodeContributes.languages.findIndex(l => l.id === languageId);
		return index !== -1 ? index + 1 : void 0; // cannot be 0 per vscode-textmate API
	}

	public getLanguageDefinitionFromId(languageId: string): LanguageDefinition {
		for (const language of this.languages.reverse()) {
			if (language.id === languageId) {
				return language;
			}
		}
		return plaintextLanguageDefinition;
	}

	public getLanguageDefinitionFromFilename(filename: string): LanguageDefinition {
		const extname = filename.substring(filename.lastIndexOf('.'));
		const languageId = this.findLanguageByFilename(filename) || this.findLanguageByExtension(extname);
		if (!languageId) {
			return plaintextLanguageDefinition;
		}
		const languageData = this.getExtensionFromLanguageId(languageId);
		if (!languageData) {
			return plaintextLanguageDefinition;
		}
		return languageData;
	}

	public getGrammarDefinitionFromScopeName(scopeName: string): GrammarDefinition {
		for (const grammar of this.grammars.reverse()) {
			if (grammar.scopeName === scopeName) {
				return grammar;
			}
		}
		return plaintextGrammarDefinition;
	}

	public getGrammarDefinitionFromLanguageId(languageId: string): GrammarLanguageDefinition {
		for (const grammar of this.grammars.reverse()) {
			if (isGrammarLanguageDefinition(grammar) && grammar.language === languageId) {
				return grammar;
			}
		}
		return plaintextGrammarDefinition;
	}

	public getEmbeddedLanguagesFromLanguageId(languageId: string): vscodeTextmate.IEmbeddedLanguagesMap {
		const grammarData = this.getGrammarDefinitionFromLanguageId(languageId);
		const embeddedLanguagesDefinition = grammarData.embeddedLanguages || {};
		const injectedEmbeddedLanguages = this._injectedEmbeddedLanguages[grammarData.scopeName];

		const languageMap = {};

		for (const key in embeddedLanguagesDefinition) {
			if (Object.prototype.hasOwnProperty.call(embeddedLanguagesDefinition, key)) {
				const encodedLanguageId = this.getEncodedLanguageId(embeddedLanguagesDefinition[key]);
				if (encodedLanguageId) {
					languageMap[key] = encodedLanguageId;
				}
			}
		}

		if (injectedEmbeddedLanguages) {
			for (const injected of (injectedEmbeddedLanguages || [])) {
				for (const key in injected) {
					if (Object.prototype.hasOwnProperty.call(injected, key)) {
						const encodedLanguageId = this.getEncodedLanguageId(injected[key]);
						if (encodedLanguageId) {
							languageMap[key] = encodedLanguageId;
						}
					}
				}
			}
		}

		return languageMap;
	}

	public getTokenTypesFromLanguageId(languageId: string): vscodeTextmate.ITokenTypeMap {
		const grammarData = this.getGrammarDefinitionFromLanguageId(languageId);
		const tokenTypeDefinition = grammarData.tokenTypes;

		const tokenTypeMap = {};

		if (!tokenTypeDefinition) {
			return tokenTypeMap;
		}

		for (const scopeName in tokenTypeDefinition) {
			if (Object.prototype.hasOwnProperty.call(tokenTypeDefinition, scopeName)) {
				switch (tokenTypeDefinition[scopeName]) {
					case 'other':
						tokenTypeMap[scopeName] = vscode.StandardTokenType.Other;
					case 'comment':
						tokenTypeMap[scopeName] = vscode.StandardTokenType.Comment;
					case 'string':
						tokenTypeMap[scopeName] = vscode.StandardTokenType.String;
					case 'regex':
						tokenTypeMap[scopeName] = vscode.StandardTokenType.RegEx;
					case 'regexp':
						tokenTypeMap[scopeName] = vscode.StandardTokenType.RegEx;
				}
			}
		}

		return tokenTypeMap;
	}

	public getExtensionFromLanguageId(languageId: string): vscode.Extension<unknown> | undefined {
		return this.sources.languages[languageId];
	}

	public getExtensionFromScopeName(scopeName: string): vscode.Extension<unknown> {
		return this.sources.grammars[scopeName];
	}

	public async getLanguageConfigurationFromLanguageId(languageId: string): Promise<vscode.LanguageConfiguration> {
		if (languageId === 'plaintext') {
			return plaintextLanguageConfiguration;
		}

		const definition = this.getLanguageDefinitionFromId(languageId);
		const extension = this.getExtensionFromLanguageId(languageId);
		if (!extension || !definition) {
			throw new Error(`Could not find definition for language ${languageId}`);
		}

		const path = vscode.Uri.joinPath(extension.extensionUri, definition.configuration);
		const json = await loadJsonFile<RegExpsStringified<vscode.LanguageConfiguration>>(path);

		const { comments, brackets, wordPattern: w, indentationRules: i, onEnterRules: o } = json;
		const wordPattern = w ? fromEntryToRegExp(w): void 0;
		const indentationRules = i ? new IndentationRule(i) : void 0;
		const onEnterRules = o ? o.map(r => r ? new OnEnterRule(r) : void 0): void 0;

		return { brackets, comments, indentationRules, onEnterRules, wordPattern };
	}
}

function fromEntryToRegExp(entry: string | RegExpConfiguration) {
	return new RegExp(typeof entry === 'string' ? entry : entry.pattern, typeof entry === 'object' ? entry.flags : void 0);
}

function computeInjections(grammars: GrammarData): Record<string, string[]> {
	const injectionMap = {};
	for (const grammar of grammars.filter(isGrammarInjectionContribution)) {
		for (const injectScope of grammar.injectTo) {
			let injections = injectionMap[injectScope];
			if (!injections) {
				injectionMap[injectScope] = injections = [];
			}
			injections.push(grammar.scopeName);
		}
	}
	return injectionMap;
}

function computeInjectedEmbeddedLanguages(grammars: GrammarData): Record<string, EmbeddedLanguagesDefinition[]> {
	const injectedEmbeddedLanguagesMap = {};
	for (const grammar of grammars) {
		if (!grammar.embeddedLanguages || !isGrammarInjectionContribution(grammar)) {
			continue;
		}
		for (const injectScope of grammar.injectTo) {
			let injectedEmbeddedLanguages = injectedEmbeddedLanguagesMap[injectScope];
			if (!injectedEmbeddedLanguages) {
				injectedEmbeddedLanguagesMap[injectScope] = injectedEmbeddedLanguages = [];
			}
			injectedEmbeddedLanguages.push(grammar.embeddedLanguages);
		}
	}
	return injectedEmbeddedLanguagesMap;
}

function sortContributionsExtensionLast(priorityContributions: LanguageData, contributions: LanguageData, key: 'id'): LanguageData;
function sortContributionsExtensionLast(priorityContributions: GrammarData, contributions: GrammarData, key: 'scopeName'): GrammarData;
function sortContributionsExtensionLast(priorityContributions: any[], contributions: any[], key: string) {
	const priorityContributionIds = {};
	for (const contribution of priorityContributions) {
		priorityContributionIds[contribution[key]] = true;
	}
	const sortedContributions = contributions.filter(c => !priorityContributionIds[c[key]]);
	sortedContributions.push(...priorityContributions);
	return sortedContributions;
}
