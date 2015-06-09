import _ from "lodash"
import {makeDirtyable} from "./lifecycle"
import PrimitiveBase from "./PrimitiveBase"

function createReadOnly(source){
    var readOnlyInstance = Object.create(source);
    readOnlyInstance.__isReadOnly__ = true;
    return readOnlyInstance;
}

export default class BaseType extends PrimitiveBase{

    static create(value, options){
        return new this(value, options);
    }

    static isAssignableFrom(type){
        return type && (type.id === this.type.id || (type.ancestors &&_.contains(type.ancestors, this.type.id)));
    }

    static validateType(value){ return value && value.constructor && BaseType.isAssignableFrom.call(this, value.constructor.type); }

    static allowPlainVal(val){
        return _.isPlainObject(val) && (!val._type || val._type===this.id)
    }

    static _wrapOrNull(itemValue, type,  lifeCycle){
        if(type.validateType(itemValue)){
            if (itemValue.$setManager && _.isFunction(itemValue.$setManager)) {
                itemValue.$setManager(lifeCycle);
            }
            return itemValue;
        }else if(type.type.allowPlainVal(itemValue)){
            var newItem = type.create(itemValue);
			if (newItem.$setManager && _.isFunction(newItem.$setManager)) {
            	newItem.$setManager(lifeCycle);
			}
            return newItem;
        }
        return null;
    }

    static wrapValue(value, spec, options){
        var root = {};
        Object.keys(spec).forEach((key) => {
            var fieldSpec = spec[key];
            var fieldVal = value[key];
            if(fieldVal===undefined)
            {
                fieldVal = spec[key].defaults();
            }
            var newField = this._wrapOrNull(fieldVal,fieldSpec);
            if(newField===null)
            {
                throw new Error('field :'+key+' incompatible');
            }
            root[key] = newField;
        });
        return root;
    }

    constructor(value, options = {}){
        super(value);
        this.__isReadOnly__ = false;
        this.__readOnlyInstance__ = createReadOnly(this);
        this.__options__ = options;
        this.__value__ = this.constructor.wrapValue(
            (value === undefined) ? this.constructor.defaults() : value,
            this.constructor._spec,
            options
        );
    }


    // merge native javascript data into the object
    // this method traverses the input recursively until it reaches typorama values (then it sets them)
    setValue(newValue){
        if (this.$isDirtyable(true)) {
            var changed = false;
            _.forEach(newValue, (fieldValue, fieldName) => {
                var fieldSpec = this.$getFieldDef(fieldName);
                if (fieldSpec) {
                    var newVal = this.constructor._wrapOrNull(fieldValue,fieldSpec,this.__lifecycleManager__);
                    if(this.__value__[fieldName]!==newVal)
                    {
                        changed = true;
                        this.__value__[fieldName] = newVal;
                    }
                    //if (this.__value__[fieldName].setValue && !BaseType.validateType(fieldValue)) {
                    //    // recursion call
                    //    changed = this.__value__[fieldName].setValue(fieldValue) || changed;
                    //} else {
                    //    // end recursion, assign value (if applicable)
                    //    changed = this.$validateAndAssignField(fieldName, fieldValue) || changed;
                    //}
                }
            });
            if(changed)
            {
                this.$setDirty();
            }
            return changed;
        }
    }

    $getFieldDef(fieldName){
        return this.constructor._spec[fieldName];
    }

    // validates and assigns input to field.
    // will throw for undefined fields
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
            }
        }
        return false;
    }

    $assignField(fieldName, newValue) {
        this.__value__[fieldName] = newValue;
        if (newValue.$setManager && _.isFunction(newValue.$setManager)) {
            newValue.$setManager(this.__lifecycleManager__);
        }
    }

    $isReadOnly(){
        return this.__isReadOnly__;
    }

    $asReadOnly(){
        return this.__readOnlyInstance__;
    }

    toJSON(recursive = true){
        return Object.keys(this.constructor._spec).reduce((json, key) => {
            var fieldValue = this.__value__[key];
            json[key] = recursive && fieldValue.toJSON ? fieldValue.toJSON(true) : fieldValue;
            return json;
        }, {});
    }
}

BaseType.ancestors = [];
BaseType.id                    = 'BaseType';
BaseType.type                  = BaseType;

makeDirtyable(BaseType);