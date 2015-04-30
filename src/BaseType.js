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

    setValue(newValue){
        if (!this.__isReadOnly__) {
            var changed = false;
            _.forEach(newValue, (fieldValue, fieldName) => {
                var Type = this.constructor._spec[fieldName];
                if(Type)
                {
                    if(fieldValue instanceof BaseType || !this[fieldName].setValue)
                    {
                        changed = changed || (this[fieldName] !== fieldValue);
                        this.__value__[fieldName] = fieldValue;
                    }else{
                        var childChange = this.__value__[fieldName].setValue(fieldValue);
                        changed = changed || childChange;
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