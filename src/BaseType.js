import config from './typoramaConfiguration'
import _ from "lodash"
import {validateAndWrap, optionalSetManager} from "./validation"
import {makeDirtyable} from "./lifecycle"
import PrimitiveBase from "./PrimitiveBase"
import {getMailBox} from 'gopostal';

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

export default class BaseType extends PrimitiveBase {
	
	static withDefault(){
		return PrimitiveBase.withDefault.apply(this, arguments);
	}
	
    static create(value, options) {
        return new this(value, options);
    }

    static isAssignableFrom(type) {
        return type && (type.id === this.type.id || (type.ancestors && _.contains(type.ancestors, this.type.id)));
    }

	static validate(val) {
        return Object.keys(this._spec).every(function(key) {
            return this._spec[key].validate(val[key])
        }, this);
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
	
    static validateType(value) {
        return PrimitiveBase.validateNullValue(this, value) ||
            ( value && value.constructor && BaseType.isAssignableFrom.call(this, value.constructor.type));
    }

    static allowPlainVal(val){
        return _.isPlainObject(val) && (!val._type || val._type === this.id)
    }
   
    static getValueTypeName(value){
        if(value.constructor && value.constructor.id){
            return value.constructor.id
        }
        if(_.isPlainObject(value) && value._type){
                return value._type
        }
        return typeof value;
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

    constructor(value, options = {}){
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
                var fieldSpec = this.$getFieldDef(fieldName);
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

    $getFieldDef(fieldName){
        return this.constructor._spec[fieldName];
    }

    // validates and assigns input to field.
    // will report error for undefined fields
    // returns whether the field value has changed
    $validateAndAssignField(fieldName, newValue){
        // don't assign if input is the same as existing value
        if (this.__value__[fieldName] !== newValue){
            var fieldDef = this.$getFieldDef(fieldName);
            var typedField = BaseType.isAssignableFrom(fieldDef.type);
            // for typed field, validate the type of the value. for untyped field (primitive), just validate the data itself
            if ((typedField && fieldDef.validateType(newValue)) || (!typedField && fieldDef.validate(newValue))){
                // validation passed
                this.$assignField(fieldName, newValue);
                return true;
            } else {
                MAILBOX.error(`Invalid value for key ${fieldName} of type ${fieldDef.type.id}: '${newValue && newValue.constructor.name}'.`);
            }
        }
        return false;
    }

    $assignField(fieldName, newValue) {
        this.__value__[fieldName] = newValue;
        this.$optionalSetManager(newValue, this.__lifecycleManager__);
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
}



BaseType._spec = Object.freeze(Object.create(null));

BaseType.ancestors = [];
BaseType.id        = 'BaseType';
BaseType.type      = BaseType;

makeDirtyable(BaseType);
