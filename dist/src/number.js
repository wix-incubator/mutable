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

    var _Number = (function () {
        function _Number(value) {
            _classCallCheck(this, _Number);

            return Number(value);
        }

        _createClass(_Number, null, {
            defaults: {
                value: function defaults() {
                    return 0;
                }
            },
            test: {
                value: function test(v) {
                    return typeof v === "number";
                }
            },
            validateType: {
                value: function validateType(value) {
                    return this.test(value);
                }
            }
        });

        return _Number;
    })();

    module.exports = _Number;

    _Number.type = _Number;
    _Number.create = Number;
    _Number.withDefault = generateWithDefaultForSysImmutable(Number);
});
//# sourceMappingURL=number.js.map