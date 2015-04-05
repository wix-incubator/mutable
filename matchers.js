(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./dist/test/matchers"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./dist/test/matchers"));
  }
})(function (exports, _distTestMatchers) {
  "use strict";
});
