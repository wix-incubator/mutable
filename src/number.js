import PrimitiveBase from "./PrimitiveBase"

export default class _Number extends PrimitiveBase{

    static defaults(){ return 0; }

    static validate(v){ return typeof v === 'number' || PrimitiveBase.validateNullValue(this, v); }
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
_Number.create = Number;