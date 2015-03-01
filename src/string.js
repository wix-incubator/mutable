function _String(str){
    return String(str);
}

_String.type = _String;
_String.test = function(v){return typeof v === 'string'};


_String.withDefault = function(defaults, test){
    var def = this.defaults;

    if(defaults !== undefined){
        def = (typeof defaults === 'function') ? defaults : function(){ return defaults; };
    }

    function typeWithDefault(value, isReadOnly){
        return typeWithDefault.type(value, isReadOnly);
    }
    typeWithDefault.type = this.type;
    typeWithDefault.test = test || this.test;
    typeWithDefault.withDefault = this.withDefault.bind(this);
    typeWithDefault.defaults = def;

    return typeWithDefault;
};

_String.defaults = function(){return ''};

export default _String;