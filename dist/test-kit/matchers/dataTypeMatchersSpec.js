(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "../../src", "../testDrivers/index", "chai"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("../../src"), require("../testDrivers/index"), require("chai"));
    }
})(function (exports, _src, _testDriversIndex, _chai) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var Typorama = _interopRequire(_src);

    var aDataTypeWithSpec = _testDriversIndex.aDataTypeWithSpec;
    var expect = _chai.expect;
    var err = _chai.err;

    describe("Type matchers", function () {

        describe("Field matcher", function () {

            var UserType = aDataTypeWithSpec({
                name: Typorama.String
            });

            it("should reject types that do not have the requested field", function () {
                expect(function () {
                    expect(UserType).to.have.field("noSuchField");
                }).to["throw"]("expected a Type with a field noSuchField");
            });

            it("should reject objects that are not data types", function () {
                expect(function () {
                    expect({}).to.have.field("");
                }).to["throw"]("expected a Type but got {}");
            });
        });
    });
});
//# sourceMappingURL=dataTypeMatchersSpec.js.map