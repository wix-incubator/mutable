import _ from "lodash"
import {dirty} from "./lifecycle"


function createReadOnly(source){
    var readOnlyInstance = Object.create(source);
    readOnlyInstance.__isReadOnly__ = true;
    readOnlyInstance.constructor = source.constructor;
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
        this.__dirty__ = dirty.unKnown;
        this.__options__ = options;
        this.__value__ = this.constructor.wrapValue(
            (value === undefined) ? this.constructor.defaults() : value,
            this.constructor._spec,
            options
        );
    }

    setValue(newValue){
        this.$setDirty(true);
        if(newValue instanceof BaseType){
            newValue = newValue.toJSON();
        }
        _.forEach(newValue, (fieldValue, fieldName) => {
            if (this.constructor._spec[fieldName]) {
                this[fieldName] = fieldValue;
            }
        });
    }

    $type(){
        return this.__proto__.constructor;
    }

    $asReadOnly(){
        return this.__readOnlyInstance__;
    }

    // called when a change has been made to this object directly or after changes are paused #lifecycle
    $setDirty(isDirty) {
        if (!this.__isReadOnly__ && isDirty !== undefined) {
            this.__dirty__ = isDirty ? dirty.yes : dirty.no;
        }
    }

    // may be called at any time #lifecycle
    $isDirty() {
        return this.__dirty__.isKnown ? this.__dirty__.isDirty :
            _.any(this.__value__, (val) => val.$isDirty && val.$isDirty());
    }

    // resets the dirty state to unknown #lifecycle
    $resetDirty(){
        if (!this.__isReadOnly__) {
            this.__dirty__ = dirty.unKnown;
            _.forEach(this.__value__, (val) => {
                if (val.$resetDirty && _.isFunction(val.$resetDirty)) {
                    val.$resetDirty();
                }
            });
        } else {
            console.warn('resetting dirty flag on read only!');
        }
    }

    toJSON(){
        return Object.keys(this.constructor._spec).reduce((json, key) => {
            var fieldValue = this.__value__[key];
            json[key] = fieldValue.toJSON ? fieldValue.toJSON() : fieldValue;
            return json;
        }, {});
    }

    toPrettyPrint() {
        var msg = "{" + this + "}";
        return msg;
    }

}
