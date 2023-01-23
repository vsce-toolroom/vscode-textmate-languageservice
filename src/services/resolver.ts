/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as path from 'path';
import type { JsonObject } from 'type-fest';
import * as vscode from 'vscode';
import vscodeTextmate = require('vscode-textmate');

import { readFileText } from '../util/loader';

export interface GrammarContribution extends JsonObject {
	language: string;
	scopeName: string;
	path: string;
	embeddedLanguages?: { [scopeName: string]: string };
}


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

	public async loadGrammar(scopeName: string): Promise<vscodeTextmate.IRawGrammar | null> {
		for (const grammar of this._grammars) {
			if (grammar.scopeName !== scopeName) {
				continue;
			}
			if (this._grammars[scopeName]) {
				return this._grammars[scopeName];
			}
			try {
				const p = this._context.asAbsolutePath(grammar.path);
				const text = await readFileText(vscode.Uri.parse(p));
				this._grammars[scopeName] = vscodeTextmate.parseRawGrammar(text, p);
			} catch (e) {
				throw e;
			}
			return this._grammars[scopeName];
		}
		return null;
	}
}
