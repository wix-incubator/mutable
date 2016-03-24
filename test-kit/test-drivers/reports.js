var untypedList = 'Untyped Lists are not supported please state type of list item in the format core3.List<string>';
var reserved = 'is a reserved field.';


export function ERROR_IN_SET(path,fieldType,passedType){
	return {level:'error',params:`Set error: "${path}" expected type ${fieldType} but got ${passedType}`}
}
export function ERROR_IN_SET_VALUE(path,fieldType,passedType){
	return {level:'error',params:`setValue error: "${path}" expected type ${fieldType} but got ${passedType}`};
}
export function ERROR_IN_DEFAULT_VALUES(path,fieldType,passedType){
	return {level:'fatal',params:`Type definition error: "${path}" expected type ${fieldType} but got ${passedType}`};
}
export function ERROR_IN_FIELD_TYPE(path){
	return {level:'fatal',params:`Type definition error: "${path}" must be a primitive type or extend core3.Type`};
}
export function ERROR_MISSING_GENERICS(path){
	return {level:'fatal',params:`Type definition error: "${path}" ${untypedList}`};
}
export function ERROR_RESERVED_FIELD(path){
	return {level:'fatal',params:`Type definition error: "${path}" ${reserved}`};
}
export function ERROR_OVERRIDE_FIELD(path,superName){
	return `Type definition error: "${path}" already exists on super ${superName}`;
}
export function ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR(path,fieldType,passedType){
	return {level:'error',params:`Type constructor error: "${path}" expected type ${fieldType} but got ${passedType}`}
}
export function ERROR_FIELD_MISMATCH_IN_LIST_CONSTRUCTOR(path,fieldType,passedType){
	return ERROR_FIELD_MISMATCH_IN_LIST_METHOD('constructor', path,fieldType,passedType);
}
export function ERROR_FIELD_MISMATCH_IN_LIST_METHOD(method, path,fieldType,passedType){
	return {level:'error',params:`List ${method} error: "${path}" expected type ${fieldType} but got ${passedType}`}
}
export function ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR(path,fieldType,passedType){
	return {level:'error',params:`Map constructor error: "${path}" expected value of type ${fieldType} but got ${passedType}`}
}
export function ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR(path,keyType,passedType){
	return ERROR_KEY_MISMATCH_IN_MAP_METHOD('constructor', path,keyType,passedType);
}
export function ERROR_KEY_MISMATCH_IN_MAP_METHOD(method, path, keyType, passedType){
	return {level:'error',params:`Map ${method} error: "${path}" expected key of type ${keyType} but got ${passedType}`}
}
export function ERROR_VALUE_MISMATCH_IN_MAP_METHOD(method, path, keyType, passedType){
	return {level:'error',params:`Map ${method} error: "${path}" expected value of type ${keyType} but got ${passedType}`}
}
export const arrow = String.fromCharCode(10144);
