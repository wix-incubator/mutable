
declare const global: {[key:string]:any};
const globalCtx = (typeof self === 'object' && self.self === self && self) ||
    (typeof global === 'object' && global['global'] === global && global) ||
    this;
export const globalModule = globalCtx.__Mutable;
export const globalModuleMiss = !globalCtx.__Mutable;
