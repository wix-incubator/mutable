import defineType from "./defineType"
import BaseType from "./BaseType"
import number from "./number"

function _Array(value, isReadOnly, subtypes){
    if(!(this instanceof _Array)){ return new _Array(value, isReadOnly, subtypes)}
    this.__subtypes__ = subtypes;
    BaseType.call(this, value, isReadOnly);
}

defineType('Array',{
    spec: function(){
        return {
            length: number.withDefault(0)
        };
    },
    wrapValue: function(value, spec, isReadOnly){
        return value.reduce((wrappedList, itemValue) => {
            if(itemValue instanceof BaseType){
                wrappedList.push(itemValue);
            } else if(typeof this.__subtypes__ === 'function'){
                wrappedList.push(this.__subtypes__(itemValue, isReadOnly, this.__subtypes__.subTypes));
            } else if(typeof this.__subtypes__ === 'object'){
                var subType = this.__subtypes__[itemValue._type];
                wrappedList.push(subType(itemValue, isReadOnly, subType.subTypes));
            }
            return wrappedList;
        }, []);
    }
}, _Array);

_Array.prototype.at = function(index){
    return this.__value__[index];
};

_Array.prototype.$asReadOnly = function(){
    if(!this.__readOnlyInstance__) {
        this.__readOnlyInstance__ = this.constructor.type(this.__value__, true, this.__subtypes__);
    }
    return this.__readOnlyInstance__;
};

export default _Array
