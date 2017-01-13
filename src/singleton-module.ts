
declare const global: {[key:string]:any};
const globalCtx = (typeof self === 'object' && self.self === self && self) ||
    (typeof global === 'object' && global['global'] === global && global) ||
    this;
export function setGlobalModule(globalModule:any){
    if (!globalCtx.__Mutabl) {
        globalCtx.__Mutable = globalModule;
    }
    return globalCtx.__Mutable;
}
