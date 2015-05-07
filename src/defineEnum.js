import _ from "lodash";

function createEnumMember(key, value, proto) {

	var member = Object.create(proto);
	member.key = key;
	member.value = value;
	member.valueOf = () => { return value.valueOf(); };
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

	var EnumType = function() {
		throw new TypeError("Enum cannot be instantiated");
	}

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
	}

	EnumType.validate = function(v) {
		if(v && typeof v === "object" && v.key) {
			return EnumType[v.key] === v;
		}
		return false;
	}

	EnumType.validateType = EnumType.validate;

	EnumType.type = EnumType;
	EnumType.create = function(value) {
		if(EnumType.validate(value)) {
			return value;
		}
		throw new TypeError("Invalid Enum member");
	};

	EnumType.withDefault = function(value) {
		if(EnumType.validate(value)) {
			var t = _.clone(EnumType);
			t.defaults = () => { return value; };
			return t;
		}
		throw new TypeError("Invalid Enum member");
	};

	return EnumType;
}

export default defineEnum;
