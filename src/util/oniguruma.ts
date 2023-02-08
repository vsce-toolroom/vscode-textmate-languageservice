/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as vscode from 'vscode';
import * as textmate from 'vscode-textmate';
import * as bindings from 'vscode-oniguruma';

let onigurumaLib: textmate.IOnigLib | null = null;

export async function getOniguruma(extensionUri: vscode.Uri): Promise<textmate.IOnigLib> {
	if (!onigurumaLib) {
		const wasmPath = vscode.Uri.joinPath(extensionUri, './node_modules/vscode-textmate-languageservice', 'dist/onig.wasm');
		const wasmData = vscode.env.appHost === 'desktop'
			? await vscode.workspace.fs.readFile(wasmPath)
			: await fetch(wasmPath.toString());
		await bindings.loadWASM(wasmData);
		onigurumaLib = {
			createOnigScanner(patterns: string[]) { return new bindings.OnigScanner(patterns); },
			createOnigString(s: string) { return new bindings.OnigString(s); }
		};
	}
	return onigurumaLib;
}
