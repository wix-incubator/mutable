import _ from "lodash"
import BaseType from "./BaseType"

export function generateTest(){ // ToDo: check if its better jit-wise to move the spec to the closure: generateTestForSpec(spec)
    return function(val){
        return Object.keys(this._spec).every(function(key){
            return this._spec[key].test(val[key])
        }, this);
    };
}

export function generateFieldsOn(obj, fieldsDefinition){
    _.forEach(fieldsDefinition, (fieldDef, fieldName) => {
        if(obj[fieldName]){throw new Error('fields that starts with $ character are reserved "'+ obj.constructor.displayName + '.' + fieldName+'".')}
        Object.defineProperty(obj, fieldName, {
            get: function(){ return this.__value__[fieldName] },
            set: function(newValue){
                this.__isInvalidated__ = true;

                if(this.__isReadOnly__) {
                    console.warn('try to set value to readonly field: ', this.constructor.displayName +'.'+fieldName, '=', newValue);
                } else if(fieldDef.type.prototype instanceof BaseType) {
                    this.__value__[fieldName].setValue(newValue);
                } else {
                    this.__value__[fieldName] = newValue;
                }
            },
            enumerable:true,
            configurable:false
        });
    });
}

export function generateWithDefault(){
    return function withDefault(defaults, test, options){
        var def = this.defaults;
        if(defaults !== undefined){ // ToDo: clone defaults (add test)
            def = (typeof defaults === 'function') ? defaults : function(){ return _.clone(defaults, true); };
        }

        function typeWithDefault(value, isReadOnly, options){
            return typeWithDefault.type.create(value, isReadOnly, typeWithDefault.options || options);
        }

        typeWithDefault.type = this;
        typeWithDefault.test = test || this.test;
        typeWithDefault.withDefault = withDefault.bind(this);
        typeWithDefault.defaults = def;
        typeWithDefault.options = options;
        typeWithDefault.wrapValue = this.wrapValue;
        typeWithDefault.create = this.create;
        return typeWithDefault;
    }
}

export function generateWithDefaultForSysImmutable(Type){
    return function withDefault(defaults, test){
        var def = this.defaults;
        if(defaults !== undefined){
            def = (typeof defaults === 'function') ? defaults : function(){ return defaults; };
        }

        function typeWithDefault(value, isReadOnly){
            return Type(value);
        }
        typeWithDefault.type = this.type;
        typeWithDefault.test = test || this.test;
        typeWithDefault.withDefault = this.withDefault.bind(this);
        typeWithDefault.defaults = def;
        typeWithDefault.wrapValue = Type;
        typeWithDefault.create = this.create;
        return typeWithDefault;
    }
}

export function generateGetDefaultValue(){
    return function() {
        var spec = this._spec;
        var args = arguments;
        return Object.keys(this._spec).reduce(function (val, key) {
            var fieldSpec = spec[key];
            val[key] = fieldSpec.defaults.apply(fieldSpec, args);
            return val;
        }, {});
    }
}
