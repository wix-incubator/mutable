import {generateWithDefaultForSysImmutable} from "./defineTypeUtils"
function noop() {};

export default class _Function {

    static defaults() { return 0; }

    static test(v) { return typeof v === 'function'; }

    constructor(value){
    	return _Function.test(value) ? value : noop;
    }

}

_Function.type = _Function;

_Function.create = function(value) {
	return _Function.test(value) ? value : noop;
};

_Function.withDefault = generateWithDefaultForSysImmutable(_Function.create);
