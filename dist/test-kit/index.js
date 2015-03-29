(function (factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports", "module", "./testDrivers/aDataTypeWithSpec"], factory);
	} else if (typeof exports !== "undefined" && typeof module !== "undefined") {
		factory(exports, module, require("./testDrivers/aDataTypeWithSpec"));
	}
})(function (exports, module, _testDriversADataTypeWithSpec) {
	"use strict";

	var aDataTypeWithSpec = _testDriversADataTypeWithSpec;
	module.exports = {
		drivers: { aDataTypeWithSpec: aDataTypeWithSpec }
	};
});
//# sourceMappingURL=index.js.map