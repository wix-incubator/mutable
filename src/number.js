function _Number(defaults, test){
    return {
        type: _Number.type,
        defaults: defaults || _Number.defaults,
        test: test || _Number.test
    }
}
_Number.type = Number;
_Number.test = function(v){typeof v === 'number'};
_Number.withDefault = function(defaults, test){
    return _Number((defaults !== undefined && typeof defaults === 'function') ? defaults : function(){ return defaults; } || _Number.defaults, test);
};
_Number.defaults = function(){return 0};

export default _Number;