import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import {MuObject} from './object';
import {defineNonPrimitive} from '../core/base';
import {validateNullValue} from '../core/validation';
import {ErrorDetails, DeepPartial, ClassOptions, ErrorContext} from "../types";
import {Spec} from "./types";

const MAILBOX = getMailBox('mutable.Reference');

export default class Reference<T> extends MuObject<T> {

// allow any object as long as it adhers to the entire schema
    static allowPlainVal(value:any, errorDetails?:ErrorDetails):boolean {
        if (validateNullValue(this, value)){
            return true;
        } else {
			const result = _.isObject(value)
                && Object.keys(this._spec).every(key => {
                    let fieldErrorDetails = errorDetails && _.defaults({path: `${errorDetails.path}.${key}`}, errorDetails);
                    return this._spec[key].validateType(value[key]) || this._spec[key].allowPlainVal(value[key], fieldErrorDetails)
                });
            return result;
        }
    }

    static wrapValue<T>(refVal:DeepPartial<T>, spec:Spec, options?:ClassOptions, errorContext?:ErrorContext):T|{} {
        var isValid = Object.keys(spec).every((key:keyof T) => {
            if (refVal[key] === undefined) {
                MAILBOX.error(`${this.id} cannot accept value with missing field "${key}"`);
                return false;
            } else if (!spec[key].validateType(refVal[key])) {
                MAILBOX.error(`${this.id} field "${key}" cannot accept value with mismatched type`);
                return false;
            }
            return true;
        });
        return isValid ? refVal : {};
    }

    static cloneValue<T>(value:T):T { return value; }
}

defineNonPrimitive('Reference', Reference);
