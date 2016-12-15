import * as _ from 'lodash';

var ClassesCounter = 0;
export function generateClassId() {
    return ClassesCounter++;
}

const CLONE_KEY = 'isActiveClone';
export function clone(obj, isDeep = false) {
    if (obj === null || typeof(obj) !== 'object' || CLONE_KEY in obj) {
        return obj;
    }
    const cloned = obj.constructor ? obj.constructor() : {};
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (isDeep) {
                obj[CLONE_KEY] = null;
                cloned[key] = clone(obj[key]);
                delete obj[CLONE_KEY];
            } else {
                cloned[key] = obj[key];
            }
        }
    }
    return cloned;
}

/**
 * js inheritence for configuration override (used for .nullable(), .of(), .withDefault()...)
 */
export function cloneType(TypeToClone) {
    class Type extends TypeToClone{
        static _cloned = TypeToClone._cloned || TypeToClone;
        static options = TypeToClone.options ? clone(TypeToClone.options, true) : {};
        constructor(value, options, errorContext) {
            super(value === undefined ? Type.defaults() : value,
                options ? _.assign({}, Type.options, options) : Type.options,
                errorContext);
        }
    }
    Type.__proto__ = Object.create(TypeToClone);  // inherint non-enumerable static properties
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
