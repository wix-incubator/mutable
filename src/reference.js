import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import {BaseClass} from './base-class';
import defineType from './define-type';
import {validateNullValue} from './validation';

const MAILBOX = getMailBox('Mutable.Reference');

class _Reference extends BaseClass {

// allow any object as long as it adhers to the entire schema
    static allowPlainVal(value, errorDetails = null) {
        if (validateNullValue(this, value)){
            return true;
        } else {
			var result = _.isObject(value)
                && Object.keys(this._spec).every(key => {
                    let fieldErrorDetails = errorDetails && _.defaults({path: `${errorDetails.path}.${key}`}, errorDetails);
                    return this._spec[key].validateType(value[key]) || this._spec[key].allowPlainVal(value[key], fieldErrorDetails)
                });
            return result;
        }
    }

    static wrapValue(refVal, options = {}) {
        var isValid = Object.keys(this._spec).every(key => {
            if (refVal[key] === undefined) {
                MAILBOX.error(`${this.id} cannot accept value with missing field "${key}"`);
                return false;
            } else if (!this._spec[key].validateType(refVal[key])) {
                MAILBOX.error(`${this.id} field "${key}" cannot accept value with mismatched type`);
                return false;
            }
            return true;
        });
        return isValid ? refVal : {};
    }

    static cloneValue(value) { return value; }
}

export default defineType('Reference', {
    spec: function(Reference) {
        return {};
    }
}, null, _Reference);
