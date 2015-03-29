(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./dataTypeMatchers", "./dataInstanceMatchers"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./dataTypeMatchers"), require("./dataInstanceMatchers"));
  }
})(function (exports, _dataTypeMatchers, _dataInstanceMatchers) {
  "use strict";
});
//# sourceMappingURL=index.js.map