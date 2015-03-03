import * as defineTypeUtils from "./defineTypeUtils"

export default class _Number {

    static defaults(){ return 0; }

    static test(v){ return typeof v === 'number'; }

    constructor(value){
        return Number(value);
    }

}

_Number.type = _Number;
_Number.create = Number;
_Number.withDefault = defineTypeUtils.generateWithDefaultForSysImmutable(Number);