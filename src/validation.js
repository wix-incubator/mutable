import _ from 'lodash';
import {getMailBox} from 'gopostal';
const MAILBOX = getMailBox('Typorama.validation');
import {getReadableValueTypeName} from './utils'

function misMatchMessage(errorContext, expected,recieved,overridepath, template){
	var expectedMessage = template? `expected ${template} of type` : 'expected type';
	return `${errorContext.entryPoint}: "${overridepath||errorContext.path}" ${expectedMessage} ${expected.id || expected} but got ${getReadableValueTypeName(recieved)}`
}
export function reportNullError(errorContext,type, template){
	MAILBOX[errorContext.level](misMatchMessage(errorContext,type,null, template))
}
export function reportMisMatchError(errorContext,type,value,overridepath,template){
	MAILBOX[errorContext.level](misMatchMessage(errorContext,type,value,overridepath,template))
}


export function optionalSetManager(itemValue, lifeCycle) {
	if (itemValue && itemValue.$setManager && typeof itemValue.$setManager === 'function' && !itemValue.$isReadOnly()) {
		itemValue.$setManager(lifeCycle);
	}
}

export function isAssignableFrom(toType, type) {
	return type && toType.type && (type.id === toType.type.id || (type.ancestors && _.contains(type.ancestors, toType.type.id)));
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
			reportNullError(errorContext,type,errorTemplate);
			return type.defaults();
		}
	}
	if(type.validateType(itemValue)){
		optionalSetManager(itemValue, lifeCycle);
		return itemValue;
	} else if(type.type.allowPlainVal(itemValue)){
		var newItem = type.create(itemValue);
		if (typeof newItem.$setManager === 'function') {
			newItem.$setManager(lifeCycle);
		}
		return newItem;
	}
	reportMisMatchError(errorContext, type, itemValue,null,errorTemplate);
	return type.create();
}

export default {
	isAssignableFrom
}
