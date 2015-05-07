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

	static _wrapSingleItem(itemValue, options) {
		if(BaseType.validateType(itemValue)) {
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
			return (BaseType.validateType(item)) ? item.toJSON() : item;
		});
	}

	__lodashProxyWrap__(key, fn, ctx){
		var valueArray = _[key](this.__value__, fn, ctx || this);
		return new this.constructor(valueArray, this.__options__);
	}
	__lodashProxy__(key, fn, ctx){
		var valueArray = _[key](this.__value__, fn, ctx || this);
		return valueArray;
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
				newItems.map((item) => this.constructor._wrapSingleItem(item, this.__options__))
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
				spliceParams.push(this.constructor._wrapSingleItem(newItem, this.__options__))
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
    	return this.__lodashProxyWrap__('map', fn, ctx);
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
			newValue = newValue.toJSON();
		}
		if(_.isArray(newValue)) {
			//fix bug #33. reset the current array instead of replacing it;


			_.forEach(newValue, (itemValue, idx) => {
                if(BaseType.validateType(itemValue) || !this.at(idx) || !this.at(idx).setValue)
                {
                    changed = changed || (this.at(idx) !== itemValue);
                    this.__value__[idx] = itemValue;
                }else{
                    var childChange = this.__value__[idx].setValue(itemValue);
                    changed = changed || childChange;
                }
			});
            changed = changed || (this.__value__.length != newValue.length);
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
