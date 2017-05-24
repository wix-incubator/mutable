import * as _ from 'lodash';
import {getMailBox} from 'escalate';
import {misMatchMessage, validateNotNullValue} from './validation';
import {optionalSetManager, LifeCycleManager} from './lifecycle';
import {Any} from './../data-types/any';
import {Type, ErrorDetails, ErrorContext, NonPrimitiveType, isNonPrimitiveType, Mutable} from "../types";

const MAILBOX = getMailBox('mutable.type-match');


export function validateAndWrap<T>(itemValue:any, type:Type<T, any>, lifeCycle:LifeCycleManager|undefined|null, errorContext:ErrorContext, errorTemplate?:string) :T{
    itemValue = matchValueToType(itemValue, type).wrap(itemValue, type, errorContext, errorTemplate);
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
export function isDataMatching(origin:any, other:any):boolean {
    return !!(origin === other || (origin && !other) || // TODO: should compare to null and undefined
    (_.isString(origin) && _.isString(other) && origin.localeCompare(other) === 0) ||
    (_.isObject(origin) && origin.constructor && origin.constructor && validateNotNullValue(origin.constructor, other) &&
    Object.keys(origin.constructor._spec).every(fieldName => isDataMatching(origin[fieldName], other[fieldName]))));
}

export class TypeMatch{
    match:MatchType = matchTypes.MISMATCH;
    type:Type<any, any> = Any;
    errorDetails:ErrorDetails;
    constructor(private value:any, private errorContext?:ErrorContext, private errorTemplate?:string){
        this.errorDetails = {
            path : errorContext? errorContext.path : '',
            expected: Any,
            actual:this.value
        };
        // TODO: search for _type annotation and create match with global type registry
    }
    wrap(){
        return this.match.wrap(this.value, this.type, this.errorContext, this.errorTemplate, this.errorDetails);
    }
    byReference(provider:() => any, path:Array<string|number>){
        let match, type;
        if (isNonPrimitiveType(this.type)) {
            return this.match.byReference(provider, path, this.value, this.type, this.errorContext, this.errorTemplate, this.errorDetails);
        } else {
            return this.value;
        }
    }
    tryTypes(...newTypes:Type<any, any>[]) {
        for (let i=0; i < newTypes.length && !this.match.best; ++i){
            this.tryType(newTypes[i]);
        }
        return this;
    }
    tryType(newType:Type<any, any>){
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

interface MatchType{
    wrap<T>(itemValue:any, type:Type<T, any>, errorContext?:ErrorContext, errorTemplate?:string, errorDetails?:ErrorDetails):T;
    byReference<T extends Mutable<any>>(provider:() => any, path:Array<string|number>, itemValue:any, type:NonPrimitiveType<T, any>, errorContext?:ErrorContext, errorTemplate?:string, errorDetails?:ErrorDetails):T;
    worseThan(o:MatchType):boolean;
    best?:boolean
}
/**
 * each match type knows how to wrap input value,
 * can tell if it's better than another match type,
 * and can also tell if it's the best possible match for a given input
 */
const matchTypes = {
    PERFECT : {
        wrap: (itemValue:any) => itemValue,
        byReference<T>(provider:() => any, path:Array<string|number>, itemValue:any){
            return itemValue
        },
        worseThan: (o:MatchType) => false,
        best:true
    },
    NATIVE_JS_VALUE : {
        wrap<T>(itemValue:any, type:Type<T, any>, errorContext:ErrorContext){
            return type.create(itemValue, undefined, errorContext);
        },
        byReference<T extends Mutable<any>>(provider:() => any, path:Array<string|number>, itemValue:any, type:NonPrimitiveType<T, any>){
            return type.byReference(provider, path);
        },
        worseThan: (o:MatchType) => o === matchTypes.PERFECT
    },
    MISMATCH: {
        wrap<T>(itemValue:any, type:Type<T, any>, errorContext:ErrorContext, errorTemplate?:string, errorDetails?:ErrorDetails){
            let errorPath = null;
            if (errorDetails){
                itemValue = errorDetails.actual;
                type = errorDetails.expected;
                errorPath = errorDetails.path;
            }
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, type, itemValue, errorPath, errorTemplate));
            return type.create();
        },
        byReference<T extends Mutable<any>>(provider:() => any, path:Array<string|number>, itemValue:any, type:NonPrimitiveType<T, any>, errorContext:ErrorContext, errorTemplate:string = 'reference', errorDetails?:ErrorDetails){
            let errorPath = null;
            if (errorDetails){
                itemValue = errorDetails.actual;
                type = errorDetails.expected;
                errorPath = errorDetails.path;
            }
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, type, itemValue, errorPath, errorTemplate));
            return type.create();
        },
        worseThan: (o:MatchType) => true
    }
};

function matchValueToType<T, S>(itemValue:any, type:Type<T, S>, errorDetails?:ErrorDetails):MatchType{
    if (itemValue === null && type.isNullable()) {
        return matchTypes.PERFECT;
    } else if (itemValue === null) {
        return matchTypes.MISMATCH;
    } else if (type.validateType(itemValue)) { //todo if ancestor it's not perfect
        return matchTypes.PERFECT;
    } else if (type.allowPlainVal(itemValue, errorDetails)){
        return matchTypes.NATIVE_JS_VALUE;
    } else {
        return matchTypes.MISMATCH
    }
}
