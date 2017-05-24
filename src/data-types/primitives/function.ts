import {Any} from '../any';
import {validateNullValue} from '../../core/validation';
import {Type} from "../../types";

function noop() { }

export default class _Function extends Any {
    static id = 'function';
    static defaults() { return noop; }
    static validate(value:any):value is Function {
        return typeof value === 'function' || validateNullValue(this, value) ;
    }
    static validateType(value:any):value is Function {
        return this.validate(value);
    }
    constructor(value:Function) {
        super();
        return _Function.validate(value) ? value : noop;
    }
}

const asType: Type<Function, Function> = _Function;
