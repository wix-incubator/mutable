import * as _ from 'lodash';

var ClassesCounter = 0;
export function generateClassId() {
    return ClassesCounter++;
}

/**
 * js inheritence for configuration override (used for .nullable(), .of(), .withDefault()...)
 */
export function cloneType(TypeToClone) {
    class Type extends TypeToClone{
        static options = TypeToClone.options ? _.cloneDeep(TypeToClone.options) : {};
        constructor(value, options, errorContext) {
            super(value === undefined ? Type.defaults() : value,
                options ? _.assign({}, Type.options, options) : Type.options,
                errorContext);
        }
    }
    return Type;
}

export function getFieldDef(Type, fieldName) {
    return Type._spec[fieldName];
}

/**
 * used for error message construction, returns the name of the type
 */
export function getReadableValueTypeName(value) {
    if (value === null)
        return 'null';
    if (value === undefined)
        return 'undefined';
    if (value.constructor && value.constructor.id) {
        return value.constructor.id
    } if (typeof value === 'object' && typeof value._type === 'string') {
        return 'object with _type ' + value._type;
    }
    return typeof value;
}
