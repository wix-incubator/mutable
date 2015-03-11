import _ from "lodash"
import defineType from "./defineType"
import BaseType from "./BaseType"
import number from "./number"
import {generateWithDefault} from "./defineTypeUtils"







export default class _Array extends BaseType {

    static defaults(){ return []; }

    static test(value){ return Array.isArray(value); }

    static wrapValue(value, spec, isReadOnly, options){

        if(value instanceof BaseType){
            return value.__value__.map((itemValue) => {
                return this._wrapSingleItem(itemValue, isReadOnly, options);
            }, this);
        }

        return value.map((itemValue) => {
            return this._wrapSingleItem(itemValue, isReadOnly, options);
        }, this);
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
        if(options.subTypes && _.isArray(options.subTypes))
        {
            var subTypesObj = {};
            options.subTypes.forEach(function(item){
                subTypesObj[item.displayName] = item;
            });
            options.subTypes = subTypesObj;
        }
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
    forEach(cb){
        var that = this;
        this.__value__.forEach(function(item,index,arr){
            cb(item,index,that);
        });
    }
    map(cb){
        var that = this;

        this.__value__.map(function(item,index,arr){
            return cb(item,index,that);
        });

    }


    splice(index,removeCount, ...addedItems){
        if(this.__isReadOnly__){
            return null;
        }
        this.__isInvalidated__= true;
        var spliceParams = [index,removeCount];
        addedItems.forEach(function(newItem){
           spliceParams.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__))
        }.bind(this));
        return this.__value__.splice.apply(this.__value__,spliceParams);
        //return this.__value__.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__));
    }

    concat(...addedArrays){
        var res = new this.constructor(this.__value__,false,this.__options__);
        addedArrays.forEach(function(arr){
            arr.forEach(function(item){
                res.push(item);
            })
        });
        return res;
    }

    every(cb){
        var self = this;
        return this.__value__.every(function(element, index, array) {
            return cb(element, index, self)
        });
    }

    some(cb){
        var self = this;
        return this.__value__.some(function(element, index, array){
            return cb(element, index, self);
        });
    }

    find(cb){
        var self = this;
        return _.find(this.__value__, function(element, index, array) {
            return cb(element, index, self);
        });
        return _.find(this.__value__, cb);
    }

    findIndex(cb){
        var self = this;
        return _.findIndex(this.__value__, function (element, index, array) {
            return cb(element, index, self)
        })
        return _.findIndex(this.__value__, cb);
    }

    filter(cb){
        var self = this;
        var filteredArray = this.__value__.filter(function(element, index, array) {
            return cb(element, index, self);
        });
        return new this.constructor(filteredArray, false, this.__options__);
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



//['map', 'filter', 'every', 'forEach'].map(function(key){
['map'].map(function(key){

    var loFn = _[key];

    _Array.prototype[key] = function(fn, ctx){

        return loFn(this.__value__, function(){
            return fn.apply(ctx || this, arguments);
        });


    }


});



defineType('Array',{
    spec: function(){
        return {
            length: number.withDefault(0)
        };
    }
}, _Array);