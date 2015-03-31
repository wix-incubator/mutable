(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "./testDrivers/aDataTypeWithSpec", "./matchers"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("./testDrivers/aDataTypeWithSpec"), require("./matchers"));
  }
})(function (exports, module, _testDriversADataTypeWithSpec, _matchers) {
  "use strict";

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var aDataTypeWithSpec = _testDriversADataTypeWithSpec;

  var chaiMatchers = _interopRequire(_matchers);

  module.exports = {
    drivers: { aDataTypeWithSpec: aDataTypeWithSpec },
    chai: chaiMatchers
  };
});
//# sourceMappingURL=index.js.map