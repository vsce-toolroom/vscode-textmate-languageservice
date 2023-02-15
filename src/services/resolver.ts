/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as vscode from 'vscode';
import * as vscodeTextmate from 'vscode-textmate';

import type { PartialDeep, JsonObject, JsonArray, PackageJson } from 'type-fest';

import { readFileText } from '../util/loader';

type PartialJsonObject = PartialDeep<JsonObject>;

export interface GrammarLanguageContribution extends PartialJsonObject {
	language: string;
	scopeName: string;
	path: string;
	embeddedLanguages?: { [scopeName: string]: string };
}

export interface GrammarInjectionContribution extends PartialJsonObject {
	scopeName: string;
	path: string;
	injectTo: string[];
}

export type GrammarContribution = GrammarLanguageContribution | GrammarInjectionContribution;

export interface LanguageContribution extends PartialJsonObject {
	id: string;
	extensions?: string[];
	filenames?: string[];
}

interface Contributes extends PartialJsonObject {
	grammars?: GrammarContribution[] & JsonArray;
	languages?: LanguageContribution[] & JsonArray;
}

export interface PackageJSON extends PartialDeep<PackageJson> {
	contributes?: Contributes;
	'textmate-languageservices'?: { [languageId: string]: string };
}

export class ResolverService implements vscodeTextmate.RegistryOptions {
	constructor(private _context: vscode.ExtensionContext, private _grammars: GrammarContribution[], private _languages: LanguageContribution[], public onigLib: Promise<vscodeTextmate.IOnigLib>) {
	}

	public findLanguageByExtension(fileExtension: string): string | null {
		for (const language of this._languages) {
			if (!language.extensions) {
				continue;
			}
			for (const extension of language.extensions) {
				if (extension === fileExtension) {
					return language.id;
				}
			}
		}
		return null;
	}

	public findLanguageByFilename(fileLabel: string): string | null {
		for (const language of this._languages) {
			if (!language.filenames) {
				continue;
			}
			for (const filename of language.filenames) {
				if (filename === fileLabel) {
					return language.id;
				}
			}
		}

		return null;
	}

	public findScopeByFilename(filename: string): string | null {
		const extname = filename.substring(filename.lastIndexOf('.'));
		const language = this.findLanguageByExtension(extname) || this.findLanguageByFilename(filename);
		if (!language) {
			return null;
		}

		const grammar = this.findGrammarByLanguageId(language);
		return grammar ? grammar.scopeName : null;
	}

	public findLanguageById(id: string): LanguageContribution {
		for (const language of this._languages) {
			if (language.id === id) {
				return language;
			}
		}
		throw new Error('Could not find language contribution for language ID "' + id + '"');
	}

	public findGrammarByLanguageId(id: string): GrammarContribution {
		for (const grammar of this._grammars) {
			if (grammar.language === id) {
				return grammar;
			}
		}
		throw new Error('Could not find grammar contribution for language ID "' + id + '"');
	}

	public async loadGrammar(scopeName: string): Promise<vscodeTextmate.IRawGrammar | null> {
		for (const grammar of this._grammars) {
			if (grammar.scopeName !== scopeName) {
				continue;
			}
			try {
				const uri = vscode.Uri.joinPath(this._context.extensionUri, grammar.path);
				const text = await readFileText(uri);
				return vscodeTextmate.parseRawGrammar(text, uri.path);
			} catch (e) {
				throw e;
			}
		}
		return null;
	}
}
