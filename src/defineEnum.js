import _ from "lodash";
import {generateWithDefaultForSysImmutable} from "./defineTypeUtils"
import BaseType from './BaseType';
import PrimitiveBase from './PrimitiveBase';

function createEnumMember(key, value, proto) {

	var member = Object.create(proto);
	member.key = key;
	member.value = value;
	member.toString = function(){ return value.toString(); };
	member.valueOf = function(){ return value.valueOf(); };
	if(value instanceof Object) {
		Object.keys(value).forEach(function(tkey) {
			member[tkey] = value[tkey];
		});
	}

	return Object.freeze(member);
}

function convertToObject(def){
	var tdef = {};
	def.forEach(function(key) {
		tdef[key] = key;
	});
	return tdef;
}

function defineEnum(def) {

	var EnumType = function(initValue) {
		var key = _.findKey(def, value => value === initValue);
		if(EnumType[key]){
			return EnumType[key];
		}
		throw new TypeError(`Enum must be initialized with value`);
	};

	EnumType.prototype.__proto__ = PrimitiveBase.prototype;

	EnumType.prototype.toJSON = function(){
		return this.value;
	};

	if(Array.isArray(def)) {
	    def = convertToObject(def);
	}

	var defVal = null;
	Object.keys(def).forEach(function(key) { 
		EnumType[key] = EnumType[key] = createEnumMember(key, def[key], EnumType.prototype);
		if(defVal == null) {
			defVal = EnumType[key];
		}
	});

	EnumType.defaults = function() {
		return defVal;
	};

	EnumType.validate = function(v) {
		return (v instanceof EnumType && EnumType[v.key] === v);
	};

	EnumType.validateType = EnumType.validate;
    EnumType.allowPlainVal = function(plainVal){
		return _.includes(def, plainVal);
	};

	EnumType.type = EnumType;
	EnumType.create = BaseType.create;

	EnumType.withDefault = generateWithDefaultForSysImmutable(EnumType);

	return EnumType;
}

export default defineEnum;
