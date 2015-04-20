import _ from 'lodash'
import defineType from './defineType'
import BaseType from './BaseType'
import Number from './number'
import String from './string'
import {generateWithDefault} from './defineTypeUtils'

// to maintain consistency so that everything
var Typorama = {define: defineType};

class _Array extends BaseType {

	static defaults() { return []; }

	static validate(value) { return Array.isArray(value); }
    
    static validateType(value) {
        var isValid = BaseType.validateType.call(this, value);
        if(isValid){
            var subTypes = this.options.subTypes;
            var valueSubTypes = value.__options__.subTypes;
            if(typeof subTypes === 'function'){
                isValid = subTypes === valueSubTypes;
            } else {
                isValid = (typeof valueSubTypes !== 'function') && _.any(valueSubTypes, (Type) => {
                    return subTypes[Type.id || Type.name] === Type;
                });
            }
        }
        return isValid;
    }
    
	static wrapValue(value, spec, options) {
        if(value instanceof BaseType) {
            if (value.__value__.map) {
                return value.__value__.map((itemValue) => {
                    return this._wrapSingleItem(itemValue, options);
                }, this);
            } else {
                throw new Error('illegal value type : ' + value.constructor.id);
            }
		}

		return value.map((itemValue) => {
			return this._wrapSingleItem(itemValue, options);
		}, this);
	}

	static _wrapSingleItem(itemValue, options) {
		if(itemValue instanceof BaseType) {
			return itemValue;
		} else if(typeof options.subTypes === 'function') {
			return options.subTypes.create(itemValue, options.subTypes.options);
		} else if(typeof options.subTypes === 'object') {

			var subType = options.subTypes[
				itemValue._type ? itemValue._type  :
				Number.validate(itemValue) ? Number.name :
				String.validate(itemValue) ? String.name :
				Object.keys(options.subTypes)[0]
			];

			return subType.create(itemValue, subType.options);
		}
	}

	static of(subTypes) {
		return this.withDefault(undefined, undefined, { subTypes });
	};

	constructor(value=[], options={}) {
		if(options.subTypes && _.isArray(options.subTypes)) {
			options.subTypes = options.subTypes.reduce(function(subTypes, type) {
				subTypes[type.id || type.name] = type;
				return subTypes;
			}, {});
		}

		super(value, options);
	}

	toJSON() {
		return this.__value__.map(item => {
			return (item instanceof BaseType) ? item.toJSON() : item;
		});
	}

	// To check with Nadav: map, pop, push, reverse, shift, sort, concat, slice, some, unshift, join, valueOf

	// Mutator methods
	copyWithin() {
        throw 'copyWithin not implemented yet. Please do.';
    }

    fill() {
        throw 'fill not implemented yet. Please do.';
    }

	pop() {
		if(this.$setDirty(true)){
            return this.__value__.pop();
        } else {
            return null;
        }
    }

    push(...newItems) {
        if(this.$setDirty(true)){
            var options = this.__options__;

            return Array.prototype.push.apply(
                this.__value__,
                newItems.map((item) => this.constructor._wrapSingleItem(item, options))
            );
        } else {
            return null;
        }
	}

	reverse() {
        if(this.$setDirty(true)){
            return this.__value__.reverse();
        } else {
            return null;
        }
    }

    shift() {
        if(this.$setDirty(true)){
            return this.__value__.shift();
        } else {
            return null;
        }
    }

    sort(cb) {
        if(this.$setDirty(true)){
            return this.__value__.sort(cb);
        } else {
            return null;
        }
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

    splice(index, removeCount, ...addedItems) {
        if(this.$setDirty(true)){
            var spliceParams = [index, removeCount];
            addedItems.forEach(function (newItem) {
                spliceParams.push(this.constructor._wrapSingleItem(newItem, this.__options__))
            }.bind(this));
            return this.__value__.splice.apply(this.__value__, spliceParams);
            //return this.__value__.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__));
        } else {
            return null;
        }
    }

	unshift() {
        if(this.$setDirty(true)){
            return this.__value__.unshift();
        } else {
            return null;
        }
    }

	// Accessor methods
	at(index) {
		var item = this.__value__[index];
		return (this.__isReadOnly__ && item instanceof BaseType) ? item.$asReadOnly() : item;
	}

	concat(...addedArrays) {
		return new this.constructor(Array.prototype.concat.apply(this.__value__, addedArrays.map((array) => array.__value__ || array)), this.__options__);
	}

	join(separator ? = ',') {
        return this.__value__.join(separator);
    }
    slice(){
        throw 'slice not implemented yet. Please do.';
    }
    toSource(){
        throw 'toSource not implemented yet. Please do.';
    }

    toString(){
        return this.__value__.toString();
    }

    toPrettyPrint(){
		return `[${this}]`;
    }

    valueOf(){
        return this.__value__.map(function(item) {
            return item.valueOf();
        });
    }

    toLocaleString(){
        throw 'toLocaleString not implemented yet. Please do.';
    }

    indexOf(){
        throw 'indexOf not implemented yet. Please do.';
    }

    lastIndexOf(){
        throw 'lastIndexOf not implemented yet. Please do.';
    }
	// Iteration methods

	forEach(cb){
		var that = this;
		this.__value__.forEach(function(item, index, arr) {
			cb(item, index, that);
		});
	}

	entries(){
        throw 'entries not implemented yet. Please do.';
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
        });
    }

	keys(){
        throw 'keys not implemented yet. Please do.';
    }

    map(fn, ctx){
    	return this.__lodashProxy__('map', fn, ctx);
    }

    __lodashProxy__(key, fn, ctx){
        var valueArray = _[key](this.__value__, fn, ctx || this);
        return new this.constructor(valueArray, this.__options__);
    }

    reduce(){
        throw 'reduce not implemented yet. Please do.';
    }

    reduceRight(){
        throw 'reduceRight not implemented yet. Please do.';
    }

    every(){
        throw 'every not implemented yet. Please do.';
    }

    some(){
        throw 'some not implemented yet. Please do.';
    }

    filter(){
        throw 'filter not implemented yet. Please do.';
    }

    values(){
        throw 'values not implemented yet. Please do.';
    }

}
_Array.withDefault = generateWithDefault();

export default Typorama.define('Array',{
	spec: function() {
		return {
			length: Number.withDefault(0)
		};
	}
}, _Array);
