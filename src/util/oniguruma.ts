/* --------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as bindings from 'vscode-oniguruma';
import type * as textmate from 'vscode-textmate';

// Use webpack + encoded-uint8array-loader to generate an `Uint8Array` WASM module.
// This is not streaming :[ but vscode libs must bundle WASM deps to support web ecosystem.
// Better alternative is using copy-webpack-plugin + fetch to include the WASM file.
import * as data from '../../node_modules/vscode-oniguruma/release/onig.wasm';

let onigurumaLib: textmate.IOnigLib | null = null;

export async function getOniguruma(): Promise<textmate.IOnigLib> {
	if (!onigurumaLib) {
		await bindings.loadWASM({ data });
		onigurumaLib = {
			createOnigScanner(patterns: string[]) {
				return new bindings.OnigScanner(patterns);
			},
			createOnigString(str: string) {
				return new bindings.OnigString(str);
			}
		};
	}
	return onigurumaLib;
}
