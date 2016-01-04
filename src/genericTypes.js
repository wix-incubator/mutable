/**
 * Created by amira on 30/12/15.
 */

import _                  from 'lodash';
import {getMailBox}       from 'gopostal';
import {arrow} from './validation';

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
		(typeof subTypes === 'function' && action(subTypes,0)) ||
		mapFirst(subTypes, (...args) => args[0] && typeof args[0] === 'function' && action(...args)));
}
function getTypeName(type){
	return type.id || 'subtitle'
}

function mapOrOne(funcOrArr,iteratorFunc){
	if(_.isFunction(funcOrArr) ||  _.isPlainObject(funcOrArr)){
		return iteratorFunc(funcOrArr,0)
	}else{
		return _.map(funcOrArr,iteratorFunc)
	}
}

export function reportDefinitionErrors(subTypes, reportFieldError,template){
	if(_.isPlainObject(subTypes)){
		//prevalidated
		return null;
	}


	var subtypes = mapOrOne(subTypes,(subtype)=>(subtype && subtype.id)||'subtype');

	return doOnType(subTypes, (type,index) => {
		const error = reportFieldError(type,template);
		if(error){
			var path;
			if(_.isArray(subtypes)){
				var withArrow = subtypes.slice();
				withArrow[index] = arrow + withArrow[index];
				path = withArrow.join('|');
			}else {
				path = arrow+subtypes;
			}
			return {
				message:error.message,
				path:path
			}
		}
	})
}

/**
 * @param subTypesArgs one or many subtypes objects (a propper result of normalizeTypes())
 * @returns {string} string representation using angular notation
 */
export function toString(...subTypesArgs){
	return '<' +
		subTypesArgs.map(toUnwrappedString).join(', ') +
		'>';
}


export function toUnwrappedString(subTypes){
	return 	(typeof subTypes === 'function' && subTypes.type.id) || (subTypes && Object.keys(subTypes).join('|'))
}
export function unnormalizedArraytoUnwrappedString(subTypes){
	return 	(typeof subTypes === 'function' && (subTypes.type.id || 'subtype')) || (subTypes && _.forEach(subTypes,unnormalizedArraytoUnwrappedString))
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
