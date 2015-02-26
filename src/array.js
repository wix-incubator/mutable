import BaseArray from "./BaseArray"

console.log('11111111111111111111111111111', BaseArray)

function _Array(value, subtypes){
    return _Array.type(value, subtypes);
}


_Array.type = BaseArray;
_Array.test = function(v){return Array.isArray(v)};
_Array.withDefault = function(defaults, test){
    defaults = (defaults !== undefined && typeof defaults === 'function') ? defaults : function(){ return defaults; } || _Array.defaults;
    return {
        type: _Array.type,
        defaults: defaults || _Array.defaults,
        test: test || _Array.test
    };
};
_Array.defaults = function(){return 0};

export default _Array;