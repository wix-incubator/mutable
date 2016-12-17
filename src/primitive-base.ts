import * as _ from 'lodash';
import {getMailBox} from 'escalate';
import {cloneType, getReadableValueTypeName} from './utils';
import {TypeMatch} from './type-match';
import {ErrorMessage, ErrorContext, ErrorDetails, MutableObj, Validator,
    ClassOptions, cast, Type} from "./types";

const MAILBOX = getMailBox('Mutable.PrimitiveBase');

function reportErrorInternal(value:any, allowPlain?:boolean, allowInstance?:boolean) : ErrorMessage|undefined{
    if (value !== undefined && (!allowPlain || !this.allowPlainVal(value)) && (!allowInstance || !this.validateType(value))) {
        return { message: `expected type ${this.id} but got ${getReadableValueTypeName(value)}`, path: '' };
    }
}

abstract class _PrimitiveBase {
    static id:string;
    static options:ClassOptions = {};
    static _matchValue(value:any, errorContext:ErrorContext){
        return new TypeMatch(value, errorContext).tryType(this as any as Type<any, any>);
    }
    static allowPlainVal(value:any, errorDetails?:ErrorDetails) {
        if(this.validate(value)){
            return true;
        } else {
            if (errorDetails){
                errorDetails.expected = this;
                errorDetails.actual = value;
            }
            return false;
        }
    }
    static isNullable() {
        return (this.options && this.options.nullable) || false;
    }
    static create(v:any) {
        return this.validate(v) ? v : this.defaults();
    }
    static defaults() {
        MAILBOX.error(this.id + 'did not properly override defaults()');
    }
    static validate(value:any) {
        MAILBOX.error(this.id + 'did not properly override validate()');
    }
    static validateType() {
        MAILBOX.error(this.id + 'did not properly override validateType()');
    }

    /**
     * Determines whether an instance of a specified type can be assigned to the current type
     * @param otherType
     */
    static isJsAssignableFrom(otherType:any){
        return otherType && (this.prototype === otherType.prototype || this.prototype.isPrototypeOf(otherType.prototype));
    }

    static nullable() {
        const NullableType = cloneType(this as any);
        NullableType.options.nullable = true;
        return NullableType;
    }
    static cloneValue(value:any) {
        return value;
    }
    static withDefault(defaults?:MutableObj, validate?:Validator<any>, options?:ClassOptions){
        const NewType = cloneType(cast<Type<any, any>>(this));
        if (validate) {
            NewType.validate = validate;
        }
        if (options) {
            NewType.options = _.assign({}, this.options, options);
        }

        if (defaults !== undefined) {
            if (defaults === null || _.isFunction(defaults)) {
                NewType.defaults = () => defaults;
            } else {
                NewType.defaults = () => NewType.cloneValue(defaults);
            }
        }
        return NewType;
    }
    static reportDefinitionErrors() {
        return null;
    }
    static reportSetValueErrors(value:any) {
        return reportErrorInternal.call(this, value, true, true);
    }

    static reportSetErrors(value:any) {
        return reportErrorInternal.call(this, value, false, true);
    }
    constructor(){
        const type = this.constructor as any as Type<any, any>;
        if (typeof type.preConstructor === 'function'){
            type.preConstructor();
        }
    }
}
export const PrimitiveBase = _PrimitiveBase as any as Type<any, any>;

export default PrimitiveBase;
