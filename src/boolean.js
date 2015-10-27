import PrimitiveBase from "./PrimitiveBase"
import {validateNullValue} from "./validation"


export default class _Boolean extends PrimitiveBase{
	static create(v){
		if(validateNullValue(this, v)){
			return v;
		}
		return Boolean(v);
	}
	static defaults(){ return false; }
    static validate(v){ return typeof v === 'boolean' || validateNullValue(this, v); }
    static allowPlainVal(v){ return this.validate(v)}
    static validateType(value) {
        return this.validate(value);
    }
    constructor(value){
        super(value);
        return Boolean(value);
    }
}

_Boolean.id = 'boolean';
_Boolean.type = _Boolean;
//_Boolean.create = Boolean;