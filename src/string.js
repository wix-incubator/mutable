import PrimitiveBase from "./PrimitiveBase"
import {validateNullValue} from "./validation"

export default class _String extends PrimitiveBase{
	
	static create(v){
		if(validateNullValue(this, v)){
			return v;
		}
		return String(v);
	}
	
    static defaults(){ return ''; }

    static validate(v){ return typeof v === 'string' || validateNullValue(this, v); }

    static allowPlainVal(v){ return this.validate(v)}

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value){
        super(value);
		return String(value);
    }

}
_String.id = 'string';
_String.type = _String;
//_String.create = String;
