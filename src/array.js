import _ from "lodash"
import defineType from "./defineType"
import BaseType from "./BaseType"
import number from "./number"
import {generateWithDefault} from "./defineTypeUtils"

export default class _Array extends BaseType {

    static defaults(){ return []; }

    static test(value){ return Array.isArray(value); }

    static wrapValue(value, spec, isReadOnly, options){
        return value.reduce((wrappedList, itemValue) => {
            wrappedList.push(this._wrapSingleItem(itemValue, isReadOnly, options));
            return wrappedList;
        }, []);
    }

    static _wrapSingleItem(itemValue, isReadOnly, options){
        if(itemValue instanceof BaseType){
            return itemValue;
        } else if(typeof options.subTypes === 'function'){
            return options.subTypes.create(itemValue, isReadOnly, options.subTypes.options);
        } else if(typeof options.subTypes === 'object'){
            var subType = options.subTypes[itemValue._type];
            return subType.create(itemValue, isReadOnly, subType.options);
        }
    }

    static of(subTypes, defaults, test){
        return this.withDefault(defaults, test, { subTypes });
    };

    constructor(value=[], isReadOnly=false, options={}){
        BaseType.call(this, value, isReadOnly, options);
    }

    at(index){
        var item = this.__value__[index];
        return (this.__isReadOnly__ && item instanceof BaseType) ? item.$asReadOnly() : item;
    }

    push(newItem){
        if(this.__isReadOnly__){
            return null;
        }
        this.__isInvalidated__= true;
        return this.__value__.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__));
    }

    setValue(newValue){
        if(newValue instanceof _Array){
            newValue = newValue.toJSON();
        }
        if(_.isArray(newValue)){
            this.__value__ = [];
            _.forEach(newValue, (itemValue) => {
                this.push(itemValue);
            });
        }
    }

    $asReadOnly(){
        if(!this.__readOnlyInstance__) {
            this.__readOnlyInstance__ = this.constructor.type.create(this.__value__, true, this.__options__);
        }
        return this.__readOnlyInstance__;
    }

    $isInvalidated(){
        if(this.__isInvalidated__==-1) {
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

    $revalidate(){
        this.__isInvalidated__ = -1;
        _.forEach(this.__value__, (item, index)=>{
            if(item instanceof BaseType)
            {
                item.$revalidate();
            }
        });
    }

    $resetValidationCheck(){
        this.__isInvalidated__ = this.__isInvalidated__ || -1;
        _.forEach(this.__value__, (item, index)=>{
            if(item instanceof BaseType) {
                item.$resetValidationCheck();
            }
        });
    }

}

_Array.withDefault = generateWithDefault();

defineType('Array',{
    spec: function(){
        return {
            length: number.withDefault(0)
        };
    }
}, _Array);