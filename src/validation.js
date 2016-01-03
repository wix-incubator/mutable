import _ from 'lodash';
import {getMailBox} from 'gopostal';
const MAILBOX = getMailBox('Typorama.validation');
import {getReadableValueTypeName} from './utils'

function misMatchMessage(errorContext, expected,recieved,overridepath){
	return `${errorContext.entryPoint}: "${overridepath||errorContext.path}" expected type ${expected.id} but got ${getReadableValueTypeName(recieved)}`
}
export function reportNullError(errorContext,type){
	MAILBOX[errorContext.level](misMatchMessage(errorContext,type,null))
}
export function reportMisMatchError(errorContext,type,value,overridepath){
	MAILBOX[errorContext.level](misMatchMessage(errorContext,type,value,overridepath))
}
export function optionalSetManager(itemValue, lifeCycle) {
	if (itemValue && itemValue.$setManager && typeof itemValue.$setManager === 'function' && !itemValue.$isReadOnly()) {
		itemValue.$setManager(lifeCycle);
	}
}

export function isAssignableFrom(toType, type) {
	return type && (type.id === toType.type.id || (type.ancestors && _.contains(type.ancestors, toType.type.id)));
}

export function isNullable(Type){
	return Type.options && Type.options.nullable;
}

export function validateNullValue(Type, value) {
	if(value === null) {
		if(isNullable(Type)) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

export function validateAndWrap(itemValue, type,  lifeCycle, errorContext){
	if(itemValue === null) { // shortcut check for nullable (also checked in allowPlainVal)
		if(isNullable(type)) {
			return itemValue;
		} else {
			reportNullError(errorContext,type);
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
	reportMisMatchError(errorContext, type, itemValue);
	return type.create();
}

export default {
	isAssignableFrom
}
