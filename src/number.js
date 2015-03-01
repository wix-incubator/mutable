function _Number(value){
    return Number(value)
}
_Number.type = _Number;
_Number.test = function(v){return typeof v === 'number'};
//TODO: this function is a copy of the one in _String
_Number.withDefault = function(defaults, test){
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


_Number.defaults = function(){return 0};

export default _Number;