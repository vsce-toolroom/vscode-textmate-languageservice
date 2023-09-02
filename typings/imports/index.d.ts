/// <reference path="./vscode.proposed.tokenInformation.d.ts" />

// wiring from webpack `encoded-uint8array-loader` to inline WASM buffer view
declare module '*.wasm' {
	const bufview: Uint8Array;
	export = bufview;
}
