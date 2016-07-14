import PrimitiveBase from './primitive-base';
import {validateNullValue} from './validation';

export default class _Void extends PrimitiveBase {
    static defaults() { return null; }

    static validate(v) { return v === null }

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value) {
        super(value);
        return value;
    }

}
_Void.id = 'null';
