/**
 * Created by amira on 29/12/15.
 */
import defineType         from './defineType';
import {getMailBox}       from 'gopostal';
import BaseType           from './BaseType';
import Number             from './number';
import String             from './string';
import * as generics      from './genericTypes';
import {
	validateAndWrap,
	validateNullValue}    from './validation';


const MAILBOX = getMailBox('Typorama.Map');

// avoid crashing if symbol namespace does not exist
if(typeof Symbol === 'undefined'){
	var Symbol = {iterator:'iterator'}; // using var, to define in the global scope
}

// because Object.entries is too tall an order
function entries(obj) {
	return Object.keys(obj).map((key)=>[key, obj[key]]);
}

function safeAsReadOnly (item) {
	return (item.$asReadOnly) ? item.$asReadOnly() : item;
}

function isIterable(value) {
	return value && typeof value[Symbol.iterator] === "function";

}

class _Map extends BaseType {

	static withDefault(){
		return BaseType.withDefault.apply(this, arguments);
	}

	static defaults() { return new Map(); }

	static _wrapKey(key, options, lifeCycle) {
		var result = generics.doOnType(options.subTypes.key, type => validateAndWrap(key, type, lifeCycle));
		if(null === result || undefined === result) {
			MAILBOX.error('Illegal key '+key+' of type '+getValueTypeName(key)+' for Map of type '+ generics.toString(options.subTypes.key, options.subTypes.value));
		} else {
			return result;
		}
	}

	static _wrapValue(value, options, lifeCycle) {
		var result = generics.doOnType(options.subTypes.value, type => validateAndWrap(value, type, lifeCycle));
		if(null === result || undefined === result) {
			MAILBOX.error('Illegal value '+value+' of type '+getValueTypeName(value)+' for Map of type '+ generics.toString(options.subTypes.key, options.subTypes.value));
		} else {
			return result;
		}
	}

	static _wrapIterable(iterable, options, lifeCycle) {
		var result = new Map();
		for (let [key,value] of iterable) {
			key = this._wrapKey(key, options, lifeCycle);
			value = this._wrapValue(value, options, lifeCycle);
			result.set(key, value);
		}
		return result;
	}

	static wrapValue(value, spec, options) {
		if(BaseType.validateType(value)) {
			if (value.__value__ instanceof Map) {
				return this._wrapIterable(value.__value__, options);
			} else {
				MAILBOX.error('Strange typorama Map encountered\n __value__:' + JSON.stringify(value.__value__) + '\ninstance: ' + JSON.stringify(value));
			}
		} else if(isIterable(value)){
			return this._wrapIterable(value, options);
		} else if (options && options.subTypes && generics.doOnType(options.subTypes.key, type => type === String)){
			return this._wrapIterable(entries(value), options);
		} else {
			MAILBOX.error('Unknown or incompatible Map value : ' + JSON.stringify(value));
		}
	}

	static reportDefinitionErrors(value, options){
		if (!options || !options.subTypes || !options.subTypes.key || !options.subTypes.value) {
			return {path:'',message:`Untyped Maps are not supported please state types of key and value in the format core3.Map<string, string>`}
		} else {
			return generics.reportDefinitionErrors(options.subTypes.key, BaseType.reportFieldError) ||
				generics.reportDefinitionErrors(options.subTypes.value, BaseType.reportFieldError);
		}
	}

	static of(key, value) {
		if (key && value) {
			// todo union types
			return this.withDefault(undefined, undefined, {subTypes: {key, value}});
		} else {
			MAILBOX.error('Wrong number of types for map. Use Map<SomeType, SomeType>');
		}
	};


	constructor(value=[], options={}) {
		const report = _Map.reportDefinitionErrors(value, options);
		if(report){
			MAILBOX.error('Map constructor: '+report.message);
		} else {
			options.subTypes.key = generics.normalizeTypes(options.subTypes.key);
			options.subTypes.value = generics.normalizeTypes(options.subTypes.value);
		}
		super(value, options);
	}
}

export default defineType('Map',{
	spec: function() {
		return {
			size: Number.withDefault(0)
		};
	}
}, null, _Map);

