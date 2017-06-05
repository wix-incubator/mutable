import {isFunction, extend} from 'lodash';
import {Mutable, Type} from "../types";
import {DirtyableYielder, AtomYielder} from "../core/lifecycle";
import {getMailBox} from "escalate";
import {Class, MutableObj} from "./types";
import {default as config} from '../config';

/**
 * the schema of the class to define (input format)
 */
interface Schema{
    [fieldName:string] :  Type<any, any>;
}

type  PrivilegedMuObject<T> = MutableObj<T> & {
    __value__ : {[l:string]:any};
}

const MAILBOX = getMailBox('mutable.extend');

export function nonPrimitiveElementsIterator(nonPrimitiveFields: Array<string>, parent: Mutable<any>) {
    return function typeDirtyableElementsIterator(yielder: DirtyableYielder) {
        for (let c of nonPrimitiveFields) {
            let k = this.__value__[c];
            if (k && isFunction(k.$setManager)) { // if value is dirtyable
                yielder(this, k);
            }
        }
        parent && isFunction(parent.$dirtyableElementsIterator) && parent.$dirtyableElementsIterator.call(this, yielder);
    };
}

export function atomsIterator(spec: Schema, parent: Mutable<any>) {
    return function atomsIterator(yielder: AtomYielder) {
        if (config.observable) {
            for (let c in spec) {
                if (spec.hasOwnProperty(c)) {
                    yielder(this.$mobx.atoms[c]);
                }
            }
            parent && isFunction(parent.$atomsIterator) && parent.$atomsIterator.call(this, yielder);
        }
    };
}
function deepClone<T>(clazz:Class<T>, recCaller:Function){
    return function (this:PrivilegedMuObject<T>, recursive = true, typed = false):T {
        const result:T & {_type:string} = Object.keys(clazz._spec).reduce((clone, key: keyof T) => {
            if (config.observable) {
                this.$mobx.atoms[key].reportObserved();
            }
            const fieldValue:any = this.__value__[key];
            clone[key] = recursive ? recCaller(fieldValue, typed) : fieldValue;
            return clone;
        }, {} as T & {_type:string});
        if (typed){
            result._type = clazz.id;
        }
        return result;
    };
}

function recursiveCallToJs(fieldValue:any, typed:boolean){
    return (fieldValue && fieldValue.toJS) ? fieldValue.toJS(typed) : fieldValue;
}

function recursiveCallToJson(fieldValue:any, typed:boolean){
    return (fieldValue && fieldValue.toJSON) ? fieldValue.toJSON(true, typed) : fieldValue;
}

export function toJS<T>(clazz:Class<T>) {
    const cloneFn = deepClone(clazz, recursiveCallToJs);
    return function toJS(typed = false){
        return cloneFn.call(this, true, typed);
    }
}

export function toJSON<T>(clazz:Class<T>){
    const cloneFn = deepClone(clazz, recursiveCallToJson);
    return function toJSON(recursive = true, typed = false){
        return cloneFn.call(this, recursive, typed);
    }
}

export function fieldAttribute(fieldName: string) {
    return {
        get: function (this:PrivilegedMuObject<any>) {
            if (config.observable) {
                this.$mobx.atoms[fieldName].reportObserved();
            }
            const value = this.__value__[fieldName];
            if (!this.__isReadOnly__ || value === null || value === undefined || !value.$asReadOnly) {
                return value;
            } else {
                return value.$asReadOnly();
            }
        },
        set: function (newValue:any) {
            if (this.$isDirtyable()) {
                this.$assignField(fieldName, newValue);
            } else {
                MAILBOX.warn(`Attempt to override a read only value ${JSON.stringify(this.__value__[fieldName])} at ${this.constructor.id}.${fieldName} with ${JSON.stringify(newValue)}`);
            }
        },
        enumerable: true,
        configurable: false
    };
}
