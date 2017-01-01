import {Level} from 'escalate';
import {TypeMatch} from "./type-match";
import {LifeCycleManager, DirtyableYielder, AtomYielder} from "./lifecycle";
import PrimitiveBase from "./primitive-base";
import {NonPrimitive} from "./non-primitive";


export type DeepPartial<T> = {
    [P in keyof T]?:DeepPartial<T[P]>|null;
};

export function isType(type:any):type is Type<any, any> {
    return type && type.id && PrimitiveBase.isJsAssignableFrom(type);
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
    withDefault(defaults?:DefaultSource<T>, validate?:Validator<T|S>, options?:DeepPartial<ClassOptions>):this|Type<(T|null), S>;
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
export type Mutable<T> = MutableObj<T>; // & T;
export type ReadonlyMutable<T> = Mutable<Readonly<T>>;

export interface MutableObj<T>{
  //  constructor:CompositeType<Mutable<T>, T>;
    toJS(typed?:boolean):T;
    toJSON(recursive?:boolean, typed?:boolean):T;
    $isDirtyable():boolean;
    $isReadOnly():boolean;
    $asReadOnly(): ReadonlyMutable<T>;
    getRuntimeId():number;
    matches(other:any) :boolean;
    __isReadOnly__:boolean;
    __lifecycleManager__? : LifeCycleManager;
    $setManager(newManager?:LifeCycleManager|null):void;
    $dirtyableElementsIterator: (yielder:DirtyableYielder)=>void;
    $atomsIterator: (yielder:AtomYielder)=>void;
}

type DefaultSource<T> = (()=>DeepPartial<T>)|DeepPartial<T>;

export function isCompositeType(type:any):type is CompositeType<any, any>{
    return type && type.byReference && NonPrimitive.isJsAssignableFrom(type);
}

// array of constructor arguments
// value?:T|DeepPartial<S>, options?:ClassOptions, errorContext?:ErrorContext
export type CtorArgs<T extends Mutable<S>|null, S> = [T|DeepPartial<S>|undefined, ClassOptions|undefined, ErrorContext|undefined];

// class / list / map
export interface CompositeType<T extends Mutable<S>|null, S> extends Type<T, S> {
    ancestors : string[];
    prototype:T;
    createErrorContext(entryPoint:string, level:Level):ErrorContext;
    reportDefinitionErrors():ErrorMessage|undefined;
    // this is not the right place for reportFieldDefinitionError
    reportFieldDefinitionError(field:Type<any, any>):ErrorMessage|undefined;
    uniqueId:string;
    preConstructor():void;
    __refType: ReferenceType<T>;
    makeValue:(value:any, options?:ClassOptions, errorContext?:ErrorContext)=>S;
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
    new(provider:() => any, path:Array<string|number>):T
}
export interface Class<T> extends CompositeType<Mutable<T>, T> {
    wrapValue:(value:any, spec: Spec, options?:ClassOptions, errorContext?:ErrorContext)=>T;
    _spec:Spec;
    getFieldsSpec():Spec;
}

export function cast<T>(ref:any): T{
    return ref as T;
}

type GenericSignature = Array<Type<any, any>>;
export interface ClassOptions{
    nullable?:boolean;
    subTypes?:GenericSignature
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
