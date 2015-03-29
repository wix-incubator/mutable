(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "module", "../../src"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
        factory(exports, module, require("../../src"));
    }
})(function (exports, module, _src) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var Typorama = _interopRequire(_src);

    module.exports = function (spec) {
        var displayName = arguments[1] === undefined ? "unknown" : arguments[1];

        var createSpec = typeof spec === "function" ? spec : function () {
            return spec;
        };

        return Typorama.define(displayName, {
            spec: createSpec
        });
    };
});
//# sourceMappingURL=aDataTypeWithSpec.js.map