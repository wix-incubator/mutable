import {Level} from 'escalate';
import {BaseAtom} from 'mobx';
import {TypeMatch} from "./type-match";
import {LifeCycleManager} from "./lifecycle";


export type DeepPartial<T> = {
    [P in keyof T]?:DeepPartial<T[P]>;
} | T;

export function isType(type:any):type is Type<any, any> {
    return type && type.id;
}
export interface Type<T, S>{
    __proto__:any;
    prototype:T;
    id:string;
    options:ClassOptions;
    _prime?:this;
    _matchValue:(value:any, errorContext:ErrorContext) => TypeMatch;
    allowPlainVal(value:any, errorDetails?:ErrorDetails):boolean;
    isNullable():boolean;
    withDefault(defaults?:DefaultSource<T>, validate?:Validator<T|S>, options?:ClassOptions):this|Type<(T|null), S>;
    create(value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext):T;
    defaults():S;
    cloneValue(value:S):S;
    validate:Validator<T|S>;
    validateType:Validator<T|S>;
    isJsAssignableFrom(other:any):other is this;
    reportSetValueErrors(value:any):ErrorMessage;
    preConstructor?():void;
}


export function isMutable(obj:any):obj is Mutable<any>{
    return obj &&
        obj.$setManager && typeof obj.$setManager === 'function' &&
        obj.$isReadOnly && typeof obj.$isReadOnly === 'function';
}

// wrapped object : class instance, list, map
export interface Mutable<T>{
    toJS: ()=>T; // also other methods, WIP
    $isDirtyable():boolean;
    $isReadOnly():boolean;
    __isReadOnly__:boolean;
    __lifecycleManager__? : LifeCycleManager;
    $setManager(newManager?:LifeCycleManager|null):void;
    $dirtyableElementsIterator: (yielder:DirtyableYielder)=>void;
    $atomsIterator: (yielder:AtomYielder)=>void;
}

type DefaultSource<T> = (()=>DeepPartial<T>)|DeepPartial<T>;

export function isCompositeType(type:any):type is CompositeType<any, any>{
    return type && type.byReference && isType(type);
}

// array of constructor arguments
// value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext
export type CtorArgs<T extends Mutable<S>|null, S> = [T|DeepPartial<S>|undefined, ClassOptions|undefined, ErrorContext|undefined];

// class / list / map
export interface CompositeType<T extends Mutable<S>|null, S> extends Type<T, S> {
    createErrorContext(entryPoint:string, level:Level):ErrorContext;
    reportDefinitionErrors():ErrorMessage;
    // this is not the right place for reportFieldDefinitionError
    reportFieldDefinitionError(field:Type<any, any>):ErrorMessage;
    uniqueId:string;
    preConstructor():void;
    __refType: ReferenceType<T>;
    byReference: (provider:() => any, path?:Array<string|number>) => T;
    new(value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext): T;
}

/**
 * the internal schema of a defined class
 */
export interface Spec{
    [fieldName:string] : Type<any, any>;
}
export function isClass(type:any):type is Class<any>{
    return type && type._spec && isCompositeType(type);
}

export interface ReferenceType<T>{
    new :(provider:() => any, path:string[])=>T
}
export interface Class<T> extends CompositeType<Mutable<T>, T> {
    _spec:Spec;
    getFieldsSpec():Spec;
    ancestors : string[];
}

export function cast<T>(ref:any): T{
    return ref as T;
}
export interface ClassOptions{
    nullable?:boolean;
}

export interface Validator<T> {
    (value: any): value is T;
}

export interface ErrorContext {
    level: Level;
    entryPoint : string;
    path : string;
}

export interface ErrorMessage {
    path:string;
    message: string;
}
export interface ErrorDetails {
    actual:any;
    expected:any;
    path:string;
}
export type DirtyableYielder = (container:Mutable<any>, element:Mutable<any>)=>void;

export type AtomYielder = (atom:BaseAtom)=>void;
