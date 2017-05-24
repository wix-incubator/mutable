import {Level} from 'escalate';
import {TypeMatch} from "./core/type-match";
import {LifeCycleManager, DirtyableYielder, AtomYielder} from "./core/lifecycle";
import {Any} from './data-types/any';
import {MuBase} from "./core/base";

export type DeepPartial<T> = {
    [P in keyof T]?:DeepPartial<T[P]>|null;
};

export function isType(type:any):type is Type<any, any> {
    return type && type.id && Any.isJsAssignableFrom(type);
}
export interface Type<T, S>{
    __proto__:any;
    id:string;
    name?:string;
    options:ClassOptions;
    _prime?:this;
    _matchValue:(value:any, errorContext:ErrorContext) => TypeMatch;
    allowPlainVal(value:any, errorDetails?:ErrorDetails):boolean;
    isNullable():boolean;
    nullable():this;
    withDefault(defaults?:DefaultSource<T>, validate?:Validator<T|S>, options?:DeepPartial<ClassOptions>):this|Type<(T|null), S>;
    create(value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext):T;
    defaults():S;
    cloneValue(value:S):S;
    validate:Validator<T|S>;
    validateType:Validator<T|S>;
    isJsAssignableFrom(other:any):other is this;
    reportSetValueErrors(value:any):ErrorMessage;
}


export function isMutable(obj:any):obj is Mutable<any>{
    return obj &&
        obj.$setManager && typeof obj.$setManager === 'function' &&
        obj.$isReadOnly && typeof obj.$isReadOnly === 'function';
}

// wrapped object : class instance, list, map
export type ReadonlyMutable<T> = Mutable<Readonly<T>>;

export interface Mutable<T>{
  //  constructor:NonPrimitiveType<Mutable<T>, T>;
    toJS(typed?:boolean):T;
    toJSON(recursive?:boolean, typed?:boolean):T;
    $isDirtyable():boolean;
    $isReadOnly():boolean;
    $asReadOnly(): ReadonlyMutable<T>; // TODO improve for MutableObj
    getRuntimeId():number;
    matches(other:any) :boolean;
    __isReadOnly__:boolean;
    __lifecycleManager__? : LifeCycleManager;
    $setManager(newManager?:LifeCycleManager|null):void;
    $dirtyableElementsIterator: (yielder:DirtyableYielder)=>void;
    $atomsIterator: (yielder:AtomYielder)=>void;
    setValue(value:DeepPartial<T>, errorContext?:ErrorContext):boolean
    setValueDeep(value:DeepPartial<T>, errorContext?:ErrorContext):boolean
}

type DefaultSource<T> = (()=>DeepPartial<T>)|DeepPartial<T>;

export function isNonPrimitiveType(type:any):type is NonPrimitiveType<any, any>{
    return type && type.byReference && MuBase.isJsAssignableFrom(type);
}

// array of constructor arguments
// value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext
export type CtorArgs<T extends Mutable<S>|null, S> = [T|DeepPartial<S>|undefined, ClassOptions|undefined, ErrorContext|undefined];

// obj / list / map
export interface NonPrimitiveType<T extends Mutable<S>|null, S> extends Type<T, S> {
    ancestors : string[];
    prototype:T;
    createErrorContext(entryPoint:string, level:Level):ErrorContext;
    reportDefinitionErrors():ErrorMessage|undefined;
    uniqueId:string;
    __refType: ReferenceType<T>;
    makeValue:(value:any, options?:ClassOptions, errorContext?:ErrorContext)=>S;
    byReference: (provider:() => any, path?:Array<string|number>) => T;
    new(value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext): T;
}

export interface ReferenceType<T>{
    new(provider:() => any, path:Array<string|number>):T
}


export function cast<T>(ref:any): T{
    return ref as T;
}

type GenericSignature = Array<Type<any, any>>;
export interface ClassOptions{
    nullable:boolean;
    subTypes?:GenericSignature
    staticTransitiveOverrides:string[];
    transitiveOverrides:string[];
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
