var BaseType = function(value) {
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
        var readOnlyInstance = new this.constructor(this.__value__);
        readOnlyInstance.__proto__ = this.constructor.readOnlyPrototype;
        return readOnlyInstance;
    },
    toJSON: function(){
        return this.__value__;
    }
};

export default BaseType;
