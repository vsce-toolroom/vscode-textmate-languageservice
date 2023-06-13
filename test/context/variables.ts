'use strict';

import * as vscode from 'vscode';

export class MockEnvironmentVariableCollection implements vscode.EnvironmentVariableCollection {
	private readonly map: Map<string, vscode.EnvironmentVariableMutator> = new Map();
	private _persistent = true;
	constructor(serialized?: Array<[string, vscode.EnvironmentVariableMutator]>) {
		this.map = new Map(serialized);
	}
	public get size(): number {
		return this.map.size;
	}
	public get persistent(): boolean {
		return this._persistent;
	}
	public set persistent(value: boolean) {
		this._persistent = value;
	}
	public replace(_1: string, _2: string): void {
		return void 0;
	}
	public append(_1: string, _2: string): void {
		return void 0;
	}
	public prepend(_1: string, _2: string): void {
		return void 0;
	}
	public get(variable: string): vscode.EnvironmentVariableMutator | undefined {
		return this.map.get(variable);
	}
	public forEach(_1: Parameters<vscode.EnvironmentVariableCollection['forEach']>[0], _2?: any): void {
		return void 0;
	}
	public [Symbol.iterator](): IterableIterator<[variable: string, mutator: vscode.EnvironmentVariableMutator]> {
		return this.map.entries();
	}
	public delete(_1: string): void {
		return void 0;
	}
	public clear(): void {
		return void 0;
	}
}
