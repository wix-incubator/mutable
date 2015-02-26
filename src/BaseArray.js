import defineType from "./defineType"
import BaseType from "./BaseType"
import number from "./number"

function _Array(value, subtypes){
    if(!(this instanceof _Array)){ return new _Array(value, subtypes)}
    BaseType.call(this, value);
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
        return this.__subtypes__(this.__value__[index]);
    } else {
        var val = this.__value__[index];
        return this.__subtypes__[this.__value__[index]._type](val);

    }
}

export default _Array
