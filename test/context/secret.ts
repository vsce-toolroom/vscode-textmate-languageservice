'use strict';

import * as vscode from 'vscode';

export class StubSecretStorage {
	public onDidChange = new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event;
	public get(_: string): Thenable<string | undefined> {
		return Promise.resolve('●●●●●●●●●●●●●●●●');
	}
	public store(_1: string, _2: string): Thenable<void> {
		return Promise.resolve();
	}
	public delete(_1: string): Thenable<void> {
		return Promise.resolve();
	}
}
