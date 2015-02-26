function _String(str){
    return  _String.type(str);
}

_String.type = String;
_String.test = function(v){return typeof v === 'string'};
_String.withDefault = function(defaults, test){
    var def = _String.defaults;
    if(defaults !== undefined){
        def = (typeof defaults === 'function') ? defaults : function(){ return defaults; };
    }

    return {
        type: _String.type,
        defaults: def,
        test: test || _String.test
    }
};
_String.defaults = function(){return ''};

export default _String;