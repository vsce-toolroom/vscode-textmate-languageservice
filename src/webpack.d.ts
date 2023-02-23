// wiring from webpack `encoded-uint8array-loader` to inline WASM buffer view
declare module '*.wasm' { const bytes: Uint8Array; export = bytes; }
