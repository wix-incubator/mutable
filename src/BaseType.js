import _               from 'lodash';
import config          from './typoramaConfiguration';
import {makeDirtyable} from './lifecycle';
import PrimitiveBase   from './PrimitiveBase';
import {getFieldDef}   from './utils';
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
		_.each(spec, function(fieldSpec, key){
			var fieldVal = value[key];
            if(fieldVal === undefined){
                fieldVal = spec[key].defaults();
            }
            var newField = validateAndWrap(fieldVal, fieldSpec, undefined, ERROR);
			if(newField === ERROR) {
                MAILBOX.error("Invalid value for key " + key + " of type " + fieldSpec.name + ": '" + fieldVal + "'.");
			} else {
                root[key] = newField;
            }
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
                    var newVal = validateAndWrap(fieldValue, fieldSpec, this.__lifecycleManager__, ERROR);
                    if(newVal === ERROR) {
						var valueType = fieldValue === null ? 'null' : fieldValue.constructor.name;
                        MAILBOX.error(`Invalid value for type ${fieldSpec.name}: '${valueType}'.`);
                    }
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
                MAILBOX.error(`Invalid value for key ${fieldName} of type ${fieldDef.type.id}: '${newValue && newValue.constructor.name}'.`);
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
