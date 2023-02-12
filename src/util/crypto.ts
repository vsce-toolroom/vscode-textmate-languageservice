'use strict';

export const web = (typeof window !== 'undefined' ? window : {}).crypto;

// Compiler hack for require in DOM ts environment.
const id = (_: string): any => ({});
const r = require || id;

type NodeCrypto = typeof import('crypto');
export const node = r('crypto') as NodeCrypto;
