export {default as config} from './config';
export {defineClass as define} from './define-type';
export {Any} from './any';
export {default as String} from './string';
export {default as Boolean} from './boolean';
export {default as Number} from './number';
export {default as Function} from './function';
export {default as Reference} from './reference';
export {default as validation} from './validation';
export {default as List} from './list';
export {default as Es5Map, default as Map} from './es5-map';
export {MuBase as Base} from './base';
export {MuObject as Object} from "./object";
export {PropsBase} from './props-base';
export {LifeCycleManager} from './lifecycle';
export {defineEnum, EnumBase} from './define-enum';
export {either} from './generic-types';
import {globalModule, globalModuleMiss} from './singleton-module';
import {MuObject} from "./object";
import {MuBase} from "./base";
import {isType} from "./types";

export function isAny(type:any) {
    return isType(type);
}
export function isMutable(type:any) {
    return type.prototype instanceof MuBase;
}
export function isClass(type:any) {
    return type.prototype instanceof MuObject;
}
export function isEnum(type:any) {
    return type.name === 'EnumType';
}
export function isNullable(type:any) {
    return type.options && type.options.nullable;
}

declare const module: {exports:any};
if (!globalModuleMiss){
    module.exports = globalModule;
}
