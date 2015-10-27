import PrimitiveBase from "./PrimitiveBase"
import {validateNullValue} from "./validation"

function noop() {};

export default class _Function extends PrimitiveBase{
	static create(v){
		if(validateNullValue(this, v)){
			return v;
		}
		return Object(v);
	}
	
    static defaults() { return noop; }

    static validate(v) { return typeof v === 'function' || validateNullValue(this, v) }
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
//_Function.create = Object;

