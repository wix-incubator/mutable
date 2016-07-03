import PrimitiveBase from './primitive-base';
import {validateNullValue} from './validation';

export default class _Boolean extends PrimitiveBase {
    static defaults() { return false; }
    static validate(v) { return typeof v === 'boolean' || validateNullValue(this, v); }
    static validateType(value) {
        return this.validate(value);
    }
    constructor(value) {
        super(value);
        return Boolean(value);
    }
}

_Boolean.id = 'boolean';
//_Boolean.create = Boolean;
