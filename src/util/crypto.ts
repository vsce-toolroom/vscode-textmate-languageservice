'use strict';

import * as vscode from 'vscode';
import type * as c from 'crypto';
type NodeCrypto = typeof c;

// The API for runtime detection is frankly not sane.
// This is the best way to detect if we are in a web runtime.
// microsoft/vscode#104436; microsoft/vscode#134568
const isWeb = vscode.env.uiKind === vscode.UIKind.Web;
const isRemote = typeof vscode.env.remoteName === 'string';
const w: typeof globalThis | void = isWeb && !isRemote ? globalThis : void 0;

// Export the web crypto global for (for webworker + secure context runtimes).
export const web: Crypto | void = w && w.crypto || void 0;

// Export the node crypto module (for Node runtimes).
export const node: NodeCrypto | void = !w ? require('crypto') as typeof c : void 0;
