import _ from "lodash"
import BaseType from "./BaseType"

export default (typeDefinition) => {
    var id = typeDefinition.id;
    var constructor = typeDefinition.constructor;

    constructor.getFieldsDesc = () => {
        return _.clone(typeDefinition.fields, true);
    };

    constructor.prototype = Object.create(BaseType.prototype);

    generateFieldsOn(constructor.prototype, typeDefinition.fields);

    return constructor;
};

function generateFieldsOn(obj, fieldsDefinition){
    _.forEach(fieldsDefinition, (fieldDef, fieldName) => {
        Object.defineProperty(obj, fieldName, {
            get: fieldDef.type.getterFactory(fieldName),
            set: fieldDef.type.setterFactory(fieldName),
            enumerable:true,
            configurable:false
        });
    });
}