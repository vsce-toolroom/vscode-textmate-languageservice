'use strict';

import * as vscode from 'vscode';

import type { PartialDeep, JsonObject, PackageJson } from 'type-fest';
import { loadJsonFile } from './loader';

type PartialJsonObject = PartialDeep<JsonObject>;

export interface GrammarLanguageDefinition {
	language: string;
	scopeName: string;
	path: string;
	embeddedLanguages?: { [scopeName: string]: string };
}

export interface GrammarInjectionContribution {
	scopeName: string;
	path: string;
	injectTo: string[];
}

export type GrammarDefinition = GrammarLanguageDefinition | GrammarInjectionContribution;

export function isGrammarLanguageDefinition(g: GrammarDefinition): g is GrammarLanguageDefinition {
	return g && 'injectTo' in g === false;
}

export interface LanguageDefinition {
	aliases?: string[];
	configuration?: string;
	extensions?: string[];
	filenames?: string[];
	firstLine?: string;
	icon?: string | { light: string; dark: string; };
	id: string;
	mimetypes?: string[];
}

export type LanguageData = LanguageDefinition[];
export type GrammarData = GrammarLanguageDefinition[];

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

const plaintextLanguage: LanguageDefinition = {
	id: 'plaintext',
	extensions: ['.txt'],
	aliases: ['Plain Text', 'text'],
	mimetypes: ['text/plain']
};

const plaintextGrammar = {
	language: 'plaintext',
	path: null,
	scopeName: 'text'
};

function getAllContributes() {
	const languages: LanguageData = [plaintextLanguage];
	const grammars: GrammarData = [plaintextGrammar];
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
			const g = contributes.grammars?.filter(isGrammarLanguageDefinition) || [];
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

let vscodeContributes = getAllContributes();
vscode.extensions.onDidChange(function() {
	vscodeContributes = getAllContributes();
});

export class ContributorData {
	private _languages: LanguageData;
	private _grammars: GrammarData;
	private _sources: Record<'grammars' | 'languages', ExtensionData>;

	constructor(context?: vscode.ExtensionContext) {
		const manifest = context?.extension?.packageJSON as ExtensionManifest | void;
		if (!manifest) {
			this._languages = vscodeContributes.languages;
			this._grammars = vscodeContributes.grammars;
			this._sources = vscodeContributes.sources;
			return;
		}

		this._languages = manifest?.contributes?.languages || [];
		this._grammars = manifest?.contributes?.grammars?.filter(isGrammarLanguageDefinition) || [];
		this._sources = {
			grammars: Object.fromEntries(this._grammars.map(g => [g.scopeName, context.extension])),
			languages: Object.fromEntries(this._languages.map(l => [l.id, context.extension]))
		};
	}

	public get languages() {
		return this._languages;
	}

	public get grammars() {
		return this._grammars;
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
		return 'plaintext';
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
		return 'plaintext';
	}

	public findGrammarScopeNameFromFilename(fileLabel: string): string | null {
		const extname = fileLabel.substring(fileLabel.lastIndexOf('.'));
		const language = this.findLanguageByFilename(fileLabel) || this.findLanguageByExtension(extname);
		if (!language) {
			return null;
		}

		const grammar = this.getGrammarDefinitionFromLanguageId(language);
		return grammar ? grammar.scopeName : null;
	}

	public findLanguageIdFromScopeName(scopeName: string): string {
		const grammarData = this.grammars.find(g => g.scopeName === scopeName);
		if (grammarData) {
			return grammarData.language;
		}
		throw new Error('Could not find language contribution for scope name "' + scopeName + '" in extension manifest');
	}

	public getLanguageDefinitionFromId(languageId: string): LanguageDefinition {
		for (const language of this.languages.reverse()) {
			if (language.id === languageId) {
				return language;
			}
		}
		throw new Error('Could not find language contribution for language ID "' + languageId + '" in extension manifest');
	}

	public getLanguageDefinitionFromFilename(filename: string): LanguageDefinition {
		const extname = filename.substring(filename.lastIndexOf('.'));
		const languageId = this.findLanguageByFilename(filename) || this.findLanguageByExtension(extname);
		if (!languageId) {
			return plaintextLanguage;
		}
		const languageData = this.sources.languages[languageId];
		if (!languageData) {
			return plaintextLanguage;
		}
		return languageData;
	}

	public getGrammarDefinitionFromLanguageId(languageId: string): GrammarLanguageDefinition {
		for (const grammar of this.grammars.reverse()) {
			if (grammar.language === languageId) {
				return grammar;
			}
		}
		throw new Error('Could not find grammar contribution for language ID "' + languageId + '" in extension manifest');
	}

	public getExtensionFromLanguageId(languageId: string): vscode.Extension<unknown> | undefined {
		return this.sources.languages[languageId];
	}

	public getExtensionFromScopeName(scopeName: string): vscode.Extension<unknown> {
		return this.sources.grammars[scopeName];
	}
}
