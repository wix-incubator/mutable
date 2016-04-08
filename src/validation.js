import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import {getReadableValueTypeName} from './utils';
import {optionalSetManager} from './lifecycle';

const MAILBOX = getMailBox('Typorama.validation');

export function misMatchMessage(errorContext, expected, recieved, overridepath, template) {
    var expectedMessage = template ? `expected ${template} of type` : 'expected type';
    return `${errorContext.entryPoint}: "${overridepath || errorContext.path}" ${expectedMessage} ${expected.id || expected} but got ${getReadableValueTypeName(recieved)}`
}

export function isAssignableFrom(toType, type) {
    return type && toType.type && (type.id === toType.type.id || (type.ancestors && _.includes(type.ancestors, toType.type.id)));
}

/**
 * checks if one instance matches another instance's type and schema values
 * (not-symetric)
 * @param origin first instance to match, also defines the data schema
 * @param other other instance to match
 * @return true iff all other is assignable to origin's type and matches all it's fields
 */
export function isDataMatching(origin, other) {
    return !!(origin === other || (!origin && !other) ||
        (_.isString(origin) && _.isString(other) && origin.localeCompare(other) === 0) ||
        (_.isObject(origin) && origin.constructor && origin.constructor.type && validateNotNullValue(origin.constructor.type, other) &&
            Object.keys(origin.constructor._spec).every(fieldName => isDataMatching(origin[fieldName], other[fieldName]))));
}

export function isNullable(type) {
    return !! (type.options && type.options.nullable);
}

export function validateValue(type, value) {
    return validateNullValue(type, value) || validateNotNullValue(type, value);
}

export function validateNotNullValue(type, value) {
    return value && value.constructor && isAssignableFrom(type, value.constructor.type);
}

export function validateNullValue(type, value) {
    return value === null && isNullable(type);
}

export function validateAndWrap(itemValue, type, lifeCycle, errorContext, errorTemplate) {
    if (itemValue === null) { // shortcut check for nullable (also checked in allowPlainVal)
        if (isNullable(type)) {
            return itemValue;
        } else {
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, type, null, errorTemplate));
            return type.defaults();
        }
    }
    if (!type.validateType(itemValue)) {
        if (type.allowPlainVal(itemValue)) {
            itemValue = type.create(itemValue, undefined, errorContext);
        } else {
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, type, itemValue, null, errorTemplate));
            itemValue = type.create();
        }
    }
    optionalSetManager(itemValue, lifeCycle);
    return itemValue;
}
export const arrow = String.fromCharCode(10144);

export default {
    isAssignableFrom
}
