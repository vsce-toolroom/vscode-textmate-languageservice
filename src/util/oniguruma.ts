/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as path from 'path';
import * as vscode from 'vscode';
import vscodeTextmate = require('vscode-textmate');
import * as vscodeOniguruma from 'vscode-oniguruma';
import { readFileBytes } from '../util/loader';

function moduleDirnameToWasmPath(dirname: string): string {
	return path.join(path.normalize(vscode.env.appRoot), dirname, 'vscode-oniguruma', 'release', 'onig.wasm');
}

const nodeModulesDirnames = [
	'node_modules.asar.unpacked',
	'node_modules.asar',
	'node_modules'
];
const wasmPaths = nodeModulesDirnames.map(moduleDirnameToWasmPath)

let onigurumaLib: vscodeTextmate.IOnigLib | null = null;

export async function getOniguruma(): Promise<vscodeTextmate.IOnigLib> {
	if (!onigurumaLib) {
		let wasmBin: Uint8Array | ArrayBuffer;
		let readError: Error;
		for (let i = 0; i < wasmPaths.length; i++) {
			const wasmPath = wasmPaths[i];
			try {
				wasmBin = await readFileBytes(vscode.Uri.file(wasmPath));
				break;
			} catch (e) {
				readError = e as Error;
			}
		}
		if (!wasmBin) throw readError;
		await vscodeOniguruma.loadWASM(wasmBin);
		onigurumaLib = {
			createOnigScanner(patterns: string[]) { return new vscodeOniguruma.OnigScanner(patterns); },
			createOnigString(s: string) { return new vscodeOniguruma.OnigString(s); }
		};
	}
	return onigurumaLib;
}
