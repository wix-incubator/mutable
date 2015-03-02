import BaseArray from "./BaseArray"

function _Array(value, isReadOnly, options){
    return _Array.type(value, isReadOnly, options);
}


_Array.withDefault = function(defaults, test, options){
    var def = this.defaults;

    if(defaults !== undefined){ // ToDo: clone defaults (add test)
        def = (typeof defaults === 'function') ? defaults : function(){ return defaults; };
    }

    function typeWithDefault(value, isReadOnly, options){
        return typeWithDefault.type(value, isReadOnly, options);
    }
    typeWithDefault.type = this.type;
    typeWithDefault.test = test || this.test;
    typeWithDefault.withDefault = this.withDefault.bind(this);
    typeWithDefault.defaults = def;
    typeWithDefault.options = options;

    return typeWithDefault;
};

_Array.type = BaseArray;

_Array.test = function(v){
    return Array.isArray(v);
};

_Array.defaults = function(){
    return [];
};

_Array.of = function ArrayOf(subTypes, defaults, test){
    return _Array.withDefault(defaults, test, { subTypes });
};

_Array.create = function ArrayOf(value, subTypes, isReadOnly){
    //todo : if there is no subtype take the 'ANY' type!!!
    return new BaseArray(value, isReadOnly, { subTypes });
};

export default _Array;