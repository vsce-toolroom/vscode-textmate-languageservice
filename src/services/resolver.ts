/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as vscode from 'vscode';
import * as vscodeTextmate from 'vscode-textmate';
import * as path from 'path';
import { readFileText } from '../util/loader';
import { ContributorData } from '../util/contributes';
import type { GrammarLanguageContribution, LanguageContribution } from '../util/contributes';

export class ResolverService implements vscodeTextmate.RegistryOptions {
	private _contributes: ContributorData;
	constructor(public onigLib: Promise<vscodeTextmate.IOnigLib>, context?: vscode.ExtensionContext) {
		this._contributes = new ContributorData(context);
	}

	public findLanguageByExtension(fileExtension: string): string | null {
		for (const language of this._contributes.languages.reverse()) {
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
		for (const language of this._contributes.languages.reverse()) {
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

		const grammar = this.findGrammarDataByLanguageId(language);
		return grammar ? grammar.scopeName : null;
	}

	public findLanguageDataById(languageId: string): LanguageContribution {
		for (const language of this._contributes.languages.reverse()) {
			if (language.id === languageId) {
				return language;
			}
		}
		throw new Error('Could not find language contribution for language ID "' + languageId + '" in extension manifest');
	}

	public findGrammarDataByLanguageId(languageId: string): GrammarLanguageContribution {
		for (const grammar of this._contributes.grammars.reverse()) {
			if (grammar.language === languageId) {
				return grammar;
			}
		}
		throw new Error('Could not find grammar contribution for language ID "' + languageId + '" in extension manifest');
	}

	public findExtensionByLanguageId(languageId: string): vscode.Extension<any> | undefined {
		return this._contributes.sources.languages[languageId];
	}

	public findExtensionByScopeName(scopeName: string): vscode.Extension<any> {
		return this._contributes.sources.grammars[scopeName];
	}

	public async loadGrammar(scopeName: string): Promise<vscodeTextmate.IRawGrammar | null> {
		const mapping = this._contributes.sources;
		const extension = mapping.grammars[scopeName];
		for (const grammar of this._contributes.grammars.reverse()) {
			if (grammar.scopeName !== scopeName) {
				continue;
			}
			try {
				const uri = vscode.Uri.joinPath(extension.extensionUri, grammar.path);
				const text = await readFileText(uri);
				return vscodeTextmate.parseRawGrammar(text, uri.path);
			} catch (e) {
				const filepath = extension!.extensionUri?.fsPath.replace(/\\/g, '/') || '';
				throw new Error('Could not load grammar "' + grammar.path + '" from extension path "' + filepath + '"');
			}
		}
		throw new Error('Could not load grammar for scope name "' + scopeName + '"');
	}

	public async loadGrammarByLanguageId(languageId: string): Promise<vscodeTextmate.IRawGrammar | null> {
		const grammar = this._contributes.grammars.find(g => g.language === languageId);
		if (!grammar) {
			throw new Error('Could not load grammar for language ID "' + languageId + '"');
		}
		return this.loadGrammar(grammar.scopeName);
	}
}
