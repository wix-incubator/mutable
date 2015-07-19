import _ from 'lodash'
import BaseType from './BaseType'
import PrimitiveBase from './PrimitiveBase'

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
            throw new Error(`Field error on type:${obj.constructor.id}.${fieldName} is reserved.`);
        } else if(!(fieldDef.type.prototype instanceof PrimitiveBase)) {
            throw new Error(`Type mismatch: ${fieldName} must inherit PrimitiveBase data type.`);
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
    return (value === null && Type.options && Type.options.nullable);
}