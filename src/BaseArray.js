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
    if(this.__subtypes__){
        return wrapItem(this.__value__[index], this.__subtypes__);
    } else {

    }

}

function wrapItem(item, type){
    return type(item);
}

export default _Array
