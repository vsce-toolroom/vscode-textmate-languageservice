/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as vscode from 'vscode';
import * as vscodeTextmate from 'vscode-textmate';
import { readFileText, loadMessageBundle } from '../util/loader';
import { ContributorData } from '../util/contributes';
import type { GrammarLanguageDefinition, LanguageDefinition } from '../util/contributes';

const plainTextGrammar = {
	name: 'Plain Text',
	scopeName: 'text',
	patterns: []
};

export class ResolverService implements vscodeTextmate.RegistryOptions {
	private _contributes: ContributorData;
	constructor(public onigLib: Promise<vscodeTextmate.IOnigLib>, context?: vscode.ExtensionContext) {
		this._contributes = new ContributorData(context);
	}

	public async loadGrammar(scopeName: string): Promise<vscodeTextmate.IRawGrammar | null> {
		if (scopeName === 'text') {
			const text = JSON.stringify(plainTextGrammar);
			return vscodeTextmate.parseRawGrammar(text);
		}

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
				const filepath = extension.extensionUri?.fsPath.replace(/\\/g, '/') || '';
				throw new Error('Could not load grammar "' + grammar.path + '" from extension path "' + filepath + '"');
			}
		}

		throw new Error('Could not load grammar for scope name "' + scopeName + '"');
	}

	public findLanguageByExtension(fileExtension: string): string {
		return this._contributes.findLanguageByExtension(fileExtension);
	}

	public findLanguageByFilename(fileName: string): string {
		return this._contributes.findLanguageByFilename(fileName);
	}

	public findGrammarScopeNameFromFilename(fileName: string): string | null {
		return this._contributes.findGrammarScopeNameFromFilename(fileName);
	}

	public findLanguageIdFromScopeName(scopeName: string): string {
		return this._contributes.findLanguageIdFromScopeName(scopeName);
	}

	public getLanguageDefinitionFromId(languageId: string): LanguageDefinition {
		return this._contributes.getLanguageDefinitionFromId(languageId);
	}

	public getLanguageDefinitionFromFilename(fileName: string): LanguageDefinition {
		return this._contributes.getLanguageDefinitionFromFilename(fileName);
	}

	public getGrammarDefinitionFromLanguageId(languageId: string): GrammarLanguageDefinition {
		return this._contributes.getGrammarDefinitionFromLanguageId(languageId);
	}

	public getExtensionFromLanguageId(languageId: string): vscode.Extension<unknown> | undefined {
		return this._contributes.getExtensionFromLanguageId(languageId);
	}

	public getExtensionFromScopeName(scopeName: string): vscode.Extension<unknown> {
		return this._contributes.getExtensionFromScopeName(scopeName);
	}

	public async loadGrammarByLanguageId(languageId: string): Promise<vscodeTextmate.IRawGrammar | null> {
		const grammar = this._contributes.grammars.find(g => g.language === languageId);

		if (!grammar) {
			throw new Error('Could not load grammar for language ID "' + languageId + '"');
		}

		return this.loadGrammar(grammar.scopeName);
	}
}
