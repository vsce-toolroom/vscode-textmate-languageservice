// wiring from webpack `arraybuffer-loader` loader to wasm
declare module '*.wasm' { const buffer: ArrayBuffer; export default buffer; }
