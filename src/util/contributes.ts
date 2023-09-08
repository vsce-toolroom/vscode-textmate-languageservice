'use strict';

import * as vscode from 'vscode';

import type { PartialDeep, JsonObject, PackageJson } from 'type-fest';

type PartialJsonObject = PartialDeep<JsonObject>;

export interface GrammarLanguagePoint {
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

export type GrammarPoint = GrammarLanguagePoint | GrammarInjectionContribution;

export function isGrammarLanguagePoint(g: GrammarPoint): g is GrammarLanguagePoint {
	return g && 'injectTo' in g === false;
}

export interface LanguagePoint {
	id: string;
	extensions?: string[];
	filenames?: string[];
}

export type LanguageData = LanguagePoint[];
export type GrammarData = GrammarLanguagePoint[];

export interface ExtensionContributions extends PartialJsonObject {
	languages?: PartialJsonObject & LanguageData;
	grammars?: PartialJsonObject & GrammarData;
}

export interface LanguageConfigurations {
	[languageId: string]: string;
}

export interface ExtensionManifest extends PackageJson {
	enabledApiProposals?: string[];
	contributes?: ExtensionContributions;
	/** Mapping from language ID to config path. Default: `./textmate-configuration.json`. */
	'textmate-languageservices'?: LanguageConfigurations;
	/** Ersatz extension contributions - a service wiring to any language grammars. */
	'textmate-languageservice-contributes'?: ExtensionContributions;
}

export const contributionKeys: ExtensionManifestContributionKey[] = [
	'textmate-languageservice-contributes',
	'contributes'
];

export type ExtensionManifestContributionKey = 'textmate-languageservice-contributes' | 'contributes';

export type ExtensionData = Record<string, vscode.Extension<unknown> | undefined>;

function getAllExtensionContributes() {
	const languages: LanguageData = [];
	const grammars: GrammarData = [];
	const sources = {
		languages: {} as ExtensionData,
		grammars: {} as ExtensionData
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
			const g = contributes.grammars?.filter(isGrammarLanguagePoint) || [];
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
	return { languages, grammars, sources };
}

export class ContributorData {
	private _languages: LanguageData;
	private _grammars: GrammarData;
	private _sources: { languages: ExtensionData; grammars: ExtensionData; };

	constructor(context?: vscode.ExtensionContext) {
		const manifest = context?.extension?.packageJSON as ExtensionManifest | void;
		if (!manifest) {
			const data = getAllExtensionContributes();
			this._languages = data.languages;
			this._grammars = data.grammars;
			this._sources = data.sources;
			return;
		}
		this._languages = manifest?.contributes?.languages || [];
		this._grammars = manifest?.contributes?.grammars?.filter(isGrammarLanguagePoint) || [];
		this._sources = {
			languages: Object.fromEntries(this._languages.map(l => [l.id, context.extension])),
			grammars: Object.fromEntries(this._grammars.map(g => [g.scopeName, context.extension])),
		};
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

		const grammar = this.getGrammarPointFromLanguageId(language);
		return grammar ? grammar.scopeName : null;
	}

	public findLanguageIdFromScopeName(scopeName: string): string {
		const grammarData = this.grammars.find(g => g.scopeName === scopeName);
		if (grammarData) {
			return grammarData.language;
		}
		throw new Error('Could not find language contribution for scope name "' + scopeName + '" in extension manifest');
	}

	public getLanguagePointFromId(languageId: string): LanguagePoint {
		for (const language of this.languages.reverse()) {
			if (language.id === languageId) {
				return language;
			}
		}
		throw new Error('Could not find language contribution for language ID "' + languageId + '" in extension manifest');
	}

	public getLanguagePointFromFilename(filename: string): LanguagePoint {
		const extname = filename.substring(filename.lastIndexOf('.'));
		const languageId = this.findLanguageByFilename(filename) || this.findLanguageByExtension(extname);
		if (!languageId) {
			return { id: 'plaintext' };
		}
		const languageData = this.sources.languages[languageId];
		if (!languageData) {
			return { id: 'plaintext' };
		}
		return languageData;
	}

	public getGrammarPointFromLanguageId(languageId: string): GrammarLanguagePoint {
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

	public get languages() {
		return this._languages;
	}

	public get grammars() {
		return this._grammars;
	}

	public get sources() {
		return this._sources;
	}
}
