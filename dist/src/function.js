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

    function noop() {};

    var _Function = (function () {
        function _Function(value) {
            _classCallCheck(this, _Function);

            return _Function.test(value) ? value : noop;
        }

        _createClass(_Function, null, {
            defaults: {
                value: function defaults() {
                    return 0;
                }
            },
            test: {
                value: function test(v) {
                    return typeof v === "function";
                }
            }
        });

        return _Function;
    })();

    module.exports = _Function;

    _Function.type = _Function;

    _Function.create = Object;

    _Function.withDefault = generateWithDefaultForSysImmutable(_Function.create);
});
//# sourceMappingURL=function.js.map