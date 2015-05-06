import _ from "lodash"
import {makeDirtyable} from "./lifecycle"


function createReadOnly(source){
    var readOnlyInstance = Object.create(source);
    readOnlyInstance.__isReadOnly__ = true;
    return readOnlyInstance;
}

export default class BaseType {

    static create(value, options){
        return new this(value, options);
    }

    static validateType(value){ return value instanceof this.type; }

    static wrapValue(value, spec, options){
        Object.keys(spec).forEach((key) => {
            var fieldValue = (value[key] !== undefined) ? value[key] : spec[key].defaults();
            value[key] = spec[key].type.create(fieldValue, spec[key].options);
        });
        return value;
    }

    constructor(value, options = {}){
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
                if (this.$getFieldDef(fieldName)) {
                    if (this.__value__[fieldName].setValue && !(fieldValue instanceof BaseType)) {
                        // recursion call
                        changed = this.__value__[fieldName].setValue(fieldValue) || changed;
                    } else {
                        // end recursion, assign value (if applicable)
                        changed = this.$validateAndAssignField(fieldName, fieldValue) || changed;
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
            var typedField = fieldDef.type.prototype instanceof BaseType;
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

    $asReadOnly(){
        return this.__readOnlyInstance__;
    }

    toJSON(){
        return Object.keys(this.constructor._spec).reduce((json, key) => {
            var fieldValue = this.__value__[key];
            json[key] = fieldValue.toJSON ? fieldValue.toJSON() : fieldValue;
            return json;
        }, {});
    }
}

makeDirtyable(BaseType);