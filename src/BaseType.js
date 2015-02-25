var BaseType = function(value) {
    this.__value__ = this.getDefaultVal();
};

BaseType.prototype = {
    constructor: BaseType
};

export default BaseType;
