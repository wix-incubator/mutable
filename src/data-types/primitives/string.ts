import {Any} from '../any';
import {validateNullValue} from '../../core/validation';
import {Type} from "../../types";

export default class _String extends Any {
    static id = 'string';
    static defaults() { return ''; }

    static validate(value:any):value is string {
        return typeof value === 'string' || validateNullValue(this, value);
    }

    static validateType(value:any):value is string {
        return this.validate(value);
    }

    constructor(value:string) {
        super();
        return String(value);
    }

}
const asType: Type<string, string> = _String;
