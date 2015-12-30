/**
 * Created by amira on 30/12/15.
 */

import _                  from 'lodash';
import {getMailBox}       from 'gopostal';


const MAILBOX = getMailBox('Typorama.genericTypes');

function mapFirst(collection, mapper) {
	return _(collection).map(mapper).filter().first();
}

/**
 * try to match a type to a plain value
 * @param subTypes either a type or a collection of types
 * @param instance plain value instance to match
 * @returns {*} type if matched, otherwise undefined
 */
export function getPlainValType(subTypes, instance) {
	return doOnType(subTypes,
		type => typeof type.allowPlainVal === 'function' && type.allowPlainVal(instance) ? type : undefined);
}

export function doOnType(subTypes, action){
	return subTypes && (
		(typeof subTypes === 'function' && action(subTypes)) ||
		mapFirst(subTypes, (type) => type && typeof type === 'function' && action(type)));
}

export function toString(subTypes){
	if(typeof subTypes === 'function'){
		return '<'+subTypes.type.id+'>';
	} else if (subTypes){
		return '<'+Object.keys(subTypes).join(',')+'>';
	} else {
		MAILBOX.error('unknown subTypes : ' + JSON.stringify(subTypes));
	}
}

/**
 *
 * @param subTypes could be a type, an array of types or a result of a previous call to this function
 * @returns {*} a type, or an object that maps type ids to types (a union type object)
 */
export function unionTypes(subTypes){
	if(_.isArray(subTypes)) {
		subTypes = subTypes.reduce(function (subTypes, type) {
			subTypes[type.id || type.name] = type;
			return subTypes;
		}, {});
	}
	return subTypes;
}
