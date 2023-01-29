/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as vscode from 'vscode';
import * as textmate from 'vscode-textmate';
import * as bindings from 'vscode-oniguruma';
import { getWasmFile } from '../util/loader';

function moduleDirnameToWasmPath(dirname: string): string {
	return `${vscode.env.appRoot}/${dirname}/vscode-oniguruma/release/onig.wasm`;
}

const nodeModulesDirnames = [
	'node_modules.asar.unpacked',
	'node_modules.asar',
	'node_modules'
];
const wasmPaths = nodeModulesDirnames.map(moduleDirnameToWasmPath)

let onigurumaLib: textmate.IOnigLib | null = null;

export async function getOniguruma(): Promise<textmate.IOnigLib> {
	if (!onigurumaLib) {
		let wasmBin: Uint8Array | Response;
		let readError: Error;
		for (let i = 0; !wasmBin && i < wasmPaths.length; i++) {
			const wasmPath = wasmPaths[i];
			try {
				wasmBin = await getWasmFile(wasmPath);
			} catch (e) {
				readError = e as Error;
			}
		}
		if (!wasmBin) throw readError;
		await bindings.loadWASM(wasmBin);
		onigurumaLib = {
			createOnigScanner(patterns: string[]) { return new bindings.OnigScanner(patterns); },
			createOnigString(s: string) { return new bindings.OnigString(s); }
		};
	}
	return onigurumaLib;
}
