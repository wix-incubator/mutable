import _                  from "lodash";
import BaseType           from "./BaseType";
import {whenDebugMode}           from "./utils";
import PrimitiveBase      from './PrimitiveBase';
import {isAssignableFrom,validateNullValue,reportNullError,reportMisMatchError} from "./validation"
import {getMailBox}       from 'gopostal';

const MAILBOX = getMailBox('Typorama.define');



function defineType(id, typeDefinition, ParentType, TypeConstructor){
	ParentType = ParentType || BaseType;
	var Type = TypeConstructor || function Type(value, options,eventContext){
			ParentType.call(this, value, options, eventContext);
		};

    Type.validate      = Type.validate      || ParentType.validate;
    Type.validateType  = Type.validateType  || ParentType.validateType;
    Type.allowPlainVal = Type.allowPlainVal || ParentType.allowPlainVal;
    Type.defaults      = Type.defaults      || ParentType.defaults;
    Type.withDefault   = Type.withDefault   || ParentType.withDefault;
    Type.createErrorContext   = Type.createErrorContext   || ParentType.createErrorContext;
    Type.reportDefinitionErrors   = Type.reportDefinitionErrors   || ParentType.reportDefinitionErrors;
    Type.reportSetValueErrors   = Type.reportSetValueErrors   || ParentType.reportSetValueErrors;
    Type.reportSetErrors   = Type.reportSetErrors   || ParentType.reportSetErrors;
    Type.nullable      = Type.nullable      || ParentType.nullable;
    Type.create        = Type.create        || ParentType.create;
	Type.wrapValue     = Type.wrapValue     || ParentType.wrapValue;
	Type.cloneValue    = Type.cloneValue    || ParentType.cloneValue;

	var superTypeConstructor = Object.getPrototypeOf(Type.prototype).constructor;

	if(isAssignableFrom(ParentType, superTypeConstructor.type)){
		Type.ancestors             = superTypeConstructor.ancestors.concat([superTypeConstructor.id]);
	} else {
		Type.prototype             = Object.create(ParentType.prototype);
		Type.prototype.constructor = Type;
		Type.ancestors             = ParentType.id === 'BaseType' ? [ParentType.id] : ParentType.ancestors.slice();
	}

	Type.id                                        = id;
	Type.type                                      = Type;
	Type.getFieldsSpec                             = typeDefinition.spec.bind(null, Type);
	Type._spec                                     = typeDefinition.spec(Type);
	Type.prototype.$dirtyableElementsIterator      = Type.prototype.$dirtyableElementsIterator || getDirtyableElementsIterator(Type._spec);

	generateFieldsOn(Type.prototype, Type._spec);

	return Type;
};

defineType.oldImpl = function(id, typeDefinition, TypeConstructor){
	return defineType(id, typeDefinition, undefined, TypeConstructor);
};

export default defineType;


function getDirtyableElementsIterator(spec){
	var complex = [];
	for(var k in spec){
		if(spec[k] && spec[k]._spec) {
			complex[complex.length] = k;
		}
	}
	return function typeDirtyableElementsIterator(yielder){
		for(let c of complex){
			let k = this.__value__[c];
			if (k){
				yielder(this, k);
			}
		}
	}
}

function generateFieldsOn(obj, fieldsDefinition) {
	_.forEach(fieldsDefinition, function(fieldDef, fieldName) {
		whenDebugMode(function(){
			var error;
			var errorContext = BaseType.createErrorContext(`Type definition error`,'fatal');
			var path = `${obj.constructor.id}.${fieldName}`;
			if(obj[fieldName]) {
				error = `is a reserved field.`;
			}else{
				var err = BaseType.reportFieldDefinitionError(fieldDef);
				if(err){

					error  = err.message;
					if(err.path){
						path = path +err.path
					}
				}
			}

			if(error){
				MAILBOX.fatal(`Type definition error: "${path}" ${error}`);
				return;
			}
			error = fieldDef.type.reportSetValueErrors(fieldDef.defaults(),fieldDef.options);
			if(error){
				reportMisMatchError(errorContext,fieldDef,fieldDef.defaults(),path);
			}
		});

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


