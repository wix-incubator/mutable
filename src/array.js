import BaseArray from "./BaseArray"

function _Array(value, isReadOnly, subtypes){
    return _Array.type(value, isReadOnly, subtypes);
}


_Array.type = BaseArray;
_Array.test = function(v){return Array.isArray(v)};

_Array.withDefault = function(defaults, test, subTypes){
    var def = this.defaults;

    if(defaults !== undefined){
        def = (typeof defaults === 'function') ? defaults : function(){ return defaults; };
    }

    function typeWithDefault(value, isReadOnly, subTypes){
        return typeWithDefault.type(value, isReadOnly, subTypes);
    }
    typeWithDefault.type = this.type;
    typeWithDefault.test = test || this.test;
    typeWithDefault.withDefault = this.withDefault.bind(this);
    typeWithDefault.defaults = def;
    typeWithDefault.subTypes = subTypes;

    return typeWithDefault;
};



_Array.defaults = function(){return [];};

_Array.of = function ArrayOf(subTypes, defaults, test){
    return _Array.withDefault(defaults, test, subTypes);
};



export default _Array;