(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "module", "lodash"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
        factory(exports, module, require("lodash"));
    }
})(function (exports, module, _lodash) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var _ = _interopRequire(_lodash);

    function createReadOnly(source) {
        var readOnlyInstance = Object.create(source);
        readOnlyInstance.__isReadOnly__ = true;
        readOnlyInstance.constructor = source.constructor;
        return readOnlyInstance;
    }

    var BaseType = (function () {
        function BaseType(value) {
            var options = arguments[1] === undefined ? {} : arguments[1];

            _classCallCheck(this, BaseType);

            this.__isReadOnly__ = false;
            this.__readOnlyInstance__ = createReadOnly(this);
            this.__isInvalidated__ = -1;
            this.__options__ = options;
            this.__value__ = this.constructor.wrapValue(value === undefined ? this.constructor.defaults() : value, this.constructor._spec, options);
        }

        _createClass(BaseType, {
            setValue: {
                value: function setValue(newValue) {
                    var _this = this;

                    this.__isInvalidated__ = true;
                    if (newValue instanceof BaseType) {
                        newValue = newValue.toJSON();
                    }
                    _.forEach(newValue, function (fieldValue, fieldName) {
                        _this[fieldName] = fieldValue;
                    });
                }
            },
            $asReadOnly: {
                value: function $asReadOnly() {
                    return this.__readOnlyInstance__;
                }
            },
            $isInvalidated: {
                value: function $isInvalidated() {
                    var _this = this;

                    if (this.__isInvalidated__ === -1) {
                        var invalidatedField = _.find(this.constructor._spec, function (fieldDef, fieldName) {
                            if (fieldDef.type.prototype instanceof BaseType) {
                                return _this.__value__[fieldName].$isInvalidated();
                            }
                        });
                        if (invalidatedField) {
                            this.__isInvalidated__ = true;
                        } else {
                            this.__isInvalidated__ = false;
                        }
                    }
                    return this.__isInvalidated__;
                }
            },
            $revalidate: {
                value: function $revalidate() {
                    var _this = this;

                    this.__isInvalidated__ = -1;
                    _.forEach(this.constructor._spec, function (fieldDef, fieldName) {
                        if (fieldDef.type.prototype instanceof BaseType) {
                            _this.__value__[fieldName].$revalidate();
                        }
                    });
                }
            },
            $resetValidationCheck: {
                value: function $resetValidationCheck() {
                    var _this = this;

                    this.__isInvalidated__ = this.__isInvalidated__ || -1;
                    _.forEach(this.constructor._spec, function (fieldDef, fieldName) {
                        if (fieldDef.type.prototype instanceof BaseType) {
                            _this.__value__[fieldName].$resetValidationCheck();
                        }
                    });
                }
            },
            toJSON: {
                value: function toJSON() {
                    var _this = this;

                    return Object.keys(this.constructor._spec).reduce(function (json, key) {
                        var fieldValue = _this.__value__[key];
                        json[key] = fieldValue.toJSON ? fieldValue.toJSON() : fieldValue;
                        return json;
                    }, {});
                }
            }
        }, {
            create: {
                value: function create(value, options) {
                    return new this(value, options);
                }
            },
            wrapValue: {
                value: function wrapValue(value, spec, options) {
                    Object.keys(spec).forEach(function (key) {
                        var fieldValue = value[key] !== undefined ? value[key] : spec[key].defaults();
                        value[key] = spec[key].type.create(fieldValue, spec[key].options);
                    });
                    return value;
                }
            }
        });

        return BaseType;
    })();

    module.exports = BaseType;
});
//# sourceMappingURL=BaseType.js.map