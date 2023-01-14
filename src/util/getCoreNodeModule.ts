/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import vscode from 'vscode';

/**
 * Returns a node module installed with VSCode, or undefined if it fails.
 */
export default function<T>(id: string): T | null {
	try {
	  return require(`${vscode.env.appRoot}/node_modules.asar/${id}`);
	} catch (err) {
		// ignore
	}

	try {
	  return require(`${vscode.env.appRoot}/node_modules/${id}`);
	} catch (err) {
		// ignore
	}

	return null;
}
