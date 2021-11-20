'use strict';

import glob from 'glob';
import path from 'path';
import vscode from 'vscode';
import fs from 'fs';

import getCoreNodeModule from './getCoreNodeModule';
import vsctm from 'vscode-textmate';
import vscodeOniguruma from 'vscode-oniguruma';
const vscodeOnigurumaModule = getCoreNodeModule<typeof vscodeOniguruma>('vscode-oniguruma');

const wasmPath = glob.sync(path.resolve(vscode.env.appRoot, '+(node_modules|node_modules.asar|node_modules.asar.unpacked)/vscode-oniguruma/release/onig.wasm'))[0];

let onigurumaLib: Promise<vsctm.IOnigLib> | null = null;

export function getOniguruma(): Promise<vsctm.IOnigLib> {
	if (!onigurumaLib) {
		const wasmBin = fs.readFileSync(wasmPath).buffer;
		onigurumaLib = (<Promise<any>>vscodeOnigurumaModule.loadWASM(wasmBin)).then((_: any) => {
			return {
				createOnigScanner(patterns: string[]) { return new vscodeOnigurumaModule.OnigScanner(patterns); },
				createOnigString(s: string) { return new vscodeOnigurumaModule.OnigString(s); }
			};
		});
	}
	return onigurumaLib;
}
