var BaseType = function(value) {
    this.__value__ = (value !== undefined) ? value : this.constructor.defaults();
    this._mergeDefaults();
};

BaseType.prototype = {
    constructor: BaseType,
    _mergeDefaults: function(){
        Object.keys(this.constructor._spec).forEach((key) => {
            if(this.__value__[key] === undefined) {
                this.__value__[key] = this.constructor._spec[key].defaults();
            }
        });
    },
    asReadOnly: function(){
        var readOnlyInstance = new this.constructor(this.__value__);
        readOnlyInstance.__proto__ = this.constructor.readOnlyPrototype;
        return readOnlyInstance;
    },
    toJSON: function(){
        return this.__value__;
    }
};

export default BaseType;
