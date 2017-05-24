import * as _ from 'lodash';
import {getReadableValueTypeName} from '../utils';
import {ErrorContext, Type, isNonPrimitiveType} from "../types";

export function misMatchMessage(errorContext:ErrorContext, expected:{id:string}|string, actual:any, overridepath?:string|null, template?:string) {
    const expectedMessage = template ? `expected ${template} of type` : 'expected type';
    return `${errorContext.entryPoint}: "${overridepath || errorContext.path}" ${expectedMessage} ${typeof expected === 'string'? expected : expected.id} but got ${getReadableValueTypeName(actual)}`
}

export function isAssignableFrom(toType:Type<any, any>, type:Type<any, any>) {
    return type && toType && (type.id === toType.id || (isNonPrimitiveType(type) && type.ancestors && _.includes(type.ancestors, toType.id)));
}

export function isNullable(type:Type<any, any>) {
    return !! (type.options && type.options.nullable);
}

export function isEnum(type:any) {
    return type.name === 'EnumType';
}

export function validateValue<S>(type:Type<any, S>, value:any):value is S {
    return validateNullValue(type, value) || validateNotNullValue(type, value);
}

export function validateNotNullValue(type:Type<any, any>, value:any) {
    return !!(value && value.constructor && isAssignableFrom(type, value.constructor));
}

export function validateNullValue(type:Type<any, any>, value:any):value is null {
    return !! (value === null && isNullable(type));
}

export const arrow = String.fromCharCode(10144);

export default {
    isAssignableFrom, isNullable, isEnum
}
