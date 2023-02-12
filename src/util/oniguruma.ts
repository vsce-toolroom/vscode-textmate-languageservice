/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as textmate from 'vscode-textmate';
import * as bindings from 'vscode-oniguruma';

// Use webpack & arraybuffer-loader to generate an u8 `ArrayBuffer` WASM module.
import buffer from '../../node_modules/vscode-oniguruma/release/onig.wasm';

let onigurumaLib: textmate.IOnigLib | null = null;

export async function getOniguruma(): Promise<textmate.IOnigLib> {
	if (!onigurumaLib) {
		const bytes = new Uint8Array(buffer);
		await bindings.loadWASM(bytes);
		onigurumaLib = {
			createOnigScanner(patterns: string[]) { return new bindings.OnigScanner(patterns); },
			createOnigString(s: string) { return new bindings.OnigString(s); }
		};
	}
	return onigurumaLib;
}
