/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as path from 'path';
import type { JsonObject } from 'type-fest';
import * as vscode from 'vscode';
import * as textmate from 'vscode-textmate';

import { readFileText } from '../util/loader';

export interface GrammarLanguageContribution extends JsonObject {
	language: string;
	scopeName: string;
	path: string;
	embeddedLanguages?: { [scopeName: string]: string };
}

export interface GrammarInjectionContribution extends JsonObject {
	scopeName: string;
	path: string;
	injectTo: string[];
}

export type GrammarContribution = GrammarLanguageContribution | GrammarInjectionContribution;

export interface LanguageContribution extends JsonObject {
	id: string;
	extensions?: string[];
	filenames?: string[];
}

export interface PackageJSON extends JsonObject {
	name: string;
	version: string;
	contributes?: {
		grammars?: GrammarContribution[];
		languages?: LanguageContribution[];
	};
	'textmate-languageservices'?: { [languageId: string]: string; };
}

export class ResolverService implements textmate.RegistryOptions {
	constructor(private _context: vscode.ExtensionContext, private _grammars: GrammarContribution[], private _languages: LanguageContribution[], public onigLib: Promise<textmate.IOnigLib>) {
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
		const language = this.findLanguageByExtension(path.extname(filename)) || this.findLanguageByFilename(filename);
		if (!language) return null;

		const grammar = this.findGrammarByLanguageId(language);
		return grammar ? grammar.scopeName : null;
	}

	public findLanguageById(id: string): LanguageContribution {
		for (const language of this._languages) {
			if (language.id === id) {
				return language;
			}
		}
		throw new Error("Could not find language contribution for language ID '" + id + '"');
	}

	public findGrammarByLanguageId(id: string): GrammarContribution {
		for (const grammar of this._grammars) {
			if (grammar.language === id) {
				return grammar;
			}
		}
		throw new Error("Could not find grammar contribution for language ID '" + id + '"');
	}

	public async loadGrammar(scopeName: string): Promise<textmate.IRawGrammar | null> {
		for (const grammar of this._grammars) {
			if (grammar.scopeName !== scopeName) {
				continue;
			}
			if (this._grammars[scopeName]) {
				return this._grammars[scopeName];
			}
			try {
				const uri = vscode.Uri.joinPath(this._context.extensionUri, grammar.path);
				const text = await readFileText(uri);
				this._grammars[scopeName] = textmate.parseRawGrammar(text, uri.path);
			} catch (e) {
				throw e;
			}
			return this._grammars[scopeName];
		}
		return null;
	}
}
