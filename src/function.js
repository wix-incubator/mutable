import {generateWithDefaultForSysImmutable} from "./defineTypeUtils"
function noop() {};

export default class _Function {

    static defaults() { return 0; }

    static validate(v) { return typeof v === 'function'; }

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value){
    	return _Function.validate(value) ? value : noop;
    }

}

_Function.type = _Function;

_Function.create = Object;

_Function.withDefault = generateWithDefaultForSysImmutable(_Function.create);
