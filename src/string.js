function _String(defaults, test){
    return {
        type: _String.type,
        defaults: defaults || _String.defaults,
        test: test || _String.test
    }
}
_String.type = String;
_String.test = function(v){typeof v === 'string'};
_String.withDefault = function(defaults, test){
    return _String((defaults !== undefined && typeof defaults === 'function') ? defaults : function(){ return defaults; } || _String.defaults, test);
};
_String.defaults = function(){return ''};

export default _String;