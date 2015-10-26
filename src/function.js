import PrimitiveBase from "./PrimitiveBase"

function noop() {};

export default class _Function extends PrimitiveBase{

    static defaults() { return noop; }

    static validate(v) { return typeof v === 'function' || PrimitiveBase.validateNullValue(this, v) }
    static allowPlainVal(v){ return this.validate(v)}

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value){
        super(value);
    	return _Function.validate(value) ? value : noop;
    }

}

_Function.id = 'function';
_Function.type = _Function;
_Function.create = Object;

