'use strict';

import * as vscode from 'vscode';
import { MockExtensionContext } from './mock';

export function setupEnvironmentForLanguageId(languageId: string): void {
	globalThis.languageId = languageId;
	switch (languageId) {
		case 'matlab':
			globalThis.extensionContext = new MockExtensionContext(languageId);
			break;
		case 'mediawiki':
			globalThis.extensionContext = new MockExtensionContext(languageId);
			break;
		case 'typescript':
			globalThis.extensionContext = void 0 as unknown as vscode.ExtensionContext;
			break;
		default:
			break;
	}
}
