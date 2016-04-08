import * as _ from 'lodash';

export const clonedMembers = [
    //every type have a type and id
    'id',
    'uniqueId',
    'type',
    //PrimitiveBase
    'create',
    'defaults',
    'validate',
    'allowPlainVal',
    'validateType',
    //PrimitiveBase Mods
    'nullable',
    'withDefault',
    'reportDefinitionErrors',
    'reportSetValueErrors',
    'reportSetErrors',
    //BaseType
    'wrapValue',
    'cloneValue',
    'createErrorContext',
    '_spec'
];

var ClassesCounter = 0;
export function generateClassId() {
    return ClassesCounter++;
}

export function cloneType(TypeToClone) {
    function Type(value, options, errorContext) {
        var mergeOptions = options ? _.assign({}, Type.options, options) : Type.options;
        return TypeToClone.create(value !== undefined ? value : Type.defaults(), mergeOptions, errorContext);
    }
    Type.options = TypeToClone.options ? _.cloneDeep(TypeToClone.options) : {};
    clonedMembers.forEach(member => { Type[member] = TypeToClone[member] });
    return Type;
}

export function getValueTypeName(value) {
    if (value && value.constructor && value.constructor.id) {
        return value.constructor.id
    }
    if (_.isPlainObject(value) && value._type) {
        return value._type
    }
    return typeof value;
}

export function getFieldDef(Type, fieldName) {
    return Type._spec[fieldName];
}


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
