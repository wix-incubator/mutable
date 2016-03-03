import _               from 'lodash';
import config          from './typoramaConfiguration';
import {makeDirtyable,
	optionalSetManager} from './lifecycle';
import PrimitiveBase   from './PrimitiveBase';
import {getFieldDef,getReadableValueTypeName}   from './utils';
import {
	validateAndWrap,
	isAssignableFrom,
	validateNullValue,
	validateValue,
	isDataMatching}    from "./validation";

import {getMailBox}    from 'escalate';

const MAILBOX = getMailBox('Typorama.BaseType');

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

    static create(value, options, errorContext) {
        return new this(value, options, errorContext);
    }

	static defaults(circularFlags='') {
        const spec = this._spec;
		const circularFlagsNextLevel = (circularFlags ? circularFlags : ';') + this.uniqueId + ';';
        //var args = arguments;
		const isCircular = ~circularFlags.indexOf(';' + this.uniqueId + ';');
		if(isCircular) {
			if(!this.options || !this.options.nullable) {
				console.warn('DEFAULT CYRCULAR DATA! resolving value as null - please add better error/warning'); // ToDo: add a proper warning through escalate
			}
			return null;
		} else {
			return Object.keys(this._spec).reduce(function (val, key) {
					var fieldSpec = spec[key];
					val[key] = fieldSpec.defaults.call(fieldSpec, circularFlagsNextLevel);
				return val;
			}, {});
		}
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


	static reportFieldDefinitionError(fieldDef,template){
		if (!fieldDef || !fieldDef.type || !(fieldDef.type.prototype instanceof PrimitiveBase)) {
			return {message:`must be a primitive type or extend core3.Type`,path:""};
		}
		return fieldDef.type.reportDefinitionErrors(fieldDef.options);
	}

	static reportSetValueErrors(value,options){
		return PrimitiveBase.reportSetValueErrors.apply(this, arguments);
	}

	static reportSetErrors(value,options){
		return PrimitiveBase.reportSetValueErrors.apply(this, arguments);
	}

	static createErrorContext(entryPoint,level){
		return {
			level,
			entryPoint,
			path:this.id
		}
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

	/**
	 * @param value any value
	 * @returns {*} true if value is a legal value for this type, falsy otherwise
	 */
    static validateType(value) {
        return validateValue(this, value);
    }


    static wrapValue(value, spec, options, errorContext){
        var root = {};

		_.each(spec, (fieldSpec, key)=>{
			var fieldVal = value[key];

            if(fieldVal === undefined){
                fieldVal = spec[key].defaults();
            }
            var newField = validateAndWrap(fieldVal, fieldSpec, undefined, {level:errorContext.level,entryPoint:errorContext.entryPoint,path:errorContext.path+'.'+key});
			root[key] = newField;

		});
		return root;
    }

	static __reportMisMatch__

    constructor(value, options=null, errorContext=null){
        super(value);

		errorContext = errorContext || this.constructor.createErrorContext('Type constructor error','error');

		this.__isReadOnly__ = false;
		this.__readOnlyInstance__ = createReadOnly(this);
		this.__readWriteInstance__ = this;
		this.__options__ = options;

		this.__value__ = this.constructor.wrapValue(
            (value === undefined) ? this.constructor.defaults() : value,
            this.constructor._spec,
            options,
			errorContext
        );
		if(config.freezeInstance) {
			Object.freeze(this);
		}
    }


    // merge native javascript data into the object
    // this method traverses the input recursively until it reaches typorama values (then it sets them)
    setValue(newValue,errorContext = null){
        if (this.$isDirtyable()) {
            var changed = false;
			errorContext = errorContext || this.constructor.createErrorContext('SetValue error','error');
            _.forEach(newValue, (fieldValue, fieldName) => {
                var fieldSpec = getFieldDef(this.constructor, fieldName);
                if (fieldSpec) {
                    var newVal = validateAndWrap(fieldValue, fieldSpec, this.__lifecycleManager__,
						{
							level:errorContext.level,entryPoint:
							errorContext.entryPoint,path:
							errorContext.path+'.'+fieldName
						});
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
	// merge native javascript data into the object
	// this method traverses the input recursively until it reaches typorama values (then it sets them)
	mergeValue(newValue, errorContext = null){
		if (this.$isDirtyable()) {
			var changed = false;
			errorContext = errorContext || this.constructor.createErrorContext('MergeValue error','error');
			_.forEach(newValue, (fieldValue, fieldName) => {
				var fieldSpec = getFieldDef(this.constructor, fieldName);
				if (fieldSpec) {
					if (this.__value__[fieldName].mergeValue && !BaseType.validateType(fieldValue)) {
						// recursion call
						changed = this.__value__[fieldName].mergeValue(fieldValue, errorContext) || changed;
					} else {
						// end recursion, assign value (if applicable)
						changed = this.$assignField(fieldName, fieldValue) || changed;
					}
				}
			});
			if(changed)
			{
				this.$setDirty(true);
			}
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
		if(this.__id__!==undefined){
			return this.__id__;
		}
		if(this.__isReadOnly__){
			return this.__readWriteInstance__.getRuntimeId();
		}else{
			this.__id__ = generateId();
			return this.__id__;
		}
	}
	matches(other){
		return isDataMatching(this, other);
	}
}

BaseType._spec = Object.freeze(Object.create(null));

BaseType.ancestors = [];
BaseType.id        = 'BaseType';
BaseType.type      = BaseType;

makeDirtyable(BaseType);
