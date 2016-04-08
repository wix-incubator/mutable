import * as _ from 'lodash';
import {getMailBox} from 'escalate';
import {cloneType, getReadableValueTypeName} from './utils';
import {validateNullValue} from './validation';

const MAILBOX = getMailBox('Typorama.PrimitiveBase');

function reportErrorInternal(value, allowPlain, allowInstance) {
    if (value !== undefined && (!allowPlain || !this.allowPlainVal(value)) && (!allowInstance || !this.validateType(value))) {
        return { message: `expected type ${this.id} but got ${getReadableValueTypeName(value)}`, path: '' };
    }
}

export default class PrimitiveBase {
    static create() { }
    static defaults() { }
    static validate(value) { }
    static allowPlainVal(val) { return validateNullValue(this, val); }
    static validateType() { }

    static nullable() {
        var NullableType = cloneType(this);
        NullableType.options.nullable = true;
        return NullableType;
    }
    static cloneValue(value) {
        return value;
    }
    static withDefault(defaults, validate, options) {
        var NewType = cloneType(this);
        if (validate) {
            NewType.validate = validate;
        }
        if (options) {
            NewType.options = options;
        }

        if (defaults !== undefined) {
            NewType.defaults = () => defaults;
            if (defaults === null) {
                NewType.defaults = () => null;
            } else if (_.isFunction(defaults)) {
                NewType.defaults = () => defaults;
            } else {
                NewType.defaults = () => NewType.cloneValue(defaults);
            }
        }
        return NewType;
    }
    static reportDefinitionErrors() {
        return null;
    }
    static reportSetValueErrors(value) {
        return reportErrorInternal.call(this, value, true, true);
    }

    static reportSetErrors(value) {
        return reportErrorInternal.call(this, value, false, true);
    }
}
