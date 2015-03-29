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

    var _String = (function () {
        function _String(value) {
            _classCallCheck(this, _String);

            return String(value);
        }

        _createClass(_String, null, {
            defaults: {
                value: function defaults() {
                    return "";
                }
            },
            test: {
                value: function test(v) {
                    return typeof v === "string";
                }
            }
        });

        return _String;
    })();

    module.exports = _String;

    _String.type = _String;
    _String.create = String;
    _String.withDefault = generateWithDefaultForSysImmutable(String);
});
//# sourceMappingURL=string.js.map