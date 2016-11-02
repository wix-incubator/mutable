import PrimitiveBase from './primitive-base';
import {validateNullValue} from './validation';
import {registerClass} from './class-repo';

export default class _Number extends PrimitiveBase {
    static defaults() { return 0; }
    static validate(v) { return typeof v === 'number' || validateNullValue(this, v); }

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value) {
        super(value);
        return Number(value);
    }

}

_Number.id = 'number';
registerClass(_Number);
