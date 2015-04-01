import defineType from './defineType'
import BaseType from './BaseType'
import stringType from './string'
import numberType from './number'
import arrayType from './array'
import functionType from './function'

export default {
    define: defineType,
    BaseType: BaseType,
    String: stringType,
    Number: numberType,
    Array: arrayType,
    Function: functionType
};
