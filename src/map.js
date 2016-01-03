/**
 * Created by amira on 29/12/15.
 */
import defineType         from './defineType';
import {getMailBox}       from 'gopostal';
import BaseType           from './BaseType';
import {getValueTypeName} from './utils';
import Number             from './number';
import String             from './string';
import * as generics      from './genericTypes';
import {
	validateAndWrap,
	validateNullValue}    from './validation';


const MAILBOX = getMailBox('Typorama.Map');

// because Object.entries is too tall an order
function entries(obj) {
	return Object.keys(obj).map((key)=>[key, obj[key]]);
}

function safeAsReadOnly (item) {
	return (item.$asReadOnly) ? item.$asReadOnly() : item;
}

function isIterable(value) {
	return value && (_.isArray(value) || value instanceof Map || typeof value[Symbol.iterator] === "function");

}

class _Map extends BaseType {

	static withDefault(){
		return BaseType.withDefault.apply(this, arguments);
	}

	static defaults() { return new Map(); }

	static _allowIterable(iterable, options){
		for (let [key,value] of iterable) {
			if(!generics.getMatchingType(options.subTypes.key, key) || ! generics.getMatchingType(options.subTypes.value, value)){
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
			reportMisMatchError(errorContext,allowedTypes,key);
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
			reportMisMatchError(errorContext,allowedTypes,value);
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
		if (value instanceof Object && options && options.subTypes && generics.getMatchingType(options.subTypes.key, '')){
			return this._wrapIterable(entries(value), options, null, errorContext);
		}
		MAILBOX.error('Unknown or incompatible Map value : ' + JSON.stringify(value));
	}

	static reportDefinitionErrors(options){
		if (!options || !options.subTypes || !options.subTypes.key || !options.subTypes.value) {
			return {path:'',message:`Untyped Maps are not supported please state types of key and value in the format core3.Map<string, string>`}
		} else {
			return generics.reportDefinitionErrors(options.subTypes.key, BaseType.reportFieldDefinitionError,'key')|| generics.reportDefinitionErrors(options.subTypes.value, BaseType.reportFieldDefinitionError);
		}
	}
	static of(key, value) {
		if (key && value) {
			return this.withDefault(undefined, undefined, {subTypes: {key, value}});
		} else {
			// error. build most appropriate message
			switch (arguments.length){
				case 0:
					MAILBOX.error('Missing types for map. Use Map<SomeType, SomeType>');
					break;
				case 1:
					key = generics.normalizeTypes(key);
					MAILBOX.error(`Wrong number of types for map. Instead of Map${generics.toString(key)} Use Map${generics.toString(String, key)}`);
					break;
				case 2:
					key = generics.normalizeTypes(key);
					value = generics.normalizeTypes(value);
					MAILBOX.error(`Illegal key type for map : Map${generics.toString(key, value)}`);
					break;
				default:
					MAILBOX.error(`Too many types for map (${arguments.length}). Use Map<SomeType, SomeType>`);

			}
		}
	};

	constructor(value=[], options={subTypes:{}} , errorContext=null) {
		if(!errorContext){
			errorContext  = BaseType.createErrorContext('Map constructor error','error');
			errorContext.path = 'Map'+generics.toString(options.subTypes.key,options.subTypes.value)
		}

		const report = _Map.reportDefinitionErrors(options);
		if(report){
			MAILBOX.error('Map constructor: '+ report.path +report.message);
		} else {
			options.subTypes.key = generics.normalizeTypes(options.subTypes.key);
			options.subTypes.value = generics.normalizeTypes(options.subTypes.value);
		}
		super(value, options,errorContext);
	}

	set(key, value) {
		if(this.$setDirty()){
			key = this.constructor._wrapEntryKey(key, this.__options__, this.__lifecycleManager__);
			value = this.constructor._wrapEntryValue(value, this.__options__, this.__lifecycleManager__);
			this.__value__.set(key, value);
		}
		return this;
	}

	get(key) {
		var item = this.__value__.get(key);
		return (BaseType.validateType(item) && this.__isReadOnly__) ? item.$asReadOnly() : item;
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
		for (let [key,value] of this.__value__.entries()) {
			key = (recursive && key && BaseType.validateType(key)) ? key.toJSON(true) : key;
			value = (recursive && value && BaseType.validateType(value)) ? value.toJSON(true) : value;
			result.push([key,value]);
		}
		return result;
	}

	/**
	 * get iterator over all map keys and values that are dirtyable
	 */
	// consider optimizing if array is of primitive type only
	$dirtyableElementsIterator(yielder) {
		for (let key of this.__value__.keys()) {
			if (key && _.isFunction(key.$calcLastChange)) {
				yielder(key);
			}
		}
		for (let value of this.__value__.values()) {
			if (value && _.isFunction(value.$calcLastChange)) {
				yielder(value);
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

