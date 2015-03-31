(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "module", "lodash", "../../src"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
        factory(exports, module, require("lodash"), require("../../src"));
    }
})(function (exports, module, _lodash, _src) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var _ = _interopRequire(_lodash);

    var Typorama = _interopRequire(_src);

    module.exports = function (chai, utils) {

        chai.Assertion.addProperty("dataInstance", function () {
            var instance = this._obj;
            return new DataInstanceAssertion(instance);
        });

        var DataInstanceAssertion = (function (_chai$Assertion) {
            function DataInstanceAssertion() {
                _classCallCheck(this, DataInstanceAssertion);

                if (_chai$Assertion != null) {
                    _chai$Assertion.apply(this, arguments);
                }
            }

            _inherits(DataInstanceAssertion, _chai$Assertion);

            _createClass(DataInstanceAssertion, {
                fields: {
                    value: function fields(expectFunction) {
                        var _this = this;

                        var instance = this._obj;
                        var fieldsSpec = instance.constructor.getFieldsSpec();

                        _.forEach(fieldsSpec, function (fieldSpec, fieldName) {
                            expectFunction(new DataInstanceFieldAssertion({
                                value: instance[fieldName],
                                name: fieldName,
                                spec: fieldSpec
                            }, _this));
                        });

                        return new DataInstanceAssertion(instance);
                    }
                }
            });

            return DataInstanceAssertion;
        })(chai.Assertion);

        var DataInstanceFieldAssertion = (function (_chai$Assertion2) {
            function DataInstanceFieldAssertion() {
                _classCallCheck(this, DataInstanceFieldAssertion);

                if (_chai$Assertion2 != null) {
                    _chai$Assertion2.apply(this, arguments);
                }
            }

            _inherits(DataInstanceFieldAssertion, _chai$Assertion2);

            _createClass(DataInstanceFieldAssertion, {
                defaultValue: {
                    value: (function (_defaultValue) {
                        var _defaultValueWrapper = function defaultValue() {
                            return _defaultValue.apply(this, arguments);
                        };

                        _defaultValueWrapper.toString = function () {
                            return _defaultValue.toString();
                        };

                        return _defaultValueWrapper;
                    })(function () {
                        var field = this._obj;
                        var defaultValue = field.spec.defaults();

                        this.assert(field.value === defaultValue, "expected field \"" + field.name + "\" to be the default value but got #{act}", "expected field \"" + field.name + "\" not to be the default value but got #{act}", defaultValue, field.value, true);

                        return new DataInstanceFieldAssertion(field);
                    })
                }
            });

            return DataInstanceFieldAssertion;
        })(chai.Assertion);
    };
});
//# sourceMappingURL=dataInstanceMatchers.js.map