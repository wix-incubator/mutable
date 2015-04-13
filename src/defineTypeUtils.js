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
        if(obj[fieldName]){throw new Error('fields that starts with $ character are reserved "'+ obj.constructor.id + '.' + fieldName+'".')}
        Object.defineProperty(obj, fieldName, {
            get: function(){
                if(this.__isReadOnly__) {
                    return (fieldDef.type.prototype instanceof BaseType) ? this.__value__[fieldName].$asReadOnly() : this.__value__[fieldName];
                } else {
                    return this.__value__[fieldName];
                }
            },
            set: function(newValue){
                if(this.__isReadOnly__) {
                    console.warn('try to set value to readonly field: ', this.constructor.id +'.'+fieldName, '=', newValue);
                } else {
                    this.$setDirty();
                    if(fieldDef.type.prototype instanceof BaseType){ // ToDO: test options validity
                        if(fieldDef.validateType(newValue)){
                            this.__value__[fieldName] = newValue;
                        }
                    } else {
                        if(fieldDef.test(newValue)){
                            this.__value__[fieldName] = newValue;
                        }
                    }
                }
            },
            enumerable:true,
            configurable:false
        });
    });
}

export function generateWithDefault(){
    return function withDefault(defaults, test, options){
		options = options || this.options;
        var def = defaults ? function(){ return _.clone(defaults, true); } : this.defaults;

        function typeWithDefault(value, options){
            return new typeWithDefault.type(value, typeWithDefault.options || options);
        }

        typeWithDefault.type = this.type || this;
        typeWithDefault.test = test || this.test;
        typeWithDefault.validateType = this.validateType;
        typeWithDefault.withDefault = withDefault//.bind(this);
        typeWithDefault.defaults = def;
        typeWithDefault.options = options;
        typeWithDefault.wrapValue = this.wrapValue;
        typeWithDefault.create = this.create;
        return typeWithDefault;
    }
}

export function generateWithDefaultForSysImmutable(Type){
    return function withDefault(defaults, test){
	
		var def = defaults ? function(){ return defaults; } : this.defaults;

        function typeWithDefault(value){
            return Type(value);
        }
        typeWithDefault.type = this.type;
        typeWithDefault.test = test || this.test;
        typeWithDefault.validateType = this.validateType;
        typeWithDefault.withDefault = this.withDefault//.bind(this);
        typeWithDefault.defaults = def;
        typeWithDefault.wrapValue = Type;
        typeWithDefault.create = this.create;
        return typeWithDefault;
    }
}





