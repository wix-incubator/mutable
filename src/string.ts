import {_PrimitiveBase} from './primitive-base';
import {validateNullValue} from './validation';
import {Type} from "./types";

export default (class _String extends _PrimitiveBase {
    static id = 'string';
    static defaults() { return ''; }

    static validate(this:Type<string, string>, v:any) {
        return typeof v === 'string' || validateNullValue(this, v);
    }

    static validateType(this:Type<string, string>, value:any) {
        return this.validate(value);
    }

    constructor(value:string) {
        super();
        return String(value);
    }

}) as any as Type<string, string>;

