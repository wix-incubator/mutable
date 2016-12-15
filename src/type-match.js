import * as _ from 'lodash';
import {getMailBox} from 'escalate';
import {misMatchMessage, validateNotNullValue} from './validation';
import {optionalSetManager} from './lifecycle';
import {PrimitiveBase} from './primitive-base';
import {getClassesByName} from './class-repo';
const MAILBOX = getMailBox('Mutable.type-match');

export function validateAndWrap(itemValue, type, lifeCycle, errorContext, errorTemplate) {
    itemValue = new TypeMatch(itemValue, errorContext, errorTemplate).tryType(type).wrap();
    optionalSetManager(itemValue, lifeCycle);
    return itemValue;
}

/**
 * checks if one instance matches another instance's type and schema values
 * (not-symetric)
 * @param origin first instance to match, also defines the data schema
 * @param other other instance to match
 * @return true iff all other is assignable to origin's type and matches all it's fields
 */
export function isDataMatching(origin, other) {
    return !!(origin === other || (origin && !other) || // TODO: should compare to null and undefined
    (_.isString(origin) && _.isString(other) && origin.localeCompare(other) === 0) ||
    (_.isObject(origin) && origin.constructor && origin.constructor && validateNotNullValue(origin.constructor, other) &&
    Object.keys(origin.constructor._spec).every(fieldName => isDataMatching(origin[fieldName], other[fieldName]))));
}

export class TypeMatch{
    match = matchTypes.MISMATCH;
    type = PrimitiveBase;
    constructor(value, errorContext, errorTemplate){
        this.value = value;
        this.errorContext = errorContext;
        this.errorTemplate = errorTemplate;
        this.errorDetails = {
            path : errorContext? errorContext.path : '',
            expected: PrimitiveBase,
            actual:this.value
        };
    }
    wrap(){
        return this.match.wrap(this.value, this.type, this.errorContext, this.errorTemplate, this.errorDetails);
    }
    tryTypeAnnotation(){
        if (this.value && this.value._type){
            const types = getClassesByName(this.value._type);
            if (types){
                this.tryTypes(...types);
            } else {
                MAILBOX.error('did not find type '+this.value._type);
            }
        }
    }
    tryTypes(...newTypes) {
        for (let i=0; i < newTypes.length && !this.match.best; ++i){
            this.tryType(newTypes[i]);
        }
        return this;
    }
    tryType(newType){
        let errorDetails = {
            path : this.errorContext? this.errorContext.path : '',
            expected:newType,
            actual:this.value
        };
        let newMatch = matchValueToType(this.value, newType, errorDetails);
        if (this.match.worseThan(newMatch)){ //direction of check matters! in case of two mismatches, still update this.type
            this.match = newMatch;
            this.type = newType;
            this.errorDetails = errorDetails;
        }
        return this;
    }
}
/**
 * each match type knows how to wrap input value,
 * can tell if it's better than another match type,
 * and can also tell if it's the best possible match for a given input
 */
const matchTypes = {
    PERFECT : {
        wrap: (itemValue) => itemValue,
        worseThan: (o) => false,
        best:true
    },
    TYPED_NATIVE_JS_VALUE : {
        wrap: (itemValue, type, errorContext) => type.create(itemValue, undefined, errorContext),
        worseThan: (o) => o === matchTypes.PERFECT
    },
    NATIVE_JS_VALUE : {
        wrap: (itemValue, type, errorContext) => type.create(itemValue, undefined, errorContext),
        worseThan: (o) => o !== matchTypes.MISMATCH
    },
    MISMATCH: {
        wrap: (itemValue, type, errorContext, errorTemplate, errorDetails) => {
            let errorPath = null;
            if (errorDetails){
                itemValue = errorDetails.actual;
                type = errorDetails.expected;
                errorPath = errorDetails.path;
            }
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, type, itemValue, errorPath, errorTemplate));
            return type.create();
        },
        worseThan: (o) => true
    }
};

function matchValueToType(itemValue, type, errorDetails){
    if (itemValue === null) {
        return type.isNullable() ? matchTypes.PERFECT : matchTypes.MISMATCH;
    } else if (type.validateType(itemValue)) { //todo polymorphism?
        return matchTypes.PERFECT;
    } else if (type.allowPlainVal(itemValue, errorDetails)){
        return (type.id === itemValue._type) ? matchTypes.TYPED_NATIVE_JS_VALUE : matchTypes.NATIVE_JS_VALUE;
    } else {
        return matchTypes.MISMATCH
    }
}
