import _ from "lodash"

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
            get: function(){ return this.__value__[fieldName]; },
            set: function(newValue){ this.__value__[fieldName] = newValue; },
            enumerable:true,
            configurable:false
        });
    });
}

export function generateReadOnlyFieldsOn(obj, fieldsDefinition){
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

export function generateWithDefault(){
    return function withDefault(defualts, test){
        function typeWithDefault(value){
            return typeWithDefault.type(value);
        }
        typeWithDefault.type = this;
        typeWithDefault.test = test || this.test;
        typeWithDefault.withDefault = withDefault.bind(this);
        typeWithDefault.defaults = ((defualts !== undefined && typeof defualts === 'function') ? defualts : function(){return _.clone(defualts, true)}) || this.defaults
        return typeWithDefault;
    }
}


export function generateGetDefaultValue(){
    return function() {
        var spec = this._spec;
        var args = arguments;
        return Object.keys(this._spec).reduce(function (val, key) {
            val[key] = spec[key].defaults.apply(null, args);
            return val;
        }, {});
    }
}

