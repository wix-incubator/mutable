import * as _ from 'lodash';
import {getMailBox} from 'escalate';
import {arrow} from './validation';
import Union from './../data-types/union';
const MAILBOX = getMailBox('mutable.genericTypes');

/**
 * try to match a type to a value
 * @param subTypes either a type or a collection of types
 * @param instance null, mutable or plain value instance to match
 * @returns {*} type if matched, otherwise undefined
 */
export function getMatchingType(subTypes, val) {
    return doOnType(subTypes, type =>
        (typeof type.validateType === 'function' && type.validateType(val)) ||
            (typeof type.allowPlainVal === 'function' && type.allowPlainVal(val))
            ? type : undefined
    );
}

/**
 * do an action on the generic type and return the result.
 * if the generic type represents a union, do the action on each type in the union and return the first result that is not undefined
 */
export function doOnType(subTypes, action) {
    if (subTypes) {
        if (subTypes.id === 'Union'){
            subTypes = subTypes.getTypes();
        }
        if (typeof subTypes === 'function') {
            return action(subTypes, 0);
        } else {
            for (let key in subTypes) {
                let type = subTypes.hasOwnProperty(key) && subTypes[key];
                if (typeof type === 'function') {
                    let result = action(type, key);
                    if (result !== undefined) {
                        return result;
                    }
                }
            }
        }
    }
}


function mapOrOne(funcOrArr, iteratorFunc) {
    if (_.isFunction(funcOrArr) || _.isPlainObject(funcOrArr)) {
        return iteratorFunc(funcOrArr, 0)
    } else {
        return _.map(funcOrArr, iteratorFunc)
    }
}

export function reportDefinitionErrors(subTypes, reportFieldError, template) {
    if (_.isPlainObject(subTypes)) {
        //prevalidated
        return null;
    }


    var subtypes = mapOrOne(subTypes, (subtype) => (subtype && subtype.id) || 'subtype');

    return doOnType(subTypes, (type, index) => {
        const error = reportFieldError(type, template);
        if (error) {
            var path;
            if (_.isArray(subtypes)) {
                var withArrow = subtypes.slice();
                withArrow[index] = arrow + withArrow[index];
                path = withArrow.join('|');
            } else {
                path = arrow + subtypes;
            }
            return {
                message: error.message,
                path: path
            }
        }
    })
}

/**
 * @param subTypesArgs one or many subtypes objects (a propper result of normalizeTypes())
 * @returns {string} string representation using angular notation
 */
export function toString(...subTypesArgs) {
    return '<' +
        subTypesArgs.map(toUnwrappedString).join(', ') +
        '>';
}


export function toUnwrappedString(subTypes) {
    return (typeof subTypes === 'function' && subTypes.id) || (subTypes && Object.keys(subTypes).join('|'))
}

export function unnormalizedArraytoUnwrappedString(subTypes) {
    return (typeof subTypes === 'function' && (subTypes.id || 'subtype')) || (subTypes && _.forEach(subTypes, unnormalizedArraytoUnwrappedString))
}

/**
 *
 * @param subTypes could be a type, a result of a call to either() or a result of a previous call to this function
 * @returns {*} a type, or an object that maps type ids to types (a union type object)
 */
export function typesAsArray(subTypes) {
    if (subTypes && subTypes.id === 'Union') {
        subTypes = subTypes.getTypes();
    }
    return subTypes;
}

/**
 * method for union types creation
 * @param types types to unionize
 * @returns {*} the union of the supplied types
 */
export function either(...types) {
    return Union.of(types);
}
