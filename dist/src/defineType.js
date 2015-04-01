(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "module", "lodash", "./defineTypeUtils", "./BaseType"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
        factory(exports, module, require("lodash"), require("./defineTypeUtils"), require("./BaseType"));
    }
})(function (exports, module, _lodash, _defineTypeUtils, _BaseType) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _ = _interopRequire(_lodash);

    var defineTypeUtils = _defineTypeUtils;

    var BaseType = _interopRequire(_BaseType);

    module.exports = function (displayName, typeDefinition, TypeConstructor) {

        TypeConstructor = TypeConstructor || function Type(value, options) {
            BaseType.call(this, value, options);
        };
        TypeConstructor.displayName = displayName;
        TypeConstructor.type = TypeConstructor;
        TypeConstructor.test = TypeConstructor.test || defineTypeUtils.generateTest();
        TypeConstructor.withDefault = TypeConstructor.withDefault || defineTypeUtils.generateWithDefault();
        TypeConstructor.defaults = TypeConstructor.defaults || defineTypeUtils.generateGetDefaultValue();
        TypeConstructor.create = BaseType.create;

        if (!BaseType.prototype.isPrototypeOf(TypeConstructor.prototype)) {
            TypeConstructor.prototype = Object.create(BaseType.prototype);
            TypeConstructor.prototype.constructor = TypeConstructor;
        }

        TypeConstructor.getFieldsSpec = typeDefinition.spec.bind(null, TypeConstructor);
        TypeConstructor._spec = typeDefinition.spec(TypeConstructor);
        TypeConstructor.wrapValue = TypeConstructor.wrapValue || BaseType.wrapValue;

        defineTypeUtils.generateFieldsOn(TypeConstructor.prototype, TypeConstructor._spec);

        return TypeConstructor;
    };
});
//# sourceMappingURL=defineType.js.map