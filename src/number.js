import {generateWithDefaultForSysImmutable} from "./defineTypeUtils"
import PrimitiveBase from "./PrimitiveBase"


export default class _Number extends PrimitiveBase{

    static defaults(){ return 0; }

    static validate(v){ return typeof v === 'number'; }

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value){
        super(value);
        return Number(value);
    }

}

_Number.type = _Number;
_Number.create = Number;
_Number.withDefault = generateWithDefaultForSysImmutable(Number);