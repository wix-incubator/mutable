import {Level} from 'escalate';
import {BaseAtom} from 'mobx';


export type DeepPartial<T> = {
    [P in keyof T]?:DeepPartial<T[P]>;
} | T;

export function isType(type:any):type is Type<any, any> {
    return type && type.id;
}
export interface Type<T, S>{
    __proto__:any;
    id:string;
    options:ClassOptions;
    _prime?:this;
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

// wrapped object : class instance, list, map
export type Mutable<T> = {
    [P in keyof T]:T[P];
    } & {
    toJS: ()=>T; // also other methods, WIP
};

type DefaultSource<T> = (()=>DeepPartial<T>)|DeepPartial<T>;

export function isCompositeType(type:any):type is CompositeType<any, any>{
    return type && type.preConstructor && isType(type);
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

export type LifeCycleManager = {};

export interface MutableObj{
    __lifecycleManager__? : LifeCycleManager;
    $setManager(newManager:LifeCycleManager):void;
    $dirtyableElementsIterator: (yielder:DirtyableYielder)=>void;
    $atomsIterator: (yielder:AtomYielder)=>void;
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
export type DirtyableYielder = (container:MutableObj, element:MutableObj)=>void;

export type AtomYielder = (atom:BaseAtom)=>void;
