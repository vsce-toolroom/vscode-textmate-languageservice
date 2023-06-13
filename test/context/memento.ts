'use strict';

import * as vscode from 'vscode';

export class MockMemento implements vscode.Memento {
	public keys(): readonly string[] {
		return [];
	}
	public get<T = void>(_1: string): T;
	public get<T = void>(_1: string, _2?: T): T {
		return void 0 as T;
	}
	public update(_1: string, _2: any): Thenable<void> {
		return Promise.resolve();
	}
}

export class MockGlobalMemento extends MockMemento implements vscode.Memento {
	public setKeysForSync(_: readonly string[]): void {
		return void 0;
	}
}
