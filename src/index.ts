import {default as config} from './config';
import {defineClass as define} from './define-type';
import {NonPrimitive} from './non-primitive';
import {default as PrimitiveBase} from './primitive-base';
import {default as String} from './string';
import {default as Boolean} from './boolean';
import {default as Number} from './number';
import {default as List} from './list';
import {default as Function} from './function';
import {default as Reference} from './reference';
import {default as validation} from './validation';
import {default as Es5Map} from './es5-map';
import {default as PropsBase} from './props-base';
import {LifeCycleManager} from './lifecycle';
import {defineEnum, EnumBase} from './define-enum';
import {either} from './generic-types';
import {BaseClass} from "./base-class";

declare const global: {[key:string]:any};
declare const module: {exports:any};
const globalCtx = (typeof self === 'object' && self.self === self && self) ||
    (typeof global === 'object' && global['global'] === global && global) ||
    this;
if (globalCtx.__Mutable){
    module.exports = globalCtx.__Mutable;
} else {
    module.exports = globalCtx.__Mutable = {
        config,
        define,
        NonPrimitive,
        BaseClass,
        PrimitiveBase,
        String,
        Boolean,
        Number,
        List,
        Function,
        Reference,
        validation,
        Map: Es5Map,
        Es5Map,
        PropsBase,
        LifeCycleManager,
        defineEnum,
        EnumBase,
        either
    };
}
