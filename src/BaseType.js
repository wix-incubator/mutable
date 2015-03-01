var BaseType = function(value, isReadOnly = false) {
    this.__isReadOnly__ = !!isReadOnly;
    this.__value__ = BaseType.mergeDefaults(
        (value === undefined) ? this.constructor.defaults(): value,
        this.constructor._spec
    );
};

BaseType.mergeDefaults = function (value, spec){
    Object.keys(spec).forEach((key) => {
        if(value[key] === undefined) {
            value[key] = spec[key].defaults();
        }
    });
    return value;
};

BaseType.prototype = {
    constructor: BaseType,
    $asReadOnly: function(){
        return this.constructor.type(this.__value__, true);
    },
    toJSON: function(){
        return this.__value__;
    }
};

export default BaseType;
