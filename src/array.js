import defineType from "./defineType"
import BaseType from "./BaseType"
import number from "./number"

function _Array(value=[], isReadOnly=false, options={}){
    if(!(this instanceof _Array)){ return new _Array(value, isReadOnly, options)}
    BaseType.call(this, value, isReadOnly, options);
}

defineType('Array',{
    spec: function(){
        return {
            length: number.withDefault(0)
        };
    },
    wrapValue: function(value, spec, isReadOnly, options){
        return value.reduce((wrappedList, itemValue) => {
            wrappedList.push(wrapSingleItem(itemValue, isReadOnly, options));
            return wrappedList;
        }, []);
    }
}, _Array);

_Array.test = function(v){
    return Array.isArray(v);
};

_Array.defaults = function(){
    return [];
};


_Array.of = function ArrayOf(subTypes, defaults, test){
    return _Array.withDefault(defaults, test, { subTypes });
};

_Array.create = function ArrayOf(value, subTypes, isReadOnly){
    //todo : if there is no subtype take the 'ANY' type!!!
    return new _Array(value, isReadOnly, { subTypes });
};


_Array.withDefault = function(defaults, test, options){
    var def = this.defaults;

    if(defaults !== undefined){ // ToDo: clone defaults (add test)
        def = (typeof defaults === 'function') ? defaults : function(){ return defaults; };
    }

    function typeWithDefault(value, isReadOnly, options){
        return typeWithDefault.type(value, isReadOnly, options);
    }
    typeWithDefault.type = this.type;
    typeWithDefault.test = test || this.test;
    typeWithDefault.withDefault = this.withDefault.bind(this);
    typeWithDefault.defaults = def;
    typeWithDefault.options = options;

    return typeWithDefault;
};


function wrapSingleItem(itemValue, isReadOnly, options){
    if(itemValue instanceof BaseType){
        return itemValue;
    } else if(typeof options.subTypes === 'function'){
        return options.subTypes(itemValue, isReadOnly, options.subTypes.options);
    } else if(typeof options.subTypes === 'object'){
        var subType = options.subTypes[itemValue._type];
        return subType(itemValue, isReadOnly, subType.options);
    }
}

_Array.prototype.at = function(index){
    var item = this.__value__[index];
    return (this.__isReadOnly__ && item instanceof BaseType) ? item.$asReadOnly() : item;
};

_Array.prototype.push = function(newItem){// ToDo: no push in read only
    this.__value__.push(wrapSingleItem(newItem, this.__isReadOnly__, this.__options__));
};

_Array.prototype.setValue = function(newValue){
    if(newValue instanceof _Array){
        newValue = newValue.toJSON();
    }
    if(_.isArray(newValue)){
        this.__value__ = [];
        _.forEach(newValue, (itemValue) => {
            this.push(itemValue);
        });
    }
};

_Array.prototype.$asReadOnly = function(){
    if(!this.__readOnlyInstance__) {
        this.__readOnlyInstance__ = this.constructor.type(this.__value__, true, this.__options__);
    }
    return this.__readOnlyInstance__;
};
_Array.prototype.$isInvalidated = function(){
    if(this.__isInvalidated__==-1)
    {
        var invalidatedField = _.find(this.__value__, (item, index)=>{
            if(item instanceof BaseType)
            {
                return item.$isInvalidated();
            }
        });
        if(invalidatedField) {
            this.__isInvalidated__ = true;
        }else{
            this.__isInvalidated__ = false;
        }
    }
    return this.__isInvalidated__;
}
_Array.prototype.$revalidate = function(){
    this.__isInvalidated__ = -1;
    _.forEach(this.__value__, (item, index)=>{
        if(item instanceof BaseType)
        {
            item.$revalidate();
        }
    });
}
_Array.prototype.$resetValidationCheck = function(){
    this.__isInvalidated__ = this.__isInvalidated__ || -1;
    _.forEach(this.__value__, (item, index)=>{
        if(item instanceof BaseType)
        {
            item.$resetValidationCheck();
        }
    });
}




export default _Array
