(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "lodash", "./BaseType"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("lodash"), require("./BaseType"));
    }
})(function (exports, _lodash, _BaseType) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    exports.generateTest = generateTest;
    exports.generateFieldsOn = generateFieldsOn;
    exports.generateWithDefault = generateWithDefault;
    exports.generateWithDefaultForSysImmutable = generateWithDefaultForSysImmutable;
    exports.generateGetDefaultValue = generateGetDefaultValue;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _ = _interopRequire(_lodash);

    var BaseType = _interopRequire(_BaseType);

    function generateTest() {
        // ToDo: check if its better jit-wise to move the spec to the closure: generateTestForSpec(spec)
        return function (val) {
            return Object.keys(this._spec).every(function (key) {
                return this._spec[key].test(val[key]);
            }, this);
        };
    }

    function generateFieldsOn(obj, fieldsDefinition) {
        _.forEach(fieldsDefinition, function (fieldDef, fieldName) {
            if (obj[fieldName]) {
                throw new Error("fields that starts with $ character are reserved \"" + obj.constructor.displayName + "." + fieldName + "\".");
            }
            Object.defineProperty(obj, fieldName, {
                get: function get() {
                    if (this.__isReadOnly__) {
                        return fieldDef.type.prototype instanceof BaseType ? this.__value__[fieldName].$asReadOnly() : this.__value__[fieldName];
                    } else {
                        return this.__value__[fieldName];
                    }
                },
                set: function set(newValue) {
                    this.__isInvalidated__ = true;

                    if (this.__isReadOnly__) {
                        console.warn("try to set value to readonly field: ", this.constructor.displayName + "." + fieldName, "=", newValue);
                    } else if (fieldDef.type.prototype instanceof BaseType) {
                        this.__value__[fieldName].setValue(newValue);
                    } else {
                        this.__value__[fieldName] = newValue;
                    }
                },
                enumerable: true,
                configurable: false
            });
        });
    }

    function generateWithDefault() {
        return function withDefault(defaults, test, options) {
            options = options || this.options;
            var def = defaults ? function () {
                return _.clone(defaults, true);
            } : this.defaults;

            function typeWithDefault(value, isReadOnly, options) {
                return typeWithDefault.type.create(value, isReadOnly, typeWithDefault.options || options);
            }

            typeWithDefault.type = this.type || this;
            typeWithDefault.test = test || this.test;
            typeWithDefault.withDefault = withDefault; //.bind(this);
            typeWithDefault.defaults = def;
            typeWithDefault.options = options;
            typeWithDefault.wrapValue = this.wrapValue;
            typeWithDefault.create = this.create;
            return typeWithDefault;
        };
    }

    function generateWithDefaultForSysImmutable(Type) {
        return function withDefault(defaults, test) {

            var def = defaults ? function () {
                return defaults;
            } : this.defaults;

            function typeWithDefault(value, isReadOnly) {
                return Type(value);
            }
            typeWithDefault.type = this.type;
            typeWithDefault.test = test || this.test;
            typeWithDefault.withDefault = this.withDefault; //.bind(this);
            typeWithDefault.defaults = def;
            typeWithDefault.wrapValue = Type;
            typeWithDefault.create = this.create;
            return typeWithDefault;
        };
    }

    function generateGetDefaultValue() {
        return function () {
            var spec = this._spec;
            var args = arguments;
            return Object.keys(this._spec).reduce(function (val, key) {
                var fieldSpec = spec[key];
                val[key] = fieldSpec.defaults.apply(fieldSpec, args);
                return val;
            }, {});
        };
    }
});
//# sourceMappingURL=defineTypeUtils.js.map