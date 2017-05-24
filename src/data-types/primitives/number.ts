import {Any} from '../any';
import {validateNullValue} from '../../core/validation';
import {Type} from "../../types";

export default class _Number extends Any {
    static id = 'number';
    static defaults() { return 0; }
    static validate(value:any):value is number {
        return typeof value === 'number' || validateNullValue(this, value);
    }
    static validateType(value:any):value is number {
        return this.validate(value);
    }
    constructor(value:number) {
        super();
        return Number(value);
    }
}

const asType: Type<number, number> = _Number;
