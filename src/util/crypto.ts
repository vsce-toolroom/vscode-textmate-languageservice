'use strict';

export const web = (typeof window !== 'undefined' ? window : {}).crypto as Crypto;

// Compiler hack for require in DOM ts environment.
const id = (_: string): any => { return {}; };
const r = require || id;

export const node = r('crypto') as typeof import('crypto');
