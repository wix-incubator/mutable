import PrimitiveBase from './primitive-base';
import {validateNullValue} from './validation';
import {registerClass} from './class-repo';

function noop() { }

export default class _Function extends PrimitiveBase {
    static defaults() { return noop; }
    static validate(v) { return typeof v === 'function' || validateNullValue(this, v) }

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value) {
        super(value);
        return _Function.validate(value) ? value : noop;
    }
}

_Function.id = 'function';
registerClass(_Function);
