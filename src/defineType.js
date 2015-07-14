import _ from "lodash"
import * as defineTypeUtils from "./defineTypeUtils"
import BaseType from "./BaseType"

/*
 * Called to generate a default value resolver for custom types. The default value resolver is called upon constructing an instance
 * to populate undefined fields
 */
function generateDefaultValueResolver(){
    return function() {
        var spec = this._spec;
        var args = arguments;
        return Object.keys(this._spec).reduce(function (val, key) {
            var fieldSpec = spec[key];
            val[key] = fieldSpec.defaults.apply(fieldSpec, args);
            return val;
        }, {});
    }
}

export default function(id, typeDefinition, TypeConstructor){

    TypeConstructor = TypeConstructor || function Type(value, options){
        BaseType.call(this, value, options);
    };
    TypeConstructor.id                    = id;
    TypeConstructor.type                  = TypeConstructor;
    TypeConstructor.validate              = TypeConstructor.validate || defineTypeUtils.generateValidate();
    TypeConstructor.validateType          = TypeConstructor.validateType || BaseType.validateType;
    TypeConstructor.allowPlainVal          = TypeConstructor.allowPlainVal || BaseType.allowPlainVal;
    TypeConstructor.withDefault           = TypeConstructor.withDefault || defineTypeUtils.withDefault;
    TypeConstructor.nullable              = defineTypeUtils.nullable;
    TypeConstructor._wrapOrNull           = BaseType._wrapOrNull;
    TypeConstructor.defaults              = TypeConstructor.defaults || generateDefaultValueResolver();
    TypeConstructor.create                = BaseType.create;

    var superTypeConstructor = TypeConstructor.prototype.__proto__.constructor;

    if(BaseType.isAssignableFrom(superTypeConstructor.type)){
        TypeConstructor.ancestors             = superTypeConstructor.ancestors.concat([superTypeConstructor.id]);
    } else {
        TypeConstructor.prototype             = Object.create(BaseType.prototype);
        TypeConstructor.prototype.constructor = TypeConstructor;
        TypeConstructor.ancestors             = [BaseType.id];
    }

    TypeConstructor.getFieldsSpec         = typeDefinition.spec.bind(null, TypeConstructor);
    TypeConstructor._spec                 = typeDefinition.spec(TypeConstructor);
    TypeConstructor.wrapValue             = TypeConstructor.wrapValue || BaseType.wrapValue;

    defineTypeUtils.generateFieldsOn(TypeConstructor.prototype, TypeConstructor._spec);

    return TypeConstructor;
};

