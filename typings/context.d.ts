/* eslint-disable no-var */
import type * as vscode from 'vscode';

// wiring for global test variables in runtimes
declare global {
	interface Window {
		languageId: string;
		extensionContext: vscode.ExtensionContext;
	}
	namespace NodeJS {
		interface Global {
			languageId: string;
			extensionContext: vscode.ExtensionContext;
		}
	}
	var languageId: string;
	var extensionContext: vscode.ExtensionContext;
}

declare var languageId: string;
declare var extensionContext: vscode.ExtensionContext;
