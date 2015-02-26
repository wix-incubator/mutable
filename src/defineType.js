import _ from "lodash"
import BaseType from "./BaseType"

export default function(displayName, typeDefinition){
    var TypeConstructor = function(value){
        BaseType.call(this, value);
    };

    TypeConstructor.type = TypeConstructor;
    TypeConstructor.test = generateTest();
    TypeConstructor.withDefault = generateWithDefault();
    TypeConstructor.defaults = generateGetDefaultValue();

    TypeConstructor.prototype = Object.create(BaseType.prototype);
    TypeConstructor.prototype.constructor = TypeConstructor;

    TypeConstructor.getFieldsSpec = typeDefinition.spec;
    TypeConstructor._spec = typeDefinition.spec(TypeConstructor);
    generateFieldsOn(TypeConstructor.prototype, TypeConstructor._spec);
    TypeConstructor.readOnlyPrototype = generateReadOnlyFieldsOn(Object.create(BaseType.prototype), TypeConstructor._spec);

    return TypeConstructor;
};

function generateTest(){ // ToDo: check if its better jit-wise to move the spec to the closure: generateTestForSpec(spec)
    return function(val){
        return Object.keys(this._spec).every(function(key){
            return this._spec[key].test(val[key])
        }, this);
    };
}

function generateFieldsOn(obj, fieldsDefinition){
    _.forEach(fieldsDefinition, (fieldDef, fieldName) => {
        Object.defineProperty(obj, fieldName, {
            get: function(){ return this.__value__[fieldName]; },
            set: function(newValue){ this.__value__[fieldName] = newValue; },
            enumerable:true,
            configurable:false
        });
    });
}

function generateReadOnlyFieldsOn(obj, fieldsDefinition){
    _.forEach(fieldsDefinition, (fieldDef, fieldName) => {
        Object.defineProperty(obj, fieldName, {
            get: function(){ return this.__value__[fieldName]; },
            set: function(newValue){ console.warn('try to set value to readonly field: ', fieldName, '=', newValue); },
            enumerable:true,
            configurable:false
        });
    });
    return obj;
}

function generateWithDefault(){
    return function(defualts, test){
        return {
            type: this,
            test: test || this.test,
            defaults: ((defualts !== undefined && typeof defualts === 'function') ? defualts : function(){_.clone(defualts, true)}) || this.defaults
        };
    }
}

function generateGetDefaultValue(){
    return function() {
        var spec = this._spec;
        var args = arguments;
        return Object.keys(this._spec).reduce(function (val, key) {
            val[key] = spec[key].defaults.apply(null, args);
            return val;
        }, {});
    }
}

