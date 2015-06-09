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

    static allowPlainVal(val){
        return _.isArray(val);
    }

	static wrapValue(value, spec, options) {
		if(BaseType.validateType(value)) {
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



	static _wrapSingleItem(itemValue, options, lifeCycle) {
        var insertedValue;
		if(typeof options.subTypes === 'function') {
            insertedValue = this._wrapOrNull(itemValue,options.subTypes,  lifeCycle);
		} else if(typeof options.subTypes === 'object') {

            for(var name in options.subTypes){
                insertedValue = this._wrapOrNull(itemValue,options.subTypes[name], lifeCycle);
                if(insertedValue)
                {
                    break;
                }
            }
		}
        if(!insertedValue){
            throw new Error('illegal item type : ' + itemValue);
        }
        return insertedValue;
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

	toJSON(recursive = true) {
		return this.__value__.map(item => {
			return (recursive && BaseType.validateType(item)) ? item.toJSON(true) : item;
		});
	}

	__lodashProxyWrap__(key, fn, ctx){
		var valueArray = _[key](this.__getValueArr__(), fn, ctx || this);
		return new this.constructor(valueArray, this.__options__);
	}
	__lodashProxy__(key, fn, ctx){
		var valueArray = _[key](this.__getValueArr__(), fn, ctx || this);
		return valueArray;
	}

    __getValueArr__(){
        if(this.__isReadOnly__)
        {
            return _.map(this.__value__,function(item){
                if(item instanceof BaseType)
                    return item.$asReadOnly();
                else
                    return item;
            })
        }else{
            return this.__value__;
        }
    }

	// Mutator methods

	pop() {
		if(this.$setDirty(true)) {
			if(this.__value__.length === 0) {
				return undefined;
			}
			return this.constructor._wrapSingleItem(this.__value__.pop(), this.__options__);
		} else {
			return null;
		}
	}

	push(...newItems) {
		if(this.$setDirty(true)){
			return Array.prototype.push.apply(
				this.__value__,
				newItems.map((item) => this.constructor._wrapSingleItem(item, this.__options__,this.__lifecycleManager__))
			);
		} else {
			return null;
		}
	}

	reverse() {
		if(this.$setDirty(true)){
			this.__value__.reverse();
			return this;
		} else {
			return null;
		}
	}

	shift() {
		if(this.$setDirty(true)){
			return this.constructor._wrapSingleItem(this.__value__.shift(), this.__options__);
		} else {
			return null;
		}
	}

	sort(cb) {
		if(this.$setDirty(true)){
			return new this.constructor(this.__value__.sort(cb), this.__options__);
		} else {
			return null;
		}
	}

	splice(index, removeCount, ...addedItems) {
		if(this.$setDirty(true)){
			var spliceParams = [index, removeCount];
			addedItems.forEach(function (newItem) {
				spliceParams.push(this.constructor._wrapSingleItem(newItem, this.__options__,this.__lifecycleManager__))
			}.bind(this));
			return this.__value__.splice.apply(this.__value__, spliceParams);
			//return this.__value__.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__));
		} else {
			return null;
		}
	}

	unshift(el) {
		if(this.$setDirty(true)){
			return this.__value__.unshift(el);
		} else {
			return null;
		}
	}

	set(index, element) {
		if(this.$setDirty(true)){
			return this.__value__[index] = this.constructor._wrapSingleItem(element, this.__options__,this.__lifecycleManager__);
		} else {
			return null;
		}
	}

	// Accessor methods
	at(index) {
		var item = this.__value__[index];
		return (BaseType.validateType(item) && !this.$isDirtyable(true)) ? item.$asReadOnly() : item;
	}

	concat(...addedArrays) {
		return new this.constructor(Array.prototype.concat.apply(this.__value__, addedArrays.map((array) => array.__value__ || array)), this.__options__);
	}

	join(separator = ',') {
		return this.__value__.join(separator);
	}

	slice(begin, end) {
		if(end) {
			return new this.constructor(this.__value__.slice(begin, end), this.__options__);
		} else {
			return new this.constructor(this.__value__.slice(begin), this.__options__);
		}
	}

	toString(){
		return this.__value__.toString();
	}

	valueOf(){
		return this.__value__.map(function(item) {
			return item.valueOf();
		});
	}

	toLocaleString(){
		throw 'toLocaleString not implemented yet. Please do.';
	}

	indexOf(searchElement, fromIndex) {
		return this.__value__.indexOf(searchElement, fromIndex || 0);
	}

	lastIndexOf(searchElement, fromIndex) {
		return this.__value__.lastIndexOf(searchElement, fromIndex || this.__value__.length);
	}

	// Iteration methods

	forEach(cb){
		var that = this;
		this.__value__.forEach(function(item, index, arr) {
			cb(item, index, that);
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
		});
	}

    map(fn, ctx) {
    	return this.__lodashProxy__('map', fn, ctx);
    }

    reduce(fn, initialAccumilatorValue, ctx) {
        var newValue = _.reduce.apply(_, _.compact([this.__value__, fn, initialAccumilatorValue, ctx]));
        return newValue;
    }

    every(fn, ctx) {
        return this.__lodashProxy__('every', fn, ctx);
    }

    some(fn, ctx) {
        return this.__lodashProxy__('some', fn, ctx);
    }

    filter(fn, ctx) {
        return this.__lodashProxy__('filter', fn, ctx);
    }
	setValue(newValue) {
        var changed = false;
		if(newValue instanceof _Array) {
			newValue = newValue.__getValueArr__();
		}
		if(_.isArray(newValue)) {
			//fix bug #33. reset the current array instead of replacing it;
			var lengthDiff = this.__value__.length - newValue.length;
			if (lengthDiff > 0){
				// current array is longer than newValue, fill the excess cells with undefined
				changed = true;
				this.__value__.splice(newValue.length, lengthDiff);
			}
			_.forEach(newValue, (itemValue, idx) => {

                var newItemVal = this.constructor._wrapSingleItem(itemValue,this.__options__,this.__lifecycleManager__);
                changed = changed || newItemVal!= this.__value__[idx];

                this.__value__[idx] = newItemVal;

			}.bind(this));
            if(changed)
            {
                this.$setDirty(true);
            }
            this.__value__.length = newValue.length;
		}
        return changed;
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
