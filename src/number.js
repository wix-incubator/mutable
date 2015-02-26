function _Number(value){
    return _Number.type(value)
}
_Number.type = Number;
_Number.test = function(v){return typeof v === 'number'};
_Number.withDefault = function(defaults, test){
    var def = _Number.defaults;
    if(defaults !== undefined){
        def = (typeof defaults === 'function') ? defaults : function(){ return defaults; };
    }

    return {
        type: _Number.type,
        defaults: def,
        test: test || _Number.test
    };
};
_Number.defaults = function(){return 0};

export default _Number;