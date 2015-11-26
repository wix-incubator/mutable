import _ from 'lodash';
import {getMailBox} from 'gopostal';
const MAILBOX = getMailBox('Typorama.validation');

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
			MAILBOX.error('Cannot assign null value to a type which is not defined as nullable.');
			return false;
		}
	} else {
		return false;
	}
}

export function validateAndWrap(itemValue, type,  lifeCycle, defaultErr){
	if(itemValue === null) { // shortcut check for nullable (also checked in allowPlainVal)
		if(isNullable(type)) {
			return itemValue;
		} else {
			MAILBOX.error('Cannot assign null value to a type which is not defined as nullable.');
			return defaultErr;
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
	return defaultErr;
}

export default {
	isAssignableFrom
}
