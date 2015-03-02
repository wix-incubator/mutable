import _ from "lodash"

var BaseType = function(value, isReadOnly = false, options = {}) {
    this.__isReadOnly__ = !!isReadOnly;
    this.__readOnlyInstance__ = this.__isReadOnly__ ? this : null;
    this.__isInvalidated__ = -1;
    this.__options__ = options;
    this.__value__ = this.constructor.wrapValue(
        (value === undefined) ? this.constructor.defaults(): value,
        this.constructor._spec,
        this.__isReadOnly__,
        options
    );
};

BaseType.wrapValue = function (value, spec, isReadOnly, options){
    Object.keys(spec).forEach((key) => {
        var fieldValue = (value[key] !== undefined) ? value[key] : spec[key].defaults();
        value[key] = spec[key].type(fieldValue,  isReadOnly, spec[key].options);
    });
    return value;
};

BaseType.prototype = {
    constructor: BaseType,
    setValue: function(newValue){
        this.__isInvalidated__ = true;
        if(newValue instanceof BaseType){
            newValue = newValue.toJSON();
        }
        _.forEach(newValue, (fieldValue, fieldName) => {
            this[fieldName] = fieldValue;
        });
    },
    $asReadOnly: function(){
        if(!this.__readOnlyInstance__) {
            this.__readOnlyInstance__ = this.constructor.type(this.__value__, true, this.__options__);
        }
        return this.__readOnlyInstance__;
    },
    $isInvalidated: function(){
        if(this.__isInvalidated__==-1)
        {
            var invalidatedField = _.find(this.constructor._spec, (fieldDef, fieldName)=>{
                if(fieldDef.type.prototype instanceof BaseType)
                {
                    return this.__value__[fieldName].$isInvalidated();
                }
            });
            if(invalidatedField) {
                this.__isInvalidated__ = true;
            }else{
                this.__isInvalidated__ = false;
            }
        }
        return this.__isInvalidated__;
    },
    $revalidate : function(){
        this.__isInvalidated__ = -1;
        _.forEach(this.constructor._spec, (fieldDef, fieldName)=>{
            if(fieldDef.type.prototype instanceof BaseType)
            {
                this.__value__[fieldName].$revalidate();
            }
        });
    },
    $resetValidationCheck : function(){
        this.__isInvalidated__ = this.__isInvalidated__ || -1;
        _.forEach(this.constructor._spec, (fieldDef, fieldName)=>{
            if(fieldDef.type.prototype instanceof BaseType)
            {
                this.__value__[fieldName].$resetValidationCheck();
            }
        });
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
