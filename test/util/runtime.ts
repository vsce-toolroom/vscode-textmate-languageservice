'use strict';

import * as vscode from 'vscode';

// The API for runtime detection is frankly not sane.
// This is the best way to detect if we are in a web runtime.
// microsoft/vscode#104436; microsoft/vscode#134568
const isWebUI = vscode.env.uiKind === vscode.UIKind.Web;
const isRemote = typeof vscode.env.remoteName === 'string';
export const isWebRuntime = isWebUI && !isRemote;
