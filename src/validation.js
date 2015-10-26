import {getMailBox} from 'gopostal';
const MAILBOX = getMailBox('Typorama.validation');

export function optionalSetManager(itemValue, lifeCycle) {
	if (itemValue && itemValue.$setManager && typeof itemValue.$setManager === 'function' && !itemValue.$isReadOnly()) {
		itemValue.$setManager(lifeCycle);
	}
}

export function validateAndWrap(itemValue, type,  lifeCycle, defaultErr){
	if(itemValue === null) {
		var isNullable = type.options && type.options.nullable;
		if(isNullable) {
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
