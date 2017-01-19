import {Type, isNonPrimitiveType, NonPrimitiveType, ClassOptions, Mutable, ErrorContext} from "../types";
import {IAtom, BaseAtom} from "mobx";
/**
 * the internal schema of a defined class
 */
export interface Spec{
    [fieldName:string] : Type<any, any>;
}
export function isClass(type:any):type is Class<any>{
    return type && type._spec && isNonPrimitiveType(type);
}
export type MutableObj<T> = Mutable<T> & T & {
    $mobx:ObjectAdministrator;
    getName():string;
};

export interface ObjectAdministrator{
    name:string;
    atoms:{[k:string]:BaseAtom};
}
export interface Class<T> extends NonPrimitiveType<MutableObj<T>, T> {
    wrapValue:(value:any, spec: Spec, options?:ClassOptions, errorContext?:ErrorContext)=>T;
    _spec:Spec;
    getFieldsSpec:()=>Spec;
    makeAdmin(name:string):ObjectAdministrator;
}
