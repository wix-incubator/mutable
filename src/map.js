/**
 * Created by amira on 29/12/15.
 */
import _                  from 'lodash';
import defineType         from './defineType';
import {getMailBox}       from 'gopostal';
import BaseType           from './BaseType';
import {getValueTypeName} from './utils';
import Number             from './number';
import String             from './string';
import * as generics      from './genericTypes';
import {
	validateAndWrap,
	validateNullValue,
	misMatchMessage,
	arrow}    from './validation';


const MAILBOX = getMailBox('Typorama.Map');

// because Object.entries is too tall an order
function entries(obj) {
	return Object.keys(obj).map((key)=>[key, obj[key]]);
}

function safeAsReadOnly (item) {
	return (item && typeof item.$asReadOnly === 'function') ? item.$asReadOnly() : item;
}

function safeAsReadOnlyOrArr(item){
	if (_.isArray(item)) {
		return item.map(safeAsReadOnlyOrArr);
	} else {
		return safeAsReadOnly(item);
	}
}

function isIterable(value) {
	return value && (_.isArray(value) || value instanceof Map || typeof value[Symbol.iterator] === "function");
}

function isTypeConpatibleWithPlainJsonObject(options) {
	return !! (options && options.subTypes && generics.getMatchingType(options.subTypes.key, ''));
}

class _Map extends BaseType {

	static withDefault(){
		return BaseType.withDefault.apply(this, arguments);
	}

	static defaults() { return new Map(); }

	static _allowIterable(iterable, options){
		for (let [key,value] of iterable) {
			if(options && options.subTypes &&
				(!generics.getMatchingType(options.subTypes.key, key) || !generics.getMatchingType(options.subTypes.value, value))){
				return false;
			}
		}
		return true;
	}

	static allowPlainVal(value){
		if (super.allowPlainVal(value)){
			return true;
		}
		if(isIterable(value)){
			return this._allowIterable(value, this.options);
		}
		if (value instanceof Object && options && options.subTypes && generics.doOnType(options.subTypes.key, type => type === String)){
			return this._allowIterable(entries(value), this.options);
		}
		return false;
	}

	static _wrapEntryKey(key, options, lifeCycle, errorContext) {
		var result = generics.doOnType(options.subTypes.key, type => {
			if(type.validateType(key) || type.allowPlainVal(key)){
				return validateAndWrap(key, type, lifeCycle,errorContext);
			}
		});
		if(null === result || undefined === result) {
			var allowedTypes = generics.toString(options.subTypes.key);
			MAILBOX.post(errorContext.level, misMatchMessage(errorContext,allowedTypes,key,null,'key'));
		} else {
			return result;
		}
	}

	static _wrapEntryValue(value, options, lifeCycle, errorContext) {
		var result = generics.doOnType(options.subTypes.value, type => {
			if(type.validateType(value) || type.allowPlainVal(value)){
				return validateAndWrap(value, type, lifeCycle,errorContext);
			}
		});
		if(null === result || undefined === result) {
			var allowedTypes = generics.toString(options.subTypes.value);
			MAILBOX.post(errorContext.level, misMatchMessage(errorContext,allowedTypes,value,null,'value'));
		} else {
			return result;
		}
	}

	static _wrapIterable(iterable, options, lifeCycle, errorContext) {
		var result = new Map();
		for (let [key,value] of iterable) {
			key = this._wrapEntryKey(key, options, lifeCycle, errorContext);
			value = this._wrapEntryValue(value, options, lifeCycle, errorContext);
			result.set(key, value);
		}
		return result;
	}

	static wrapValue(value, spec, options, errorContext) {
		if(BaseType.validateType(value)) {
			if (value.__value__ instanceof Map) {
				return this._wrapIterable(value.__value__, options, null, errorContext);
			} else {
				MAILBOX.error('Strange typorama Map encountered\n __value__:' + JSON.stringify(value.__value__) + '\ninstance: ' + JSON.stringify(value));
			}
		}
		if(isIterable(value)){
			return this._wrapIterable(value, options, null,errorContext);
		}
		if (value instanceof Object && isTypeConpatibleWithPlainJsonObject(options)){
			return this._wrapIterable(entries(value), options, null, errorContext);
		}
		MAILBOX.error('Unknown or incompatible Map value : ' + JSON.stringify(value));
	}

	static reportDefinitionErrors(options){
		if(options.definitionError)
		{
			return options.definitionError;
		}
		if (!options || !options.subTypes || !options.subTypes.key || !options.subTypes.value) {
			return {path:arrow+'Map',message:`Untyped Maps are not supported please state types of key and value in the format core3.Map<string, string>`}
		} else {
			var keyError = generics.reportDefinitionErrors(options.subTypes.key, BaseType.reportFieldDefinitionError,'key')
			var valueTypeError = generics.reportDefinitionErrors(options.subTypes.value, BaseType.reportFieldDefinitionError, 'value')
			if(keyError){
				var valueTypeStr = valueTypeError ? 'value' : generics.toUnwrappedString(options.subTypes.value);
				return {path:`Map<${keyError.path || arrow+generics.toUnwrappedString(options.subTypes.key)},${valueTypeStr}`,message:keyError.message};
			}else if(valueTypeError){
				var keyTypeStr =  generics.toUnwrappedString(options.subTypes.key);
				return {path:`Map<${keyTypeStr},${valueTypeError.path|| arrow+generics.toUnwrappedString(options.subTypes.value)}>`,message:valueTypeError.message};
			}
		}
	}
	static of(key, value) {
		var definitionError;
		switch (arguments.length){
			case 0:
				definitionError = {path:arrow+'Map',message:'Missing types for map. Use Map<SomeType, SomeType>'};
				break;
			case 1:
				key = generics.normalizeTypes(key);
				definitionError = {path:`Map<${generics.toUnwrappedString(key)},${arrow}value>`,message:`Wrong number of types for map. Instead of Map${generics.toString(key)} Use Map${generics.toString(String, key)}`};
				break;
			case 2:
				key = generics.normalizeTypes(key);
				value = generics.normalizeTypes(value);
				break;
			default:
				key = generics.normalizeTypes(key);
				value = generics.normalizeTypes(value);
				definitionError = {path:`Map<${generics.toUnwrappedString(key)},${generics.toUnwrappedString(value)},${arrow}unallowed>`,message:`Too many types for map (${arguments.length}). Use Map<SomeType, SomeType>`};
		}
		return this.withDefault(undefined, undefined, {subTypes: {key, value},definitionError:definitionError});

	};


	static createErrorContext(entryPoint, level, options){
		return {
			entryPoint,
			level,
			path:'Map'+generics.toString(options.subTypes.key,options.subTypes.value)
		}
	}

	constructor(value=[], options={subTypes:{}} , errorContext=null) {
		if(!errorContext){
			errorContext  = _Map.createErrorContext('Map constructor error','error', options);
		}

		const report = _Map.reportDefinitionErrors(options);
		if(report){

			MAILBOX.error('Map constructor: "'+ report.path+'" ' +report.message);
		} else {
			options.subTypes.key = generics.normalizeTypes(options.subTypes.key);
			options.subTypes.value = generics.normalizeTypes(options.subTypes.value);
		}
		super(value, options,errorContext);
	}

	__exposeInner__(item){
		if (this.__isReadOnly__) {
			return safeAsReadOnlyOrArr(item);
		}
		return item;
	}

	// for now due to transpiler es6 support we just return an array
	__wrapIterator__(innerIterator) {
		const resultArr = [];
		for (let e of innerIterator){
			resultArr.push(e);
		}
		return this.__isReadOnly__? resultArr.map(safeAsReadOnlyOrArr) : resultArr;
	}

	clear() {
		if(this.$setDirty()) {
			this.__value__.clear();
		}
	}

	delete(key) {
		if(this.$setDirty()) {
			let errorContext = this.constructor.createErrorContext('Map delete error','error', this.__options__);
			key = this.constructor._wrapEntryKey(key, this.__options__, this.__lifecycleManager__, errorContext);
			return !! this.__value__.delete(key);
		}
		return false;
	}

	set(key, value) {
		if(this.$setDirty()){
			let errorContext = this.constructor.createErrorContext('Map set error','error', this.__options__);
			key = this.constructor._wrapEntryKey(key, this.__options__, this.__lifecycleManager__, errorContext);
			value = this.constructor._wrapEntryValue(value, this.__options__, this.__lifecycleManager__, errorContext);
			this.__value__.set(key, value);
		}
		return this;
	}

	get(key) {
		let errorContext = this.constructor.createErrorContext('Map get error','error', this.__options__);
		key = this.constructor._wrapEntryKey(key, this.__options__, null, errorContext);
		return this.__exposeInner__(this.__value__.get(key));
	}

	has(key) {
		let errorContext = this.constructor.createErrorContext('Map has error','error', this.__options__);
		key = this.constructor._wrapEntryKey(key, this.__options__, null, errorContext);
		return !! this.__value__.has(key);
	}

	entries(){
		return this.__wrapIterator__(this.__value__.entries());
	}

	keys(){
		return this.__wrapIterator__(this.__value__.keys());
	}

	values(){
		return this.__wrapIterator__(this.__value__.values());
	}

	forEach(callback, thisArg){
		if (thisArg){
			callback = callback.bind(thisArg);
		}
		this.__value__.forEach((value, key) => {
			callback(this.__exposeInner__(value), this.__exposeInner__(key), this);
		}, thisArg);
	}

	$getElements(){
		let result = [];
		for (let [key,value] of this.__value__.entries()) {
			result.push(key,value);
		}
		return result;
	}

	toJSON(recursive = true) {
		let result = [];
		let allStringKeys = isTypeConpatibleWithPlainJsonObject(this.__options__);
		for (let [key,value] of this.__value__.entries()) {
			key = (recursive && key && BaseType.validateType(key)) ? key.toJSON(true) : this.__exposeInner__(key);
            value = (recursive && value && BaseType.validateType(value)) ? value.toJSON(true) : this.__exposeInner__(value);
			result.push([key,value]);
			allStringKeys = (allStringKeys && typeof key === 'string');
		}
		return allStringKeys ? _.fromPairs(result) : result;
	}

	/**
	 * get iterator over all map keys and values that are dirtyable
	 */
	// consider optimizing if array is of primitive type only
	$dirtyableElementsIterator(yielder) {
		for (let key of this.__value__.keys()) {
			if (key && _.isFunction(key.$calcLastChange)) {
				yielder(this, key);
			}
		}
		for (let value of this.__value__.values()) {
			if (value && _.isFunction(value.$calcLastChange)) {
				yielder(this, value);
			}
		}
	}
}

export default defineType('Map',{
	spec: function() {
		return {
			size: Number.withDefault(0)
		};
	}
}, null, _Map);

