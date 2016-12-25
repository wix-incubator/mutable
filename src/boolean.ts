import {_PrimitiveBase} from './primitive-base';
import {validateNullValue} from './validation';
import {Type} from "./types";

export default (class _Boolean extends _PrimitiveBase {
    static id = 'boolean';
    static defaults() { return false; }
    static validate(this:Type<boolean, boolean>, v:any) {
        return typeof v === 'boolean' || validateNullValue(this, v);
    }
    static validateType(this:Type<boolean, boolean>, value:any) {
        return this.validate(value);
    }
    constructor(value?:boolean) {
        super();
        return Boolean(value);
    }
}) as any as Type<boolean, boolean>;
