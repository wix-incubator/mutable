(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    }
})(function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    // immutable enum type for fuzzy-logic dirty flag
    var dirty = {
        yes: {
            isDirty: true,
            isKnown: true
        },
        no: {
            isDirty: false,
            isKnown: true
        },
        unKnown: {
            isKnown: false
        }
    };
    exports.dirty = dirty;
});
//# sourceMappingURL=lifecycle.js.map