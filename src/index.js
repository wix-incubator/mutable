import config from './typoramaConfiguration'
import defineType from './defineType'
import BaseType from './BaseType'
import stringType from './string'
import booleanType from './boolean'
import numberType from './number'
import arrayType from './array'
import functionType from './function'
import defineEnum from "./defineEnum";
import { LifeCycleManager } from "./lifecycle";

export default {
	config: config,
    define: defineType,
    BaseType: BaseType,
    String: stringType,
    Boolean: booleanType,
    Number: numberType,
    Array: arrayType,
    Function: functionType,
    defineEnum,
    LifeCycleManager
};
