import {Any} from '../any';
import {validateNullValue} from '../../core/validation';
import {Type} from "../../types";

export default class _Boolean extends Any {
    static id = 'boolean';
    static defaults() { return false; }
    static validate(value:any):value is boolean {
        return typeof value === 'boolean' || validateNullValue(this, value);
    }
    static validateType(value:any):value is boolean {
        return this.validate(value);
    }
    constructor(value?:boolean) {
        super();
        return Boolean(value);
    }
}
const asType: Type<boolean, boolean> = _Boolean;
