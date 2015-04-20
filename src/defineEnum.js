import {generateWithDefaultForSysImmutable} from "./defineTypeUtils"

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

function defineEnum(def) {

	var EnumType = function() {
		throw TypeError("Enum cannot be instantiated");
	}
;
	if(Array.isArray(def)) {
		var tdef = {};
		def.forEach(function(key) {
			tdef[key] = key;
		});
		def = tdef;
	}

	Object.keys(def).forEach(function(key) {
		EnumType[key] = EnumType[key] = createEnumMember(key, def[key], EnumType.prototype);
	});

	return EnumType;
}

export default defineEnum;
