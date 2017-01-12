var untypedList = 'Untyped Lists are not supported please state type of list item in the format core3.List<string>';
var reserved = 'is a reserved field.';

export function ERROR_BAD_TYPE(path, type) {
    return { level: 'error', params: `Type constructor error: "${path}" "${type}" is not inherited correctly. Did you remember to import core3-runtime?` };
}
export function ERROR_IN_SET(path, fieldType, passedType) {
    return { level: 'error', params: `Set error: "${path}" expected type ${fieldType} but got ${passedType}` }
}
export function ERROR_IN_SET_VALUE(path, fieldType, passedType) {
    return { level: 'error', params: `setValue error: "${path}" expected type ${fieldType} but got ${passedType}` };
}
export function ERROR_IN_SET_VALUE_DEEP(path, fieldType, passedType) {
    return { level: 'error', params: `setValueDeep error: "${path}" expected type ${fieldType} but got ${passedType}` };
}
export function ERROR_IN_DEFAULT_VALUES(path, fieldType, passedType) {
    return { level: 'fatal', params: `Type definition error: "${path}" expected type ${fieldType} but got ${passedType}` };
}
export function ERROR_IN_FIELD_TYPE(path) {
    return { level: 'fatal', params: `Type definition error: "${path}" must be a primitive type or extend core3.Type` };
}
export function ERROR_MISSING_GENERICS(path) {
    return { level: 'fatal', params: `Type definition error: "${path}" ${untypedList}` };
}
export function ERROR_RESERVED_FIELD(path) {
    return { level: 'fatal', params: `Type definition error: "${path}" ${reserved}` };
}
export function ERROR_OVERRIDE_FIELD(path, superName) {
    return `Type definition error: "${path}" already exists on super ${superName}`;
}
export function ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR(path, fieldType, passedType) {
    return { level: 'error', params: `Type constructor error: "${path}" expected type ${fieldType} but got ${passedType}` }
}
export function ERROR_FIELD_MISMATCH_IN_LIST_CONSTRUCTOR(path, fieldType, passedType) {
    return ERROR_FIELD_MISMATCH_IN_LIST_METHOD('constructor', path, fieldType, passedType);
}
export function ERROR_FIELD_MISMATCH_IN_LIST_METHOD(method, path, fieldType, passedType) {
    return { level: 'error', params: `List ${method} error: "${path}" expected type ${fieldType} but got ${passedType}` }
}
export function ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR(path, fieldType, passedType, mapType = "Map") {
    return { level: 'error', params: `${mapType} constructor error: "${path}" expected value of type ${fieldType} but got ${passedType}` }
}
export function ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR(path, keyType, passedType, mapType = "Map") {
    return ERROR_KEY_MISMATCH_IN_MAP_METHOD('constructor', path, keyType, passedType, mapType);
}
export function ERROR_KEY_MISMATCH_IN_MAP_METHOD(method, path, keyType, passedType, mapType = "Map") {
    return { level: 'error', params: `${mapType} ${method} error: "${path}" expected key of type ${keyType} but got ${passedType}` }
}
export function ERROR_VALUE_MISMATCH_IN_MAP_METHOD(method, path, keyType, passedType, mapType = "Map") {
    return { level: 'error', params: `${mapType} ${method} error: "${path}" expected value of type ${keyType} but got ${passedType}` }
}
export function ERROR_ATTEMPTING_TO_OVERRIDE_READONLY(readOnlyValue, id, fieldName, newValue){
    return {level:'warn', params:`Attempt to override a read only value ${JSON.stringify(readOnlyValue)} at ${id}.${fieldName} with ${JSON.stringify(newValue)}`}
}
export const arrow = String.fromCharCode(10144);
