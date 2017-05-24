export {default as config} from './config';
export {defineClass as define} from './objects/define';
export {MuObject as Object} from "./objects/object";
export {Any} from './types/any';
export {default as String} from './types/primitives/string';
export {default as Boolean} from './types/primitives/boolean';
export {default as Number} from './types/primitives/number';
export {default as Function} from './types/primitives/function';
export {default as Reference} from './objects/reference';
export {default as validation} from './core/validation';
export {default as List} from './types/list';
export {default as Es5Map, default as Map} from './types/es5-map';
export {MuBase as Base} from './core/base';
export {propsBase as PropsBase} from './props-base';
export {LifeCycleManager} from './core/lifecycle';
export {defineEnum, EnumBase} from './types/define-enum';
export {either} from './core/generic-types';
export {computed} from './core/computed-decorator';
import {setGlobalModule} from './singleton-module';
import {MuObject} from "./objects/object";
import {MuBase} from "./core/base";
import {isType} from "./core/types";

// TODO export isType itself
export function isAny(type:any) {
    return isType(type);
}
export function isMutable(type:any) {
    return type && type.prototype instanceof MuBase;
}
export function isClass(type:any) {
    return type && type.prototype instanceof MuObject;
}
export function isEnum(type:any) {
    return type && type.name === 'EnumType';
}
export function isNullable(type:any) {
    return !!(type && type.options && type.options.nullable);
}

declare const module: {exports:any};
module.exports = setGlobalModule(module.exports);
