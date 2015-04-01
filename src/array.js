import _ from "lodash"
import defineType from "./defineType"
import BaseType from "./BaseType"
import number from "./number"
import string from "./string"
import {generateWithDefault} from "./defineTypeUtils"

export default class _Array extends BaseType {

    static defaults() { return []; }

    static test(value) { return Array.isArray(value); }

    static wrapValue(value, spec, isReadOnly, options) {

        if(value instanceof BaseType) {
            return value.__value__.map((itemValue) => {
                return this._wrapSingleItem(itemValue, isReadOnly, options);
            }, this);
        }

        return value.map((itemValue) => {
            return this._wrapSingleItem(itemValue, isReadOnly, options);
        }, this);
    }

    static _wrapSingleItem(itemValue, isReadOnly, options) {
        if(itemValue instanceof BaseType) {
            return itemValue;
        } else if(typeof options.subTypes === 'function') {
            return options.subTypes.create(itemValue, isReadOnly, options.subTypes.options);
        } else if(typeof options.subTypes === 'object') {

            var subType = options.subTypes[
                itemValue._type ? itemValue._type  :
                number.test(itemValue) ? '_Number' :
                string.test(itemValue) ? '_String' :
                Object.keys(options.subTypes)[0]
            ];

            return subType.create(itemValue, isReadOnly, subType.options);
        }
    }

    static of(subTypes, defaults, test) {
        return this.withDefault(defaults, test, { subTypes });
    };

    constructor(value=[], isReadOnly=false, options={}) {
        if(options.subTypes && _.isArray(options.subTypes)) {
            options.subTypes = options.subTypes.reduce(function(subTypes, type) {
                subTypes[type.displayName || type.name] = type;
                return subTypes;
            }, {});
        }

        super(value, isReadOnly, options);
        // BaseType.call(this, value, isReadOnly, options);
    }

    toJSON() {
        return this.__value__.map(item => {
            return (item instanceof BaseType) ? item.toJSON() : item;
        });
    }

    at(index) {
        var item = this.__value__[index];
        return (this.__isReadOnly__ && item instanceof BaseType) ? item.$asReadOnly() : item;
    }

    push(...newItems) {
        if(this.__isReadOnly__) {
            return null;
        }

        this.__isInvalidated__= true;

        var options = this.__options__;

        return Array.prototype.push.apply(
            this.__value__,
            newItems.map((item) => this.constructor._wrapSingleItem(item, false, options))
        );
    }

    forEach(cb) {
        var that = this;
        this.__value__.forEach(function(item, index, arr) {
            cb(item,index,that);
        });
    }

    map(cb, ctx) {
        this.__value__.map(function(item, index, arr) {
            return cb(item, index, this);
        }, ctx || this);

    }

    splice(index, removeCount, ...addedItems) {
        if(this.__isReadOnly__) {
            return null;
        }
        this.__isInvalidated__= true;
        var spliceParams = [index,removeCount];
        addedItems.forEach(function(newItem) {
           spliceParams.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__))
        }.bind(this));
        return this.__value__.splice.apply(this.__value__,spliceParams);
        //return this.__value__.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__));
    }


    concat(...addedArrays) {
        return this.constructor.create(Array.prototype.concat.apply(this.__value__, addedArrays.map((array) => array.__value__ || array)), this.__isReadOnly__, this.__options__);
    }

    every(cb) {
        var self = this;
        return this.__value__.every(function(element, index, array) {
            return cb(element, index, self)
        });
    }

    some(cb) {
        var self = this;
        return this.__value__.some(function(element, index, array) {
            return cb(element, index, self);
        });
    }

    find(cb) {
        var self = this;
        return _.find(this.__value__, function(element, index, array) {
            return cb(element, index, self);
        });
        return _.find(this.__value__, cb);
    }

    findIndex(cb) {
        var self = this;
        return _.findIndex(this.__value__, function (element, index, array) {
            return cb(element, index, self)
        })
        return _.findIndex(this.__value__, cb);
    }

    filter(cb) {
        var self = this;
        var filteredArray = this.__value__.filter(function(element, index, array) {
            return cb(element, index, self);
        });
        return new this.constructor(filteredArray, false, this.__options__);
    }

    setValue(newValue) {
        if(newValue instanceof _Array) {
            newValue = newValue.toJSON();
        }
        if(_.isArray(newValue)) {
			//fix bug #33. reset the current array instead of replacing it;
            this.__value__.length = 0;
            _.forEach(newValue, (itemValue) => {
                this.push(itemValue);
            });
        }
    }

    $asReadOnly() {
        if(!this.__readOnlyInstance__) {
            this.__readOnlyInstance__ = this.constructor.type.create(this.__value__, true, this.__options__);
        }
        return this.__readOnlyInstance__;
    }

    $isInvalidated() {

        if(this.__isInvalidated__==-1) {
            var invalidatedField = _.find(this.__value__, (item, index)=>{
                if(item instanceof BaseType) {
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

    $revalidate() {
        this.__isInvalidated__ = -1;
        _.forEach(this.__value__, (item, index)=>{
            if(item instanceof BaseType) {
                item.$revalidate();
            }
        });
    }

    $resetValidationCheck() {
        this.__isInvalidated__ = this.__isInvalidated__ || -1;
        _.forEach(this.__value__, (item, index)=>{
            if(item instanceof BaseType) {
                item.$resetValidationCheck();
            }
        });
    }

}

_Array.withDefault = generateWithDefault();



//['map', 'filter', 'every', 'forEach'].map(function(key) {
['map'].map(function(key) {

    var loFn = _[key];

    _Array.prototype[key] = function(fn, ctx) {

        return loFn(this.__value__, function() {
            return fn.apply(ctx || this, arguments);
        });

    }
});

defineType('Array',{
    spec: function() {
        return {
            length: number.withDefault(0)
        };
    }
}, _Array);
