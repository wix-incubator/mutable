import PrimitiveBase from "./PrimitiveBase"
import {validateNullValue} from './defineTypeUtils.js'



export default class _Boolean extends PrimitiveBase{

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

_Boolean.type = _Boolean;
_Boolean.create = Boolean;