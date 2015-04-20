import {generateWithDefaultForSysImmutable} from "./defineTypeUtils"

export default class _String {

    static defaults(){ return ''; }

    static validate(v){ return typeof v === 'string'; }

    static validateType(value) {
        return this.validate(value);
    }

    constructor(value){
        return String(value);
    }

}

_String.type = _String;
_String.create = String;
_String.withDefault = generateWithDefaultForSysImmutable(String);