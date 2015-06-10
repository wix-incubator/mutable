import defineType from './defineType'
import BaseType from './BaseType'
import PrimitiveBase from './PrimitiveBase'
import stringType from './string'
import booleanType from './boolean'
import numberType from './number'
import arrayType from './array'
import functionType from './function'
import defineEnum from "./defineEnum";
import { LifeCycleManager } from "./lifecycle";
import {either} from './composite'

export default {
    define: defineType,
    BaseType: BaseType,
	PrimitiveBase: PrimitiveBase,
    String: stringType,
    Boolean: booleanType,
    Number: numberType,
    Array: arrayType,
    Function: functionType,
    defineEnum,
    LifeCycleManager,
    either
};
