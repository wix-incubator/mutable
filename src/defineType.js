import _ from "lodash"
import BaseType from "./BaseType"
import PrimitiveBase from './PrimitiveBase'
import * as gopostal from 'gopostal';

const MAILBOX = gopostal.getMailBox('Typorama.define');

/*
 * Called to generate a default value resolver for custom types. The default value resolver is called upon constructing an instance
 * to populate undefined fields
 */
function generateDefaultValueResolver(){
    return function() {
        var spec = this._spec;
        var args = arguments;
        return Object.keys(this._spec).reduce(function (val, key) {
            var fieldSpec = spec[key];
            val[key] = fieldSpec.defaults.apply(fieldSpec, args);
            return val;
        }, {});
    }
}

export default function(id, typeDefinition, TypeConstructor){

    TypeConstructor = TypeConstructor || function Type(value, options){
        BaseType.call(this, value, options);
    };
    TypeConstructor.id                    = id;
    TypeConstructor.type                  = TypeConstructor;
    TypeConstructor.validate              = TypeConstructor.validate || generateValidate();
    TypeConstructor.validateType          = TypeConstructor.validateType || BaseType.validateType;
    TypeConstructor.allowPlainVal         = TypeConstructor.allowPlainVal || BaseType.allowPlainVal;
    TypeConstructor.withDefault           = TypeConstructor.withDefault || PrimitiveBase.withDefault;
    TypeConstructor.defaults              = TypeConstructor.defaults || generateDefaultValueResolver();
    TypeConstructor.nullable              = PrimitiveBase.nullable;
    TypeConstructor._validateAndWrap      = BaseType._validateAndWrap;
    TypeConstructor.create                = BaseType.create;

    var superTypeConstructor = TypeConstructor.prototype.__proto__.constructor;

    if(BaseType.isAssignableFrom(superTypeConstructor.type)){
        TypeConstructor.ancestors             = superTypeConstructor.ancestors.concat([superTypeConstructor.id]);
    } else {
        TypeConstructor.prototype             = Object.create(BaseType.prototype);
        TypeConstructor.prototype.constructor = TypeConstructor;
        TypeConstructor.ancestors             = [BaseType.id];
    }

    TypeConstructor.getFieldsSpec         = typeDefinition.spec.bind(null, TypeConstructor);
    TypeConstructor._spec                 = typeDefinition.spec(TypeConstructor);
	TypeConstructor._complex              = getComplexFields(TypeConstructor._spec);
    TypeConstructor.wrapValue             = TypeConstructor.wrapValue || BaseType.wrapValue;

    generateFieldsOn(TypeConstructor.prototype, TypeConstructor._spec);

    return TypeConstructor;
};

function getComplexFields(spec){
	var complex = [];
	for(var k in spec){
		if(spec[k] && spec[k]._spec){
			complex[complex.length] = k;
		}		
	}
	return complex;
}

function generateValidate() { // ToDo: check if its better jit-wise to move the spec to the closure: generateValidateForSpec(spec)
    return function(val) {
        return Object.keys(this._spec).every(function(key) {
            return this._spec[key].validate(val[key])
        }, this);
    };
}

function generateFieldsOn(obj, fieldsDefinition) {
    _.forEach(fieldsDefinition, function(fieldDef, fieldName) {
        if(obj[fieldName]) {
            MAILBOX.error(`Field error on type:${obj.constructor.id}.${fieldName} is reserved.`);
        } else if(!(fieldDef.type && fieldDef.type.prototype instanceof PrimitiveBase)) {
            MAILBOX.error(`Type mismatch: ${fieldName} must inherit PrimitiveBase data type.`);
        }

        Object.defineProperty(obj, fieldName, {
            get: function() {
		var value = this.__value__[fieldName];
                if (!BaseType.isAssignableFrom(fieldDef.type) || this.$isDirtyable() || value === null || value === undefined) {
                    return value;
                } else {
                    return value.$asReadOnly();
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


