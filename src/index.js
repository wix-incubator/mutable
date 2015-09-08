import config from './typoramaConfiguration'
import define from './defineType'
import BaseType from './BaseType'
import PrimitiveBase from './PrimitiveBase'
import String from './string'
import Boolean from './boolean'
import Number from './number'
import Array from './array'
import Function from './function'
import defineEnum from "./defineEnum";
import { LifeCycleManager , revision} from "./lifecycle";
import {either} from './composite'

export default {
	config,
    define,
    BaseType,
	PrimitiveBase,
    String,
    Boolean,
    Number,
    Array,
    Function,
    defineEnum,
    LifeCycleManager,
    either,
    revision
};
