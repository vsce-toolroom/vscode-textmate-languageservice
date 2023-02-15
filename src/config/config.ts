'use strict';

import type * as vscode from 'vscode';
import { ConfigSelectors } from './selectors';

import type { PartialDeep, JsonObject } from 'type-fest';
import type { LanguageContribution } from '../services/resolver';

export type SelectorSource = string[] | string;

type PartialJsonObject = PartialDeep<JsonObject>;

export interface ConfigJson extends PartialJsonObject {
	assignment?: {
		multiple?: SelectorSource;
		separator?: SelectorSource;
		single?: SelectorSource;
	};
	declarations?: SelectorSource;
	dedentation?: SelectorSource;
	exclude?: string;
	indentation: {
		[selector: string]: 1 | -1 | undefined;
	};
	punctuation?: {
		continuation?: SelectorSource;
	};
	markers?: {
		end?: string;
		start?: string;
	};
	symbols?: {
		[selector: string]: vscode.SymbolKind | undefined;
	};
}

export class ConfigData {
	public readonly language: LanguageContribution;
	public readonly extensions?: string;
	public readonly exclude?: string;
	public readonly selectors: ConfigSelectors;
	public readonly include: string;

	constructor(json: ConfigJson, language: LanguageContribution) {
		this.include = generateIncludePattern(language);
		if (language.extensions) {
			this.extensions = generateExtensionPattern(language.extensions);
		}
		if (json.exclude) {
			this.exclude = json.exclude;
		}
		this.selectors = new ConfigSelectors(json);
	}
}

function generateExtensionPattern(extensions: string[] | undefined): string {
	if (extensions.length === 1) {
		return `*${extensions[0]}`;
	} else {
		const segments = extensions.map(e => e.substring(1));
		return `*.{${segments.join(',')}`;
	}
}

function generateIncludePattern(language: LanguageContribution): string {
	if (!language.extensions && !language.filenames) {
		return '**/*';
	}
	let extensions: string;
	let filenames: string;
	if (language.extensions?.length) {
		extensions = generateExtensionPattern(language.extensions);
	}
	if (language.filenames?.length) {
		filenames = language.filenames.length === 1 ? language.filenames[0] : `{${language.filenames.join(',')}}`;
	}
	if (extensions && filenames) {
		return `**/{${extensions},${filenames}}`;
	}
	if (extensions) {
		return `**/${extensions}`;
	}
	if (filenames) {
		return `**/${filenames}`;
	}
}
