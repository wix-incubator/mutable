import _ from 'lodash'
import BaseType from './BaseType'
import PrimitiveBase from './PrimitiveBase'
import * as gopostal from './gopostal';

const MAILBOX = gopostal.getMailBox('Typorama.define');

export function generateValidate() { // ToDo: check if its better jit-wise to move the spec to the closure: generateValidateForSpec(spec)
    return function(val) {
        return Object.keys(this._spec).every(function(key) {
            return this._spec[key].validate(val[key])
        }, this);
    };
}

export function generateFieldsOn(obj, fieldsDefinition) {
    _.forEach(fieldsDefinition, function(fieldDef, fieldName) {
        if(obj[fieldName]) {
            MAILBOX.error(`Field error on type:${obj.constructor.id}.${fieldName} is reserved.`);
        } else if(!(fieldDef.type && fieldDef.type.prototype instanceof PrimitiveBase)) {
            MAILBOX.error(`Type mismatch: ${fieldName} must inherit PrimitiveBase data type.`);
        }

        Object.defineProperty(obj, fieldName, {
            get: function() {
                if (!BaseType.isAssignableFrom(fieldDef.type) || this.$isDirtyable()) {
                    return this.__value__[fieldName];
                } else {
                    return this.__value__[fieldName].$asReadOnly();
                }
            },
            set: function(newValue) {
                if (this.$isDirtyable()) {
                    if(this.$validateAndAssignField(fieldName, newValue)) {
                        this.$setDirty();
                    }
                } else {
                    // todo:warn hook
                    console.warn(`Attemt to override readonly value ${JSON.stringify(this.__value__[fieldName])} at ${this.constructor.id}.${fieldName} with ${JSON.stringify(newValue)}`);
                }
            },
            enumerable:true,
            configurable:false
        });
    });
}

export function validateNullValue(Type, value) {
    if(value === null) {
        if(!(Type.options && Type.options.nullable)) {
            MAILBOX.error('Cannot assign null value to a type which is not defined as nullable.');
        } else {
            return true;
        }
    } else {
        return false;
    }
}