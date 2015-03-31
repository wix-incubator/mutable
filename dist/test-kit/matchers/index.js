(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "module", "./dataTypeMatchers", "./dataInstanceMatchers"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
        factory(exports, module, require("./dataTypeMatchers"), require("./dataInstanceMatchers"));
    }
})(function (exports, module, _dataTypeMatchers, _dataInstanceMatchers) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var dataTypeMatchers = _interopRequire(_dataTypeMatchers);

    var dataInstanceMatchers = _interopRequire(_dataInstanceMatchers);

    module.exports = function (chai, utils) {
        dataTypeMatchers(chai, utils);
        dataInstanceMatchers(chai, utils);
    };
});
//# sourceMappingURL=index.js.map