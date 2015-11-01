import _                  from "lodash";
import BaseType           from "./BaseType";
import PrimitiveBase      from './PrimitiveBase';
import {isAssignableFrom} from "./validation"
import {getMailBox}       from 'gopostal';

const MAILBOX = getMailBox('Typorama.define');

export default function(id, typeDefinition, TypeConstructor){

    var Type = TypeConstructor || function Type(value, options){
        BaseType.call(this, value, options);
    };
		
    Type.validate      = Type.validate      || BaseType.validate;
    Type.validateType  = Type.validateType  || BaseType.validateType;
    Type.allowPlainVal = Type.allowPlainVal || BaseType.allowPlainVal;
    Type.defaults      = Type.defaults      || BaseType.defaults;
    Type.withDefault   = Type.withDefault   || BaseType.withDefault;
    Type.nullable      = Type.nullable      || BaseType.nullable;
    Type.create        = Type.create        || BaseType.create;
	Type.wrapValue     = Type.wrapValue     || BaseType.wrapValue;
    
    var superTypeConstructor = Object.getPrototypeOf(Type.prototype).constructor;
	
    if(isAssignableFrom(BaseType, superTypeConstructor.type)){
        Type.ancestors             = superTypeConstructor.ancestors.concat([superTypeConstructor.id]);
    } else {
        Type.prototype             = Object.create(BaseType.prototype);
        Type.prototype.constructor = Type;
        Type.ancestors             = [BaseType.id];
    }

	Type.id            = id;
    Type.type          = Type;
    Type.getFieldsSpec = typeDefinition.spec.bind(null, Type);
    Type._spec         = typeDefinition.spec(Type);
	Type._complex      = getComplexFields(Type._spec);
    

    generateFieldsOn(Type.prototype, Type._spec);

    return Type;
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
                if (!isAssignableFrom(BaseType, fieldDef.type) || this.$isDirtyable() || value === null || value === undefined) {
                    return value;
                } else {
                    return value.$asReadOnly();
                }
            },
            set: function(newValue) {
                if (this.$isDirtyable()) {
                    if(this.$assignField(fieldName, newValue)) {
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


