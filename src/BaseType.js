import _ from "lodash"

var BaseType = function(value, isReadOnly = false) {
    this.__isReadOnly__ = !!isReadOnly;
    this.__value__ = this.constructor.wrapValue.call(
        this,
        (value === undefined) ? this.constructor.defaults(): value,
        this.constructor._spec,
        this.__isReadOnly__
    );
};

BaseType.wrapValue = function (value, spec, isReadOnly){
    Object.keys(spec).forEach((key) => {
        var fieldValue = (value[key] !== undefined) ? value[key] : spec[key].defaults();
        value[key] = spec[key].type(fieldValue,  isReadOnly);
    });
    return value;
};

BaseType.prototype = {
    constructor: BaseType,
    setValue: function(newValue){
        if(newValue instanceof BaseType === false){
            _.forEach(newValue, (fieldValue, fieldName) => {
                this[fieldName] = fieldValue;
            });
        }
    },
    $asReadOnly: function(){
        return this.constructor.type(this.__value__, true);
    },
    toJSON: function(){
        return Object.keys(this.constructor._spec).reduce((json, key) => {
            var fieldValue = this.__value__[key];
            json[key] = fieldValue.toJSON ? fieldValue.toJSON() : fieldValue;
            return json;
        }, {});
    }
};

export default BaseType;
