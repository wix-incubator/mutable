import _ from "lodash"
import * as defineTypeUtils from "./defineTypeUtils"
import BaseType from "./BaseType"

export default function(id, typeDefinition, TypeConstructor){

    TypeConstructor = TypeConstructor || function Type(value, options){
        BaseType.call(this, value, options);
    };
    TypeConstructor.id                    = id;
    TypeConstructor.type                  = TypeConstructor;
    TypeConstructor.test                  = TypeConstructor.test || defineTypeUtils.generateTest();
    TypeConstructor.withDefault           = TypeConstructor.withDefault || defineTypeUtils.generateWithDefault();
    TypeConstructor.defaults              = TypeConstructor.defaults || defineTypeUtils.generateGetDefaultValue();
    TypeConstructor.create                = BaseType.create;

    if(!BaseType.prototype.isPrototypeOf(TypeConstructor.prototype)){
        TypeConstructor.prototype             = Object.create(BaseType.prototype);
        TypeConstructor.prototype.constructor = TypeConstructor;
    }

    TypeConstructor.getFieldsSpec         = typeDefinition.spec.bind(null, TypeConstructor);
    TypeConstructor._spec                 = typeDefinition.spec(TypeConstructor);
    TypeConstructor.wrapValue             = TypeConstructor.wrapValue || BaseType.wrapValue;

    defineTypeUtils.generateFieldsOn(TypeConstructor.prototype, TypeConstructor._spec);

    return TypeConstructor;
};

