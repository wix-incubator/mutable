import {getMailBox} from 'escalate';

import config from './../config';
import {setManager, isDirtyable, DirtyableYielder, AtomYielder, LifeCycleManager} from './lifecycle';
import {Any} from './../data-types/any';
import {getPrimeType, generateClassId} from '../utils';
import {validateValue, validateNullValue} from './validation';
import {isDataMatching} from './type-match';
import {
    Mutable, DeepPartial, ClassOptions, ErrorContext,
    Type, NonPrimitiveType, ReadonlyMutable, ErrorMessage,
    isType, isNonPrimitiveType, ReferenceType} from "../types";
import {Level} from "escalate";
import {defaultObject} from "./../objects/default-object";

const MAILBOX = getMailBox('mutable.MuBase');

function createReadOnly<T>(source:Mutable<T>):ReadonlyMutable<T> {
    const result = Object.create(source);
    result.__isReadOnly__ = true;
    return result;
}

let dataCounter = 0;
function generateId() {
    return dataCounter++;
}

export abstract class MuBase<T> extends Any implements Mutable<T> {
    static ancestors = ['Base'];
    static id = 'Base';
    static uniqueId:string;
    static __refType: ReferenceType<any>;
    static byReference: (provider:() => any, path?:Array<string|number>) => any;
    static makeValue:(value:any, options?:ClassOptions, errorContext?:ErrorContext)=>any;
    static defaults:(circularFlags?:string)=> any;

    // TODO: move out
    static createErrorContext(entryPoint:string, level:Level):ErrorContext{
        return {
            level,
            entryPoint,
            path: this.id
        }
    }

    /**
     * @param value any value
     * @returns {*} true if value is a legal value for this type, falsy otherwise
     */
    // TODO: move out
    static validateType(value:any):value is any {
        return validateValue(this, value);
    }
    static validate(value:any):value is any {
        return validateNullValue(this, value) || !!(value && typeof value === 'object');
    }

    static create<T>(this:NonPrimitiveType<any, T>, value?:DeepPartial<T>, options?:ClassOptions, errorContext?:ErrorContext):Mutable<T> {
        if (MuBase as any === getPrimeType(this)){
            return defaultObject((typeof this.defaults === 'function')? this.defaults() : value) as any ;
        } else {
            return new this(value, options, errorContext);
        }
    }

    protected __ctor__ = this.constructor as NonPrimitiveType<this, T>;
    protected __readOnlyInstance__: ReadonlyMutable<T>;
    protected __readWriteInstance__: Mutable<T>;
    private __id__: number;
    protected __value__ : T;
    protected __options__?:ClassOptions;
    __lifecycleManager__: LifeCycleManager;

    __isReadOnly__:boolean = false;
    $setManager = setManager;
    $isDirtyable = isDirtyable;

    constructor(value?:DeepPartial<T>|null, options?:ClassOptions, errorContext?:ErrorContext) {
        super();
        errorContext = errorContext || this.__ctor__.createErrorContext('Type constructor error', 'error');
        if (MuBase as any === getPrimeType(this.__ctor__)){
            MAILBOX.post(errorContext.level, `${errorContext.entryPoint}: "${errorContext.path}" Instantiating the base type is not allowed. You should extend it instead.`);
        } else if (MuBase.uniqueId === getPrimeType(this.__ctor__).uniqueId) {
            MAILBOX.post(errorContext.level, `${errorContext.entryPoint}: "${errorContext.path}" "${this.__ctor__.name}" is not inherited correctly. Did you remember to import core3-runtime?`);
        }
        this.__readOnlyInstance__ = createReadOnly(this);
        this.__readWriteInstance__ = this;
        this.__options__ = options;

        this.__value__ = this.__ctor__.makeValue(
            (value === undefined) ? this.__ctor__.defaults() : value,
            options,
            errorContext
        );
    }

    abstract $dirtyableElementsIterator(yielder:DirtyableYielder):void;
    abstract $atomsIterator(yielder:AtomYielder):void;
    // merge native javascript data into the object
    abstract setValue(newValue:any, errorContext?:ErrorContext):boolean;
    // merge native javascript data into the object, add defaults when missing fields
    abstract setValueDeep(newValue:any, errorContext?:ErrorContext):boolean;
    abstract toJSON(recursive?:boolean, typed?:boolean):T;
    abstract toJS(typed?:boolean):T;

    $isReadOnly() {
        return this.__isReadOnly__;
    }

    $asReadOnly() {
        return this.__readOnlyInstance__;
    }

    $asReadWrite() {
        return this.__readWriteInstance__;
    }

    getRuntimeId() {
        if (this.__id__ !== undefined) {
            return this.__id__;
        }
        if (this.__isReadOnly__) {
            return this.__readWriteInstance__.getRuntimeId();
        } else {
            this.__id__ = generateId();
            return this.__id__;
        }
    }
    matches(other:any) :boolean{
        return isDataMatching(this, other);
    }
}

export function defineNonPrimitive<T>(id:string, jsClass: NonPrimitiveType<Mutable<T>, T>){
    if (!MuBase.isJsAssignableFrom(jsClass)){
        MAILBOX.fatal(`Type definition error: ${(jsClass as any).id || id} is not a subclass of NonPrimitive`);
    }
    jsClass.id = id;
    if (!jsClass.ancestors){
        jsClass.ancestors = [jsClass.id];
    } else if(!~jsClass.ancestors.indexOf(jsClass.id)) {
        jsClass.ancestors = jsClass.ancestors.concat([jsClass.id]);
    }
    jsClass.uniqueId = '' + generateClassId();
}
