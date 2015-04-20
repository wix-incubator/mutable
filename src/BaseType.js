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
        if (this.$setDirty(true)) {
            if (newValue instanceof BaseType) {
                newValue = newValue.toJSON();
            }
            _.forEach(newValue, (fieldValue, fieldName) => {
                var Type = this.constructor._spec[fieldName];
                if (Type && Type.type.id === 'Array') {
                    this[fieldName].setValue(fieldValue);
                } else if (Type) {
                    this[fieldName] = fieldValue;
                }
            });
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