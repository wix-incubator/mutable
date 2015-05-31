import {generateWithDefaultForSysImmutable} from "./defineTypeUtils"
import PrimitiveBase from "./PrimitiveBase"

function noop() {};

export default class _Function extends PrimitiveBase{

    static defaults() { return noop; }

    static validate(v) { return typeof v === 'function'; }

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value){
        super(value);
    	return _Function.validate(value) ? value : noop;
    }

}

_Function.type = _Function;

_Function.create = Object;

_Function.withDefault = generateWithDefaultForSysImmutable(_Function.create);
