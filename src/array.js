import _                  from 'lodash';
import defineType         from './defineType';
import {
	validateAndWrap,
	validateNullValue,
	misMatchMessage,
	arrow}    from './validation';
import {getValueTypeName} from './utils';
import BaseType           from './BaseType';
import Number             from './number';
import * as generics      from './genericTypes';
import {getMailBox}       from 'gopostal';

const MAILBOX = getMailBox('Typorama.List');

class _Array extends BaseType {

	static withDefault(){
		return BaseType.withDefault.apply(this, arguments);
	}

	static defaults() { return []; }

	static cloneValue(value){
		if(!Array.isArray(value)) { return []; }
		return value.map((itemValue, index) => {
			var Type = generics.getMatchingType(this.options.subTypes, itemValue);
			if(!Type){
				throw new Error("cloneValue error: no type found for index " + index)
			}
			return Type.cloneValue(itemValue);
		});
	}

	static validate(value) { return Array.isArray(value); }

	static validateType(value) {
		return BaseType.validateType.call(this, value);
	}

	static allowPlainVal(val){
		return Array.isArray(val) || validateNullValue(this, val);
	}

	static wrapValue(value, spec, options,errorContext) {
		if(BaseType.validateType(value)) {
			if (value.__value__.map) {
				return value.__value__.map((itemValue) => {
					return this._wrapSingleItem(itemValue, options,null,errorContext);
				}, this);
			} else {
				MAILBOX.error('Unmet typorama type requirement.')
			}
		} else if(!_.isArray(value)) {
			MAILBOX.error('Unmet array type requirement.');
		}

		return value.map((itemValue,itemIndex) => {

			return this._wrapSingleItem(itemValue, options,null,{
				level:errorContext.level,
				entryPoint:errorContext.entryPoint,
				path:errorContext.path+'['+itemIndex+']'
			});
		}, this);
	}

	static _wrapSingleItem(value, options, lifeCycle,errorContext) {
		var result = generics.doOnType(options.subTypes, type => {
			if(type.validateType(value) || type.allowPlainVal(value)){
				return validateAndWrap(value, type, lifeCycle,errorContext);
			}
		});
		if(null === result || undefined === result) {
			var allowedTypes = generics.toString(options.subTypes);
			MAILBOX.post(errorContext.level, misMatchMessage(errorContext,allowedTypes,value));
		} else {
			return result;
		}
	}

	static of(subTypes) {
		//TODO: remove this when transpiler shenanigans are over
		if(arguments.length > 1) {
			subTypes = Array.prototype.slice.call(arguments);
		}
		return this.withDefault(undefined, undefined, { subTypes });
	};

	static reportDefinitionErrors(options){
		if(!options || !options.subTypes){
			return {path:'',message:`Untyped Lists are not supported please state type of list item in the format core3.List<string>`}
		} else {
			var error =  generics.reportDefinitionErrors(options.subTypes, BaseType.reportFieldDefinitionError);
			if(error){
				return {
					path:`<${error.path}>`,
					message: error.message

				}
			}
		}
	}


	static createErrorContext(entryPoint,level, options){
		options = options || this.options || this.__options__;
		return {
			level,
			entryPoint,
			path:'List'+generics.toString(generics.normalizeTypes(options.subTypes))
		}
	}

	constructor(value=[], options={}, errorContext) {
		if(!errorContext){
			errorContext = _Array.createErrorContext('List constructor error', 'error', options);
		}
		const report = _Array.reportDefinitionErrors(options);
        if(report){
			MAILBOX.error('List constructor: '+report.message);
        }
		options.subTypes = generics.normalizeTypes(options.subTypes);
		super(value, options,errorContext);
	}

	toJSON(recursive = true) {
		return this.__value__.map(item => {
			return (recursive && BaseType.validateType(item)) ? item.toJSON(true) : item;
		});
	}

	__lodashProxyWrap__(key, fn, ctx){
		var valueArray = _[key](this.__getValueArr__(), fn, ctx);
		return this.__wrapArr__(valueArray);
	}

	__lodashProxy__(key, fn, ctx){
		var valueArray = _[key](this.__getValueArr__(), fn, ctx);
		return valueArray;
	}

	__getLodashIterateeWrapper__(iteratee , allowObj){
		if (_.isFunction(iteratee)) {
			var typoramaArr = this;
			return function (item, index) {
				return iteratee.call(this, item, index, typoramaArr);
			}
		} else if (allowObj && _.isObject(iteratee)){
			if (!iteratee.constructor || !iteratee.constructor.type){
				iteratee = this.constructor._wrapSingleItem(iteratee, this.__options__, null);
			}
			return function wrappedObjMatchIterator(element){
				// TODO add matches implementation in List and Map
				return iteratee.matches(element);
			}
		} else {
			return iteratee;
		}
	}

	__getValueArr__(){
		if(this.__isReadOnly__){
			return _.map(this.__value__, function(item){
				return (item.$asReadOnly) ? item.$asReadOnly() : item;
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
			return this.__value__.pop();
		} else {
			return null;
		}
	}

	push(...newItems) {
		if(this.$setDirty()){
			return Array.prototype.push.apply(
				this.__value__,
				newItems.map((item, idx) => {
					let errorContext = this.constructor.createErrorContext('List push error','error', this.__options__);
					errorContext.path += `[${this.__value__.length + idx}]`;
					return this.constructor._wrapSingleItem(item, this.__options__,this.__lifecycleManager__, errorContext);
				})
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
			return this.__value__.shift();
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
			addedItems.forEach(function (newItem, idx) {
				let errorContext = this.constructor.createErrorContext('List splice error','error', this.__options__);
				errorContext.path += `[${index + idx}]`;
				spliceParams.push(this.constructor._wrapSingleItem(newItem, this.__options__,this.__lifecycleManager__, errorContext))
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
				newItems.map((item, idx) => {
					let errorContext = this.constructor.createErrorContext('List unshift error','error', this.__options__);
					errorContext.path += `[${idx}]`;
					return this.constructor._wrapSingleItem(item, this.__options__,this.__lifecycleManager__, errorContext);
				})
			);
		} else {
			return null;
		}
	}

	set(index, element) {
		if(this.$setDirty()){

			let errorContext = this.constructor.createErrorContext('List set error','error', this.__options__);
			return this.__value__[index] = this.constructor._wrapSingleItem(element, this.__options__,this.__lifecycleManager__, errorContext);
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
		return this.__wrapArr__(this.__getValueArr__().concat(...addedArrays.map((array) => array.__getValueArr__ ? array.__getValueArr__()  :array)));
	}

	join(separator = ',') {
		return this.__value__.join(separator);
	}

	slice(begin, end) {
        return this.__wrapArr__(this.__getValueArr__().slice(begin, end));
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
		MAILBOX.fatal('toLocaleString not implemented yet. Please do.');
	}

	indexOf(searchElement, fromIndex) {
		return this.__value__.indexOf(searchElement, fromIndex || 0);
	}

	lastIndexOf(searchElement, fromIndex) {
		return this.__value__.lastIndexOf(searchElement, fromIndex || this.__value__.length);
	}

	// Iteration methods

	forEach(iteratee, ctx){
		this.__lodashProxy__('forEach',this.__getLodashIterateeWrapper__(iteratee, false), ctx);
	}

	find(predicate, ctx){
		return this.__lodashProxy__('find',this.__getLodashIterateeWrapper__(predicate, true), ctx);
	}

	findIndex(predicate, ctx){
		return this.__lodashProxy__('findIndex',this.__getLodashIterateeWrapper__(predicate, true), ctx);
	}

	map(iteratee, ctx) {
		return this.__lodashProxy__('map',this.__getLodashIterateeWrapper__(iteratee, true), ctx);
	}

	reduce(...args) {
		return _.reduce(this.__getValueArr__(), ...args);
	}

	every(fn, ctx) {
		return this.__lodashProxy__('every',this.__getLodashIterateeWrapper__(fn, true), ctx);
	}

	some(fn, ctx) {
		return this.__lodashProxy__('some',this.__getLodashIterateeWrapper__(fn, true), ctx);
	}

	filter(fn, ctx) {
		return this.__lodashProxyWrap__('filter',this.__getLodashIterateeWrapper__(fn, true), ctx);
	}

	setValue(newValue, errorContext) {
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
				let errorContext = errorContext? _.clone(errorContext) : this.constructor.createErrorContext('List setValue error','error', this.__options__);
				errorContext.path += `[${idx}]`;
				var newItemVal = this.constructor._wrapSingleItem(itemValue,this.__options__,this.__lifecycleManager__, errorContext);
				changed = changed || newItemVal!= this.__value__[idx];

				this.__value__[idx] = newItemVal;

			});
			if(changed){
				this.$setDirty();
			}
			this.__value__.length = newValue.length;
		}
		return changed;
	}

	/**
	 * get iterator over all array elements that are dirtyable
	 */
	// consider optimizing if array is of primitive type only
	$dirtyableElementsIterator(yielder){
		for(let element of this.__value__){
			if (element && _.isFunction(element.$calcLastChange)){
				yielder(this, element);
			}
		}
	}
}

export default defineType('List',{
	spec: function() {
		return {
			length: Number.withDefault(0)
		};
	}
}, null, _Array);
