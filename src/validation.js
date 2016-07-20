import * as _ from 'lodash';
import {getMailBox} from 'escalate';
import {getReadableValueTypeName} from './utils';

export function misMatchMessage(errorContext, expected, actual, overridepath, template) {
    var expectedMessage = template ? `expected ${template} of type` : 'expected type';
    return `${errorContext.entryPoint}: "${overridepath || errorContext.path}" ${expectedMessage} ${expected.id || expected} but got ${getReadableValueTypeName(actual)}`
}

export function isAssignableFrom(toType, type) {
    return type && toType && (type.id === toType.id || (type.ancestors && _.includes(type.ancestors, toType.id)));
}

export function isNullable(type) {
    return !! (type.options && type.options.nullable);
}

export function validateValue(type, value) {
    return validateNullValue(type, value) || validateNotNullValue(type, value);
}

export function validateNotNullValue(type, value) {
    return !!(value && value.constructor && isAssignableFrom(type, value.constructor));
}

export function validateNullValue(type, value) {
    return !! (value === null && isNullable(type));
}

export const arrow = String.fromCharCode(10144);

export default {
    isAssignableFrom
}
