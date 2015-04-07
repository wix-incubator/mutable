import _ from 'lodash'
import defineType from './defineType'
import BaseType from './BaseType'
import number from './number'
import string from './string'
import {generateWithDefault} from './defineTypeUtils'

export default class _Array extends BaseType {

	static defaults() { return []; }

	static test(value) { return Array.isArray(value); }
    
    static validateType(value) {
        var isValid = BaseType.validateType.call(this, value);
        if(isValid){
            var subTypes = this.options.subTypes;
            var valueSubTypes = value.__options__.subTypes;
            if(typeof subTypes === 'function'){
                isValid = subTypes === valueSubTypes;
            } else {
                isValid = !_.isFunction(valueSubTypes) && _.any(valueSubTypes, (Type) => {
                    return subTypes[Type.id || Type.name] === Type;
                });
            }
        }
        return isValid
    }
    
	static wrapValue(value, spec, options) {

		if(value instanceof BaseType) {
			return value.__value__.map((itemValue) => {
				return this._wrapSingleItem(itemValue, options);
			}, this);
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
				number.test(itemValue) ? number.name :
				string.test(itemValue) ? string.name :
				Object.keys(options.subTypes)[0]
			];

			return subType.create(itemValue, subType.options);
		}
	}

	static of(subTypes, defaults, test) {
		return this.withDefault(defaults, test, { subTypes });
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

	// Add a Warn method to BaseType

	// Mutator methods
	copyWithin() {
        throw 'Slice not implemented yet. Please do.';
    }

    fill() {
        throw 'Slice not implemented yet. Please do.';
    }

	pop() {
        if (this.__isReadOnly__) {
            return null;
        }
        this.__isInvalidated__ = true;
        return this.__value__.pop();
    }

    push(...newItems) {
		if(this.__isReadOnly__) {
			return null;
		}

        this.$setDirty();
        var options = this.__options__;

		return Array.prototype.push.apply(
			this.__value__,
			newItems.map((item) => this.constructor._wrapSingleItem(item, options))
		);
	}

	reverse() {
        if (this.__isReadOnly__) {
            return null;
        }
        this.__isInvalidated__ = true;
        return this.__value__.reverse();
    }

    shift() {
        if (this.__isReadOnly__) {
            return null;
        }
        this.__isInvalidated__ = true;
        return this.__value__.shift();
    }

    sort(cb) {
        if (this.__isReadOnly__) {
            return null;
        }
        this.__isInvalidated__ = true;
        return this.__value__.sort(cb);
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
        if(this.__isReadOnly__) {
            return null;
        }
        this.$setDirty();
        var spliceParams = [index,removeCount];
        addedItems.forEach(function(newItem) {
           spliceParams.push(this.constructor._wrapSingleItem(newItem, this.__options__))
        }.bind(this));
        return this.__value__.splice.apply(this.__value__, spliceParams);
        //return this.__value__.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__));
    }

	unshift() {
        if (this.__isReadOnly__) {
            return null;
        }
        this.__isInvalidated__ = true;
        return this.__value__.unshift();
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

    toSource() {
        throw 'Slice not implemented yet. Please do.';
    }

    toString() {
        throw 'Slice not implemented yet. Please do.';
    }

    valueOf() {
        return this.__value__.map(function(item) {
            return item.valueOf();
        });
    }

    toLocaleString() {
        throw 'Slice not implemented yet. Please do.';
    }

    indexOf() {
        throw 'Slice not implemented yet. Please do.';
    }

    lastIndexOf() {
        throw 'Slice not implemented yet. Please do.';
    }
	// Iteration methods

	forEach(cb) {
		var that = this;
		this.__value__.forEach(function(item, index, arr) {
			cb(item, index, that);
		});
	}

	entries() {
        throw 'Slice not implemented yet. Please do.';
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
        });
    }

	keys() {
        throw 'Slice not implemented yet. Please do.';
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

    reduce() {
        throw 'Slice not implemented yet. Please do.';
    }

    reduceRight() {
        throw 'Slice not implemented yet. Please do.';
    }

    values() {
        throw 'Slice not implemented yet. Please do.';
    }
}
_Array.withDefault = generateWithDefault();



['map', 'filter', 'slice'].forEach(function(key) {

    var loFn = _[key];
    _Array.prototype[key] = function(fn, ctx) {

        var valueArray = loFn(this.__value__, function() {
            return fn.apply(this, arguments);
        }, ctx || this);

        return new this.constructor(valueArray, false, this.__options__);

    }

});

['every', 'some'].forEach(function(key) {

    var loFn = _[key];
    _Array.prototype[key] = function(fn, ctx) {

        var valueArray = loFn(this.__value__, function() {
            return fn.apply(ctx || this, arguments);
        });

        return valueArray;

    }

});

defineType('Array',{
	spec: function() {
		return {
			length: number.withDefault(0)
		};
	}
}, _Array);
