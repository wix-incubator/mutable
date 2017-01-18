import {Type, isNonPrimitiveType, NonPrimitiveType, ClassOptions, Mutable, ErrorContext} from "../types";
import {FieldAtom} from "./field-atom";
/**
 * the internal schema of a defined class
 */
export interface Spec{
    [fieldName:string] : Type<any, any>;
}
export function isClass(type:any):type is Class<any>{
    return type && type._spec && isNonPrimitiveType(type);
}
export type MutableObj<T> = Mutable<T> & T;

export interface Class<T> extends NonPrimitiveType<MutableObj<T>, T> {
    wrapValue:(value:any, spec: Spec, options?:ClassOptions, errorContext?:ErrorContext)=>T;
    _spec:Spec;
    getFieldsSpec:()=>Spec;
    makeAtoms():{[k:string]:FieldAtom};
}
