import {getMailBox} from 'escalate';

import config from './config';
import {setManager, isDirtyable, DirtyableYielder, AtomYielder, LifeCycleManager} from './lifecycle';
import PrimitiveBase from './primitive-base';
import {getPrimeType} from './utils';
import {validateValue} from './validation';
import {isDataMatching} from './type-match';
import {
    Mutable, DeepPartial, ClassOptions, ErrorContext,
    Type, CompositeType, ReadonlyMutable, ErrorMessage,
    isType, isCompositeType, ReferenceType, MutableObj
} from "./types";
import {Level} from "escalate";

const MAILBOX = getMailBox('Mutable.NonPrimitive');

function createReadOnly<T>(source:Mutable<T>):ReadonlyMutable<T> {
    const result = Object.create(source);
    result.__isReadOnly__ = true;
    if (config.freezeInstance) {
        Object.freeze(result);
    }
    return result;
}

var dataCounter = 0;
function generateId() {
    return dataCounter++;
}

export abstract class NonPrimitive<T> extends PrimitiveBase implements Mutable<T> {
    static ancestors = [];
    static id = 'NonPrimitive';
    static name:string;
    static uniqueId:string;
    static __refType: ReferenceType<any>;
    static byReference: (provider:() => any, path?:Array<string|number>) => any;
    static makeValue:(value:any, options?:ClassOptions, errorContext?:ErrorContext)=>any;
    static defaults:(circularFlags?:string)=> any;

    // TODO: move out
    static reportFieldDefinitionError(fieldDef:Type<any, any>):ErrorMessage|undefined{
        if (!isType(fieldDef)) {
            return { message: `must be a primitive type or extend core3.Type`, path: '' };
        } else if (isCompositeType(fieldDef)) {
            return fieldDef.reportDefinitionErrors();
        }
    }

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


    static create<T>(this:CompositeType<any, T>, value?:DeepPartial<T>, options?:ClassOptions, errorContext?:ErrorContext):Mutable<T> {
        return new this(value, options, errorContext);
    }

    // TODO move into constructor
    static preConstructor(){
        if (NonPrimitive === getPrimeType(this)){
            MAILBOX.error(`Type constructor error: Instantiating the base type is not allowed. You should extend it instead.`);
        } else if (NonPrimitive.uniqueId === getPrimeType(this).uniqueId) {
            MAILBOX.error(`Type definition error: "${this.name}" is not inherited correctly. Did you remember to import core3-runtime?`);
        }
    }

    protected __ctor__ = this.constructor as CompositeType<Mutable<T>, T>;
    private __readOnlyInstance__: ReadonlyMutable<T>;
    private __readWriteInstance__: Mutable<T>;
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
        this.__readOnlyInstance__ = createReadOnly(this);
        this.__readWriteInstance__ = this;
        this.__options__ = options;

        this.__value__ = this.__ctor__.makeValue(
            (value === undefined) ? this.__ctor__.defaults() : value,
            options,
            errorContext
        );
        if (config.freezeInstance) {
            Object.freeze(this);
        }
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
