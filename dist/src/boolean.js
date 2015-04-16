(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "module", "./defineTypeUtils"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
        factory(exports, module, require("./defineTypeUtils"));
    }
})(function (exports, module, _defineTypeUtils) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var generateWithDefaultForSysImmutable = _defineTypeUtils.generateWithDefaultForSysImmutable;

    var _Boolean = (function () {
        function _Boolean(value) {
            _classCallCheck(this, _Boolean);

            return Boolean(value);
        }

        _createClass(_Boolean, null, {
            defaults: {
                value: function defaults() {
                    return false;
                }
            },
            test: {
                value: function test(v) {
                    return typeof v === "boolean";
                }
            },
            validateType: {
                value: function validateType(value) {
                    return this.test(value);
                }
            }
        });

        return _Boolean;
    })();

    module.exports = _Boolean;

    _Boolean.type = _Boolean;
    _Boolean.create = Boolean;
    _Boolean.withDefault = generateWithDefaultForSysImmutable(Boolean);
});
//# sourceMappingURL=boolean.js.map