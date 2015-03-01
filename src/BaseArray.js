import defineType from "./defineType"
import BaseType from "./BaseType"
import number from "./number"

function _Array(value, isReadOnly, subtypes){
    if(!(this instanceof _Array)){ return new _Array(value, isReadOnly, subtypes)}
    BaseType.call(this, value, isReadOnly);
    this.__subtypes__ = subtypes;
}

defineType('Array',{
    spec: function(){
        return {
            length: number.withDefault(0)
        };
    }
}, _Array);

_Array.prototype.at = function(index){
    if(typeof this.__subtypes__ === 'function'){
        return this.__subtypes__(this.__value__[index], this.__isReadOnly__, this.__subtypes__.subTypes);
    } else if(typeof this.__subtypes__ === 'object'){
        var val = this.__value__[index];
        var subType = this.__subtypes__[this.__value__[index]._type];
        return subType(val, this.__isReadOnly__, subType.subTypes);
    }
};

_Array.prototype.$asReadOnly = function(){
    return this.constructor.type(this.__value__, true, this.__subtypes__);
};

export default _Array
