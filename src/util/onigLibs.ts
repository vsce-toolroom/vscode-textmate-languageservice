'use strict';

import * as pkgDir from 'pkg-dir';
import * as path from 'path';
import { IOnigLib } from 'vscode-textmate';
import * as vscodeOnigurumaModule from 'vscode-oniguruma';
import * as fs from 'fs';

const extensionPath = pkgDir.sync(path.dirname(pkgDir.sync(__dirname)));
const wasmPath = path.resolve(extensionPath, 'node_modules/vscode-oniguruma/release/onig.wasm');

let onigurumaLib: Promise<IOnigLib> | null = null;

export function getOniguruma(): Promise<IOnigLib> {
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
