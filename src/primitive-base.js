import * as _ from 'lodash';
import {getMailBox} from 'escalate';
import {cloneType, getReadableValueTypeName} from './utils';
import {validateNullValue} from './validation';
import {TypeMatch} from './type-match';

const MAILBOX = getMailBox('Mutable.PrimitiveBase');

function reportErrorInternal(value, allowPlain, allowInstance) {
    if (value !== undefined && (!allowPlain || !this.allowPlainVal(value)) && (!allowInstance || !this.validateType(value))) {
        return { message: `expected type ${this.id} but got ${getReadableValueTypeName(value)}`, path: '' };
    }
}

export class PrimitiveBase {
    static _mobxModifier(value){
        return value;
    }
    static _matchValue(value, errorContext){
        return new TypeMatch(value, errorContext).tryType(this);
    }
    static allowPlainVal(value, errorDetails = null) {
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
    static get type(){
        MAILBOX.warn('Type.type is deprecated');
        return this;
    }
    static create(v) {
        return this.validate(v) ? v : this.defaults();
    }
    static defaults() {
        MAILBOX.error(this.id + 'did not properly override defaults()');
    }
    static validate(value) {
        MAILBOX.error(this.id + 'did not properly override validate()');
    }
    static validateType() {
        MAILBOX.error(this.id + 'did not properly override validateType()');
    }
    static preConstructor() {}

    /**
     * Determines whether an instance of a specified type can be assigned to an instance of the current type
     * @param otherType
     */
    static isJsAssignableFrom(otherType){
        return otherType && (this.prototype === otherType.prototype || this.prototype.isPrototypeOf(otherType.prototype));
    }

    static nullable() {
        const NullableType = cloneType(this);
        NullableType.options.nullable = true;
        return NullableType;
    }
    static cloneValue(value) {
        return value;
    }
    static withDefault(defaults, validate, options) {
        const NewType = cloneType(this);
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
    static reportSetValueErrors(value) {
        return reportErrorInternal.call(this, value, true, true);
    }

    static reportSetErrors(value) {
        return reportErrorInternal.call(this, value, false, true);
    }
    constructor(...args){
        if (typeof this.constructor.preConstructor === 'function'){
            this.constructor.preConstructor(...args);
        } else {
            MAILBOX.error(`Type definition error: "${this.constructor.name}" is not inherited correctly. Did you remember to import core3-runtime?`);
        }
    }
}

export default PrimitiveBase;
