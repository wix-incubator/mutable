(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "./aDataTypeWithSpec"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("./aDataTypeWithSpec"));
    }
})(function (exports, _aDataTypeWithSpec) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var aDataTypeWithSpec = _interopRequire(_aDataTypeWithSpec);

    exports.aDataTypeWithSpec = aDataTypeWithSpec;
});
//# sourceMappingURL=index.js.map