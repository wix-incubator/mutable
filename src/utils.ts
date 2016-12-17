import * as _ from 'lodash';
import {Type, DeepPartial, ClassOptions, ErrorContext, Mutable, Class} from "./types";

let ClassesCounter = 0;
export function generateClassId() {
    return ClassesCounter++;
}

const CLONE_KEY = 'isActiveClone';
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

        //
        // function __(_this:any) {_this.constructor = d; return _this;}
        // d.prototype = b === null ? Object.create(b) : __(Object.create(b.prototype));
    };

/**
 * js inheritence for configuration override (used for .nullable(), .of(), .withDefault()...)
 */
export function cloneType<T extends Mutable<S>|null, S>(TypeToClone:Type<T, S>):Type<T, S> {
    const type = Type as any as Type<T, S>;
    const _super = TypeToClone as any as (value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext) => void;
    function Type(value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext) {
        _super.call(this, value === undefined ? type.defaults() : value,
            options ? _.assign({}, type.options, options) : type.options,
            errorContext);
    }
    __extends(Type, TypeToClone);
    type._prime = getPrimeType(TypeToClone);
    type.options = TypeToClone.options ? clone(TypeToClone.options, true) : {};
    type.__proto__ = Object.create(TypeToClone);  // inherint non-enumerable static properties
    return type;
}

export function getFieldDef(type:Class<any>, fieldName:string):Type<any, any> {
    return type._spec[fieldName];
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
