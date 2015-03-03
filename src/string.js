import * as defineTypeUtils from "./defineTypeUtils"

export default class _String {

    static defaults(){ return ''; }

    static test(v){ return typeof v === 'string'; }

    constructor(value){
        return String(value);
    }

}

_String.type = _String;
_String.create = String;
_String.withDefault = defineTypeUtils.generateWithDefaultForSysImmutable(String);