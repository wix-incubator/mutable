import {default as config} from './config';
import {default as define} from './define-type';
import {default as BaseType} from './base-type';
import {default as PrimitiveBase} from './primitive-base';
import {default as String} from './string';
import {default as Boolean} from './boolean';
import {default as Number} from './number';
import {default as List} from './list';
import {default as Function} from './function';
import {default as Reference} from './reference';
import {default as validation} from './validation';
import {default as Map} from './map';
import {default as Es5Map} from './es5-map';
import {default as PropsBase} from './props-base';
import {LifeCycleManager, revision} from './lifecycle';
import {defineEnum, EnumBase} from './define-enum';
import {either} from './generic-types';

const globalCtx = (typeof self === 'object' && self.self === self && self) ||
    (typeof global === 'object' && global.global === global && global) ||
    this;

if (globalCtx.__Mutable){
    module.exports = globalCtx.__Mutable;
} else {
    module.exports = globalCtx.__Mutable = {
        config,
        define,
        BaseType,
        PrimitiveBase,
        String,
        Boolean,
        Number,
        List,
        Function,
        Reference,
        validation,
        Map,
        Es5Map,
        PropsBase,
        LifeCycleManager,
        revision,
        defineEnum,
        EnumBase,
        either
    };
}
