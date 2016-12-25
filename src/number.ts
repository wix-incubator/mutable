import {_PrimitiveBase} from './primitive-base';
import {validateNullValue} from './validation';
import {Type} from "./types";

export default (class _Number extends _PrimitiveBase {
    static id = 'number';
    static defaults() { return 0; }
    static validate(this:Type<number, number>, v:any) {
        return typeof v === 'number' || validateNullValue(this, v);
    }
    static validateType(this:Type<number, number>, v:any) {
        return this.validate(v);
    }
    constructor(value:number) {
        super();
        return Number(value);
    }
}) as any as Type<number, number>;
