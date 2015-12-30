import _               from 'lodash';
import config          from './typoramaConfiguration';
import {makeDirtyable} from './lifecycle';
import PrimitiveBase   from './PrimitiveBase';
import {getFieldDef,getReadableValueTypeName,whenDebugMode}   from './utils';
import {
	validateAndWrap,
	optionalSetManager,
	isAssignableFrom,
	validateNullValue} from "./validation";

import {getMailBox}    from 'gopostal';

const MAILBOX = getMailBox('Typorama.BaseType');
const ERROR = {};

function createReadOnly(source){
    var readOnlyInstance = Object.create(source);
    readOnlyInstance.__isReadOnly__ = true;
	if(config.freezeInstance) {
		Object.freeze(readOnlyInstance);
	}
    return readOnlyInstance;
}

var dataCounter=0;
function generateId(){
	return dataCounter++;
}

export default class BaseType extends PrimitiveBase {

    static create(value, options) {
        return new this(value, options);
    }

	static defaults() {
        var spec = this._spec;
        var args = arguments;
        return Object.keys(this._spec).reduce(function (val, key) {
            var fieldSpec = spec[key];
            val[key] = fieldSpec.defaults.apply(fieldSpec, args);
            return val;
        }, {});
    }

	static cloneValue(value){
		if(!_.isPlainObject(value)) { return {}; }

		return _.reduce(this._spec, (cloneObj, fieldSpec, fieldId) => {
			if(fieldSpec.allowPlainVal(value[fieldId])){
				cloneObj[fieldId] = value[fieldId];
			}
			return cloneObj;
		}, {});
	}

	static reportFieldError(fieldDef,value){
		if (fieldDef && fieldDef.type && fieldDef.type.prototype instanceof PrimitiveBase) {
			return fieldDef.type.reportDefinitionErrors(value || fieldDef.defaults(), fieldDef.options);
		} else {
			return {path: '', message: `must be a primitive type or extend core3.Type`}
		}
	}
	static reportDefinitionErrors(){
		return PrimitiveBase.reportDefinitionErrors.apply(this, arguments);
	}
	static reportSetValueErrors(value,options){
		return PrimitiveBase.reportSetValueErrors.apply(this, arguments);
	}

	static reportSetErrors(value,options){
		return PrimitiveBase.reportSetValueErrors.apply(this, arguments);
	}
	static validate(val) {
        return Object.keys(this._spec).every(function(key) {
            return this._spec[key].validate(val[key])
        }, this);
    }

    static allowPlainVal(val){
        return _.isPlainObject(val) && (!val._type || val._type === this.id) || validateNullValue(this, val);
    }

	static withDefault(){
		return PrimitiveBase.withDefault.apply(this, arguments);
	}


    static validateType(value) {
        return validateNullValue(this, value) ||
            ( value && value.constructor && isAssignableFrom(this, value.constructor.type));
    }

    static wrapValue(value, spec, options){
        var root = {};

		_.each(spec, (fieldSpec, key)=>{
			var fieldVal = value[key];
			whenDebugMode(()=>{
				var fieldError = fieldSpec.type.reportSetErrors(fieldVal,fieldSpec.options);
				if(fieldError){
					var fullPath = fieldError.path ? `${this.id}.${key}.${fieldError.path}` : `${this.id}.${key}`;

					MAILBOX.error(`Type constructor error: "${fullPath}" ${fieldError.message}`);
				}
			});
            if(fieldVal === undefined){
                fieldVal = spec[key].defaults();
            }
            var newField = validateAndWrap(fieldVal, fieldSpec, undefined, ERROR);
			root[key] = newField;

		});
		return root;
    }

    constructor(value, options=null){
        super(value);
        this.__isReadOnly__ = false;
        this.__readOnlyInstance__ = createReadOnly(this);
        this.__readWriteInstance__ = this;
        this.__options__ = options;
        this.__value__ = this.constructor.wrapValue(
            (value === undefined) ? this.constructor.defaults() : value,
            this.constructor._spec,
            options
        );
		if(config.freezeInstance) {
			Object.freeze(this);
		}
    }


    // merge native javascript data into the object
    // this method traverses the input recursively until it reaches typorama values (then it sets them)
    setValue(newValue){

        if (this.$isDirtyable()) {
            var changed = false;
            _.forEach(newValue, (fieldValue, fieldName) => {
                var fieldSpec = getFieldDef(this.constructor, fieldName);
                if (fieldSpec) {
					whenDebugMode(()=>{
						var fieldError = fieldSpec.type.reportSetValueErrors(fieldValue,fieldSpec.options);
						if(fieldError){
							MAILBOX.error(`SetValue error: "${this.constructor.id}.${fieldName}" ${fieldError.message}`);
						}
					});
                    var newVal = validateAndWrap(fieldValue, fieldSpec, this.__lifecycleManager__, ERROR);
                    if(this.__value__[fieldName] !== newVal){
                        changed = true;
                        this.__value__[fieldName] = newVal;
                    }
                }
            });
			changed && this.$setDirty();
            return changed;
        }
    }

    // validates and assigns input to field.
    // will report error for undefined fields
    // returns whether the field value has changed
    $assignField(fieldName, newValue){
        // don't assign if input is the same as existing value
        if (this.__value__[fieldName] !== newValue){
            var fieldDef = getFieldDef(this.constructor, fieldName);
            var typedField = isAssignableFrom(BaseType, fieldDef.type);
            // for typed field, validate the type of the value. for untyped field (primitive), just validate the data itself
            if ((typedField && fieldDef.validateType(newValue)) || (!typedField && fieldDef.validate(newValue))){
                // validation passed set the value
				this.__value__[fieldName] = newValue;
				optionalSetManager(newValue, this.__lifecycleManager__);
                return true;
            } else {
				const passedType = getReadableValueTypeName(newValue);
                MAILBOX.error(`Set error: "${this.constructor.id}.${fieldName}" expected type ${fieldDef.type.id} but got ${passedType}`);
            }
        }
        return false;
    }

    $isReadOnly(){
        return this.__isReadOnly__;
    }

    $asReadOnly(){
        return this.__readOnlyInstance__;
    }

	$asReadWrite(){
		return this.__readWriteInstance__;
	}

    toJSON(recursive = true){
        return Object.keys(this.constructor._spec).reduce((json, key) => {
            var fieldValue = this.__value__[key];
            json[key] = recursive && fieldValue && fieldValue.toJSON ? fieldValue.toJSON(true) : fieldValue;
            return json;
        }, {});
    }
	getRuntimeId(){
		this.___id___ = this.___id___ || generateId();
		return this.___id___;
	}
}



BaseType._spec = Object.freeze(Object.create(null));

BaseType.ancestors = [];
BaseType.id        = 'BaseType';
BaseType.type      = BaseType;

makeDirtyable(BaseType);
