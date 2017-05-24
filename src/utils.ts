import * as _ from 'lodash';
import {default as config} from './config';
import {getMailBox} from 'escalate';
const MAILBOX = getMailBox('mutable.utils');

import {
    Type, DeepPartial, ClassOptions, ErrorContext, Mutable, CtorArgs, cast, NonPrimitiveType,
    ErrorMessage, isType, isNonPrimitiveType
} from "./types";
import {Class} from "./objects/types";
import {Level} from "escalate";

export function isDevMode(){
    return config.devMode;
}

let ClassesCounter = 0;
export function generateClassId() {
    return ClassesCounter++;
}

const CLONE_KEY = '@activeClone';
interface Complex extends Object{
    [k:string]:any;
    [k:number]:any;
}
function isComplex(obj:any):obj is Complex{
    return obj !== null && typeof(obj) === 'object';
}
export function clone<T>(arg:T, isDeep = false):T {
    if (isComplex(arg)) {
        const obj:Complex = arg;
        if(obj[CLONE_KEY] === undefined) {
            const cloned = obj.constructor ? obj.constructor() : {};
            for (let key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (isDeep) {
                        obj[CLONE_KEY] = null;
                        cloned[key] = clone(obj[key]);
                        delete obj[CLONE_KEY];
                    } else {
                        cloned[key] = obj[key];
                    }
                }
            }
            return cloned;
        }
    }
    return arg;
}

// in case T is nullable, the result will be a little different
export function getPrimeType<T extends Type<any, any>>(type:T):T{
    return (type && type._prime || type) as T;
}

export const __extends = (this && this.__extends) || function (d:any, b:any) {
        for (let p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new(__ as any)());
    };

type PreSuperFunction<R extends Type<T, S>, T extends Mutable<S>|null, S> = (type:R, value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext)=>CtorArgs<T, S>;

function anonymousInherit<R extends Type<T, S>, T extends Mutable<S>|null, S>(id:string, parent:R, superArgsMutator?:PreSuperFunction<R, T, S>):R{
    const type = Type as any as R;
    const _super = parent as any as (value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext) => T;
    function Type(value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext) {
        return _super.apply(this,
                superArgsMutator ? superArgsMutator(type, value, options, errorContext) : [value, options, errorContext]
            ) || this;
    }
    return type;
}
const classNameRegExp = /^(?:[\$A-Z_a-z])(?:[\$0-9A-Z_a-z])*$/;
const unionClassDelimitter = /\|/gi;

function namedInherit<R extends Type<T, S>, T extends Mutable<S>|null, S>(id:string, parent:R, superArgsMutator?:PreSuperFunction<R, T, S>):R{
    let safeId = id.replace(unionClassDelimitter, '_or_');
    if (!classNameRegExp.test(safeId)){
        MAILBOX.info(`illegal class name "${safeId}", using "Type" instead`);
        safeId = 'Type';
    }
    const type = cast<R>(new Function('parent', 'superArgsMutator', `return function ${safeId}(value, options, errorContext) {
    return parent.${superArgsMutator ? `apply(this, superArgsMutator(${safeId}, value, options, errorContext))` : 'call(this, value, options, errorContext)'} || this;
    };`)(parent, superArgsMutator));
    return type;
}

export function shouldAssign(a:any, b:any){
    return b !== undefined && a !== b && !(_.isNaN(a) && _.isNaN(b));
}
const makeSuper = isDevMode() ? namedInherit : anonymousInherit;
export function inherit<R extends Type<T, S>, T extends Mutable<S>|null, S>(id:string, parent:R, superArgsMutator?:PreSuperFunction<R, T, S>):R{
    const type = makeSuper(id, parent, superArgsMutator);
    __extends(type, parent);
    type.__proto__ = Object.create(parent); // inherit static properties of parent's prototype
    return type;

}

function clonedPreSuper<R extends Type<T, S>, T extends Mutable<S>|null, S>(type:R, value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext){
    return [value === undefined ? type.defaults() : value,
        options ? _.assign({}, type.options, options) : type.options,
        errorContext];
}

export const defaultClassOptions:ClassOptions = {
    nullable:false,
    staticTransitiveOverrides:[],
    transitiveOverrides:[]
};

/**
 * js inheritence for configuration override (used for .nullable(), .of(), .withDefault()...)
 */
export function cloneType<R extends Type<T, S>, T extends Mutable<S>|null, S>(id:string, TypeToClone:R, options?:DeepPartial<ClassOptions>):R {
    const type = inherit<R, T, S>(id, TypeToClone, clonedPreSuper as PreSuperFunction<R, T, S>);
    type._prime = getPrimeType(TypeToClone);
    type.options = _.defaults(options || {}, TypeToClone.options);
    type.__proto__ = Object.create(TypeToClone);  // inherint non-enumerable static properties
    return type;
}

export function getReadableValueTypeName(value:any):string {
    if (value === null)
        return 'null';
    if (value === undefined)
        return 'undefined';
    if (value.constructor && value.constructor.id) {
        return value.constructor.id
    } if (typeof value === 'object' && typeof value._type === 'string') {
        return 'object with _type ' + value._type;
    }
    return typeof value;
}

export function getValueFromRootRef(rootReference: () => any, path: Array<string|number>) {
    let value = rootReference();
    // TODO add checks (the entire path should be objects, arrays or functions)
    for (let i = 0; i < path.length; i++) {
        value = value[path[i]];
    }
    return value;
}

export function getReferenceWrapper<T>(thisType: NonPrimitiveType<any, any>, fieldDef: Type<T, any>, rootReference: () => any, path: Array<string|number>, value: any):T {
    const fieldErrorContext = thisType.createErrorContext('get reference error', 'error');
    return fieldDef._matchValue(value, fieldErrorContext).byReference(rootReference, path);
}

export function reportFieldDefinitionError(fieldDef:Type<any, any>):ErrorMessage|undefined{
    if (!isType(fieldDef)) {
        return { message: `must be a primitive type or extend core3.Type`, path: '' };
    } else if (isNonPrimitiveType(fieldDef)) {
        return fieldDef.reportDefinitionErrors();
    }
}
