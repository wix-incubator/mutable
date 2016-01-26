import _ from 'lodash';
import {getMailBox} from 'gopostal';
const MAILBOX = getMailBox('Typorama.validation');
import {getReadableValueTypeName} from './utils'

export function misMatchMessage(errorContext, expected,recieved,overridepath, template){
	var expectedMessage = template? `expected ${template} of type` : 'expected type';
	return `${errorContext.entryPoint}: "${overridepath||errorContext.path}" ${expectedMessage} ${expected.id || expected} but got ${getReadableValueTypeName(recieved)}`
}
export function optionalSetManager(itemValue, lifeCycle) {
	if (itemValue && itemValue.$setManager && typeof itemValue.$setManager === 'function' && !itemValue.$isReadOnly()) {
		itemValue.$setManager(lifeCycle);
	}
}

export function isAssignableFrom(toType, type) {
	return type && toType.type && (type.id === toType.type.id || (type.ancestors && _.contains(type.ancestors, toType.type.id)));
}

/**
 * checks if one instance matches another instance's type and schema values
 * (not-symetric)
 * @param origin first instance to match, also defines the data schema
 * @param other other instance to match
 * @return true iff all other is assignable to origin's type and matches all it's fields
 */
export function isDataMatching(origin, other){
	return !!(origin === other || (!origin && !other) ||
		(_.isString(origin) && _.isString(other) && origin.localeCompare(other) === 0) ||
		(_.isObject(origin) && origin.constructor && origin.constructor.type && validateNotNullValue(origin.constructor.type, other) &&
		Object.keys(origin.constructor._spec).every( fieldName => isDataMatching(origin[fieldName], other[fieldName]))));
}

export function isNullable(type){
	return type.options && type.options.nullable;
}

export function validateValue(type, value) {
	return validateNullValue(type, value) || validateNotNullValue(type, value);
}

export function validateNotNullValue(type, value) {
	return  value && value.constructor && isAssignableFrom(type, value.constructor.type);
}

export function validateNullValue(type, value) {
	if(value === null) {
		if(isNullable(type)) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

export function validateAndWrap(itemValue, type,  lifeCycle, errorContext,errorTemplate){
	if(itemValue === null) { // shortcut check for nullable (also checked in allowPlainVal)
		if(isNullable(type)) {
			return itemValue;
		} else {
			MAILBOX.post(errorContext.level, misMatchMessage(errorContext,type,null, errorTemplate));
			return type.defaults();
		}
	}
	if(type.validateType(itemValue)){
		optionalSetManager(itemValue, lifeCycle);
		return itemValue;
	} else if(type.type.allowPlainVal(itemValue)){
		var newItem = type.create(itemValue,undefined,errorContext);
		if (typeof newItem.$setManager === 'function') {
			newItem.$setManager(lifeCycle);
		}
		return newItem;
	}
	MAILBOX.post(errorContext.level, misMatchMessage(errorContext,type,itemValue,null,errorTemplate));
	return type.create();
}
export const arrow = String.fromCharCode(10144);

export default {
	isAssignableFrom
}
