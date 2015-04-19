import {generateWithDefaultForSysImmutable} from "./defineTypeUtils"

function defineEnum(def) {

	if(def instanceof Array) {
		var tdef = {};
		def.forEach(function(key, index) {
			tdef[key] = key;
		});
		def = tdef;
	}

	var EnumType = function() {
		throw TypeError("Enum cannot be instantiated");
	};

	Object.keys(def).forEach(function(key) {

		var EnumMemberType = function() {
			this.__key__ = key;
			this.__value__ = def[key];
			this.valueOf = () => { return def[key]; };

			var _this = this;

			if(def[key] instanceof Object) {
				Object.keys(def[key]).forEach(function(tkey) {
					_this[tkey] = def[key][tkey];
				});
			}
		}

		EnumMemberType.prototype = Object.create(EnumType.prototype);

		EnumType[key] = new EnumMemberType();
		Object.freeze(EnumType[key]);

	});

	return EnumType;
}

export default defineEnum;
