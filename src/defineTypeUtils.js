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

export function generateWithDefault() {
    return function withDefault(defaults, validate, options) {
        options = options || this.options;
        var def = defaults === undefined ? this.defaults : function() { return _.clone(defaults, true); };

        function typeWithDefault(value, options) {
            return new typeWithDefault.type(value, typeWithDefault.options || options);
        }

        typeWithDefault.type             = this.type || this;
        typeWithDefault.validate         = validate || this.validate;
        typeWithDefault.validateType     = this.validateType;
        typeWithDefault.allowPlainVal    = this.allowPlainVal;
        typeWithDefault.isAssignableFrom = this.isAssignableFrom;
        typeWithDefault.withDefault      = withDefault;//.bind(this);
        typeWithDefault.defaults         = def;
        typeWithDefault.options          = options;
        typeWithDefault.wrapValue        = this.wrapValue;
        typeWithDefault.create           = this.create;
        return typeWithDefault;
    }
}

export function generateWithDefaultForSysImmutable(Type){
    return function withDefault(defaults, validate){

        var def = defaults ? function(){ return defaults; } : this.defaults;

        function typeWithDefault(value){
            return Type(value);
        }
        typeWithDefault.type = this.type;
        typeWithDefault.validate = validate || this.validate;
        typeWithDefault.validateType = this.validateType;
        typeWithDefault.isAssignableFrom = this.isAssignableFrom;
        typeWithDefault.allowPlainVal = this.allowPlainVal;
        typeWithDefault.withDefault = this.withDefault;//.bind(this);
        typeWithDefault.defaults = def;
        typeWithDefault.wrapValue = Type;
        typeWithDefault.create = this.create;
        return typeWithDefault;
    }
}





