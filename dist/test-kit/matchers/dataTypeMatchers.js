(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "../../src"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("../../src"));
    }
})(function (exports, _src) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var chai = require("chai");

    var Typorama = _interopRequire(_src);

    var TypeFieldAssertion = (function (_chai$Assertion) {
        function TypeFieldAssertion() {
            _classCallCheck(this, TypeFieldAssertion);

            if (_chai$Assertion != null) {
                _chai$Assertion.apply(this, arguments);
            }
        }

        _inherits(TypeFieldAssertion, _chai$Assertion);

        _createClass(TypeFieldAssertion, {
            defaults: {
                value: (function (_defaults) {
                    var _defaultsWrapper = function defaults(_x) {
                        return _defaults.apply(this, arguments);
                    };

                    _defaultsWrapper.toString = function () {
                        return _defaults.toString();
                    };

                    return _defaultsWrapper;
                })(function (expectedValue) {
                    var field = this._obj;

                    var defaults = field.spec.defaults();

                    this.assert(defaults === expectedValue, "expected field \"" + field.name + "\" defaults to be #{exp} but got #{act}", "expected field \"" + field.name + "\" defaults not to be #{exp} but got #{act}", expectedValue, defaults, true);

                    return new TypeFieldAssertion(field, this);
                })
            },
            type: {
                value: function type(expectedType) {
                    var field = this._obj;

                    this.assert(field.spec.type === expectedType.type, "expected field \"" + field.name + "\" type to be #{exp} but got #{act}", "expected field \"" + field.name + "\" type not to be #{exp} but got #{act}", expectedType.displayName || expectedType, field.spec.type.displayName || field.spec.type, true);

                    return new TypeFieldAssertion(field, this);
                }
            }
        });

        return TypeFieldAssertion;
    })(chai.Assertion);

    chai.Assertion.addMethod("field", function (name) {
        var Type = this._obj;

        this.assert(Typorama.BaseType.prototype.isPrototypeOf(Type.prototype), "expected a Type but got #{act}", "expected not a Type but got #{act}", Typorama.BaseType, Type, true);

        var TypeName = Type.displayName || Type.type;

        var spec = Type.getFieldsSpec()[name];

        this.assert(spec !== undefined, "expected a Type with a field " + name, "expected a Type without a field " + name, name, undefined, true);

        return new TypeFieldAssertion({ spec: spec, name: name });
    });
});
//# sourceMappingURL=dataTypeMatchers.js.map