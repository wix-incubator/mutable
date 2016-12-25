import {_PrimitiveBase} from './primitive-base';
import {validateNullValue} from './validation';
import {Type, cast} from "./types";

function noop() { }

export default (class _Function extends _PrimitiveBase {
    static id = 'function';
    static defaults() { return noop; }
    static validate(this:Type<Function, Function>, v:any) {
        return typeof v === 'function' || validateNullValue(this, v) ;
    }
    static validateType(this:Type<Function, Function>, value:any) {
        return this.validate(value);
    }
    constructor(value:Function) {
        super();
        return cast<Type<Function, Function>>(_Function).validate(value) ? value : noop;
    }
}) as any as Type<Function, Function>;
