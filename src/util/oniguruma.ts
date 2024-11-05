/// <reference path="../../typings/imports.d.ts"/>
/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as vscodeOniguruma from 'vscode-oniguruma';
import type * as vscodeTextmate from 'vscode-textmate';

// Use webpack + asset inlining to generate a streaming compilation WASM module.
import * as dataUri from '../../node_modules/vscode-oniguruma/release/onig.wasm';

let onigurumaLib: vscodeTextmate.IOnigLib | null = null;

export async function getOniguruma(): Promise<vscodeTextmate.IOnigLib> {
	if (onigurumaLib) {
		return onigurumaLib;
	}
	await vscodeOniguruma.loadWASM({ data: await fetch(dataUri) });
	onigurumaLib = {
		createOnigScanner(patterns: string[]) {
			return new vscodeOniguruma.OnigScanner(patterns);
		},
		createOnigString(str: string) {
			return new vscodeOniguruma.OnigString(str);
		}
	};
	return onigurumaLib;
}
