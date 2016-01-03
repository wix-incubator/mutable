/**
 * Created by amira on 30/12/15.
 */

import _                  from 'lodash';
import {getMailBox}       from 'gopostal';


const MAILBOX = getMailBox('Typorama.genericTypes');

/**
 * map each value in a collection and return the first not-falsy result
 */
function mapFirst(collection, mapper) {
	return _(collection).map(mapper).filter().first();
}

/**
 * try to match a type to a value
 * @param subTypes either a type or a collection of types
 * @param instance null, typorama or plain value instance to match
 * @returns {*} type if matched, otherwise undefined
 */
export function getMatchingType(subTypes, val){
	return doOnType(subTypes, type =>
		(typeof type.validateType === 'function' && type.validateType(val)) ||
		(typeof type.allowPlainVal === 'function' && type.type.allowPlainVal(val))
		? type : null
	);
}

export function doOnType(subTypes, action){
	return subTypes && (
		(typeof subTypes === 'function' && action(subTypes)) ||
		mapFirst(subTypes, (...args) => args[0] && typeof args[0] === 'function' && action(...args)));
}


export function reportDefinitionErrors(subTypes, reportFieldError,template){
	return doOnType(subTypes, (type, key='0') => {
		const error  = reportFieldError(type,template);
		if(error){
			return {path:`<${key}${error.path}>`,message:error.message};
		}
	});
}

/**
 * @param subTypesArgs one or many subtypes objects (a propper result of normalizeTypes())
 * @returns {string} string representation using angular notation
 */
export function toString(...subTypesArgs){
	return '<' +
		subTypesArgs.map(subTypes =>
			(typeof subTypes === 'function' && subTypes.type.id) ||
			(subTypes && Object.keys(subTypes).join('|'))
		).join(', ') +
		'>';
}




/**
 *
 * @param subTypes could be a type, a result of a call to either() or a result of a previous call to this function
 * @returns {*} a type, or an object that maps type ids to types (a union type object)
 */
export function normalizeTypes(subTypes){
	if(subTypes && subTypes.union) {
		subTypes = subTypes.reduce(function (subTypes, type) {
			subTypes[type.id || type.name] = type;
			return subTypes;
		}, {});
	}
	return subTypes;
}

/**
 * method for union types creation
 * @param types types to unionize
 * @returns {*} the union of the supplied types
 */
export function either(...types){
	types.union = true;
	return types;
}
