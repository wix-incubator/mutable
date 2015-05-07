import _ from "lodash"
import BaseType from "./BaseType"

export function generateValidate(){ // ToDo: check if its better jit-wise to move the spec to the closure: generateValidateForSpec(spec)
    return function(val){
        return Object.keys(this._spec).every(function(key){
            return this._spec[key].validate(val[key])
        }, this);
    };
}

export function generateFieldsOn(obj, fieldsDefinition){
    _.forEach(fieldsDefinition, (fieldDef, fieldName) => {
        if(obj[fieldName]){throw new Error('fields that starts with $ character are reserved "'+ obj.constructor.id + '.' + fieldName+'".')}
        Object.defineProperty(obj, fieldName, {
            get: function(){
                if(this.__isReadOnly__) {
                    return (fieldDef.type.isComplexType && fieldDef.type.isComplexType()) ? this.__value__[fieldName].$asReadOnly() : this.__value__[fieldName];
                } else {
                    return this.__value__[fieldName];
                }
            },
            set: function(newValue){
                if (this.$setDirty(true)) {
                    if (fieldDef.type.isComplexType && fieldDef.type.isComplexType()) { // ToDO: test options validity
                        if (fieldDef.validateType(newValue)) {
                            this.__value__[fieldName] = newValue;
                        }
                    } else {
                        if (fieldDef.validate(newValue)) {
                            this.__value__[fieldName] = newValue;
                        }
                    }
                } else {
                    console.warn('try to set value to readonly field: ', this.constructor.id +'.'+fieldName, '=', newValue);
                }
            },
            enumerable:true,
            configurable:false
        });
    });
}

export function generateWithDefault(){
    return function withDefault(defaults, validate, options){
        options = options || this.options;
        var def = defaults ? function(){ return _.clone(defaults, true); } : this.defaults;

        function typeWithDefault(value, options){
            return new typeWithDefault.type(value, typeWithDefault.options || options);
        }

        typeWithDefault.type = this.type || this;
        typeWithDefault.validate = validate || this.validate;
        typeWithDefault.validateType = this.validateType;
        typeWithDefault.withDefault = withDefault;//.bind(this);
        typeWithDefault.defaults = def;
        typeWithDefault.options = options;
        typeWithDefault.wrapValue = this.wrapValue;
        typeWithDefault.create = this.create;
        return typeWithDefault;
    }
}

export function generateWithDefaultForSysImmutable(Type){
    return function withDefault(defaults, validate){

        var def = defaults ? function(){ return defaults; } : this.defaults;

        function typeWithDefault(value){
            return Type(value);
        }
        typeWithDefault.type = this.type;
        typeWithDefault.validate = validate || this.validate;
        typeWithDefault.validateType = this.validateType;
        typeWithDefault.withDefault = this.withDefault;//.bind(this);
        typeWithDefault.defaults = def;
        typeWithDefault.wrapValue = Type;
        typeWithDefault.create = this.create;
        return typeWithDefault;
    }
}





