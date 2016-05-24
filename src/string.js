import PrimitiveBase from './primitive-base';
import {validateNullValue} from './validation';

export default class _String extends PrimitiveBase {
    static defaults() { return ''; }

    static validate(v) { return typeof v === 'string' || validateNullValue(this, v); }

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value) {
        super(value);
        return String(value);
    }

}
_String.id = 'string';
