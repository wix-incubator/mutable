import PrimitiveBase from './primitive-base';
import {validateNullValue} from './validation';

export default class _Number extends PrimitiveBase{

	static create(v){
		if(validateNullValue(this, v)){
			return v;
		}
		return Number(v);
	}
	
    static defaults(){ return 0; }

    static validate(v){ return typeof v === 'number' || validateNullValue(this, v); }
    static allowPlainVal(v){ return this.validate(v)}

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value){
        super(value);
        return Number(value);
    }

}

_Number.type = _Number;
_Number.id = 'number';
//_Number.create = Number;
