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
		//if(isValid){
		//	var subTypes = this.options.subTypes;
		//	var valueSubTypes = value.__options__.subTypes;
		//	if(typeof subTypes === 'function'){
		//		isValid = subTypes === valueSubTypes;
		//	} else {
		//		isValid = (typeof valueSubTypes !== 'function') && _.any(valueSubTypes, (Type) => {
		//			return subTypes[Type.id || Type.name] === Type;
		//		});
		//	}
		//}
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
				throw new Error('Unmet typorama type requirement.');
			}
		} else if(!_.isArray(value)) {
			throw new Error('Unmet array type requirement.');
		}

		return value.map((itemValue) => {
			return this._wrapSingleItem(itemValue, options);
		}, this);
	}

	static getSignature(options) {
        if(_.isFunction(options.subTypes))
        {
            return '<'+options.subTypes.type.id+'>';
        }else{
            return '<'+options.subTypes.map(function(type,name){
                return name;
            }).join(',')+'>';
        }
	}

	static _wrapSingleItem(value, options, lifeCycle) {
		var result = _.isFunction(options.subTypes) ?
			this._wrapOrNull(value, options.subTypes, lifeCycle) :
			_(options.subTypes).map((type) => this._wrapOrNull(value, type, lifeCycle)).filter().first();

		if(null === result || undefined === result) {
			throw new Error('Illegal value '+value+' of type '+BaseType.getValueTypeName(value)+' for Array of type '+_Array.getSignature(options));
		} else {
			return result;
		}
	}



	static of(subTypes) {
		//TODO: remove this when transpiler shananigans are over
		if(arguments.length>1)
			subTypes = arguments;
		return this.withDefault(undefined, undefined, { subTypes });
	};

	constructor(value=[], options={}) {
        if(!options.subTypes)
        {
            throw new Error('Untyped arrays are not supported. Use Array<SomeType> instead.')
        }
		if(_.isArray(options.subTypes)) {
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
		return this.__wrapArr__(valueArray);
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

    __wrapArr__(val){
        return new this.constructor(val, this.__options__);
    }

	// Mutator methods

	pop() {
		if(this.$setDirty()) {
			if(this.__value__.length === 0) {
				return undefined;
			}
			return this.constructor._wrapSingleItem(this.__value__.pop(), this.__options__);
		} else {
			return null;
		}
	}

	push(...newItems) {
		if(this.$setDirty()){
			return Array.prototype.push.apply(
				this.__value__,
				newItems.map((item) => this.constructor._wrapSingleItem(item, this.__options__,this.__lifecycleManager__))
			);
		} else {
			return null;
		}
	}

	reverse() {
		if(this.$setDirty()){
			this.__value__.reverse();
			return this;
		} else {
			return null;
		}
	}

	shift() {
		if(this.$setDirty()){
			return this.constructor._wrapSingleItem(this.__value__.shift(), this.__options__);
		} else {
			return null;
		}
	}

	sort(cb) {
		if(this.$setDirty()){
			return this.__wrapArr__(this.__value__.sort(cb));
		} else {
			return null;
		}
	}

	splice(index, removeCount, ...addedItems) {
		if(this.$setDirty()){
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

	unshift(...newItems) {
		if(this.$setDirty()){
			return Array.prototype.unshift.apply(
				this.__value__,
				newItems.map((item) => this.constructor._wrapSingleItem(item, this.__options__,this.__lifecycleManager__))
			);
		} else {
			return null;
		}
	}

	set(index, element) {
		if(this.$setDirty()){
			return this.__value__[index] = this.constructor._wrapSingleItem(element, this.__options__,this.__lifecycleManager__);
		} else {
			return null;
		}
	}

	// Accessor methods
	at(index) {
		var item = this.__value__[index];
		return (BaseType.validateType(item) && this.__isReadOnly__) ? item.$asReadOnly() : item;
	}

	concat(...addedArrays) {
		return this.__wrapArr__(Array.prototype.concat.apply(this.__value__, addedArrays.map((array) => array.__value__ || array)));
	}

	join(separator = ',') {
		return this.__value__.join(separator);
	}

	slice(begin, end) {
		if(end) {
			return this.__wrapArr__(this.__value__.slice(begin, end));
		} else {
			return this.__wrapArr__(this.__value__.slice(begin));
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
        this.__lodashProxy__('forEach',(item,index)=>{cb(item,index,this)});
	}

	find(cb){
        return this.__lodashProxy__('find',(item,index)=>{cb(item,index,this)});
	}

	findIndex(cb){
        return this.__lodashProxy__('findIndex',(item,index)=>{cb(item,index,this)});
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
		return this.__lodashProxyWrap__('filter', fn, ctx);
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
			_.forEach(newValue, ((itemValue, idx) => {

				var newItemVal = this.constructor._wrapSingleItem(itemValue,this.__options__,this.__lifecycleManager__);
				changed = changed || newItemVal!= this.__value__[idx];

				this.__value__[idx] = newItemVal;

			}).bind(this));
			if(changed)
			{
				this.$setDirty();
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
