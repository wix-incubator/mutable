import {generateWithDefaultForSysImmutable} from "./defineTypeUtils"
import PrimitiveBase from "./PrimitiveBase"


export default class _String extends PrimitiveBase{

    static defaults(){ return ''; }

    static validate(v){ return typeof v === 'string'; }

    static allowPlainVal(v){ return this.validate(v)}

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value){
        super(value);
        return String(value);
    }

}

_String.type = _String;
_String.create = String;
_String.withDefault = generateWithDefaultForSysImmutable(String);