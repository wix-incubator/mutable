import * as _ from 'lodash';
import {getMailBox} from 'escalate';
import {MuBase, defineNonPrimitive} from './../core/base';
import {validateNullValue, misMatchMessage} from './../core/validation';
import {TypeMatch} from './../core/type-match';
import {toString, toUnwrappedString} from '../core/generic-types';
import {Type, ErrorDetails, ErrorContext, ClassOptions} from "./../types";
import {AtomYielder, DirtyableYielder} from "./../core/lifecycle";
import {Class} from "./../objects/types";
const MAILBOX = getMailBox('mutable.Union');

function getTypeName(type:Type<any, any>):string {
    let result = type.id || type.name || type.id;
    if (type.options) {
        const subTypes = type.options.subTypes;
        if (subTypes) {
            // let genericSubtypesArr = Object.keys(subTypes).map(k => subTypes[k]);
            result = result + toString(...subTypes);
        }
    }
    return result;
}

export default class Union extends MuBase<any> {

    static defaults() {
        if (!this.options || !this.options.subTypes) {
            MAILBOX.error('Untyped Unions are not supported. please state union of types in the format string|number');
        } else {
            return this.options.subTypes[0].defaults();
        }
    }

    static of(subTypes:Array<Type<any, any>>) {
        const result = this.withDefault(undefined, undefined,  { subTypes });
        result.id = subTypes.map(toUnwrappedString).join('|');
        return result;
    };

    static getTypes(){
        if (!this.options || !this.options.subTypes) {
            MAILBOX.error('Untyped Unions are not supported. please state union of types in the format string|number');
        } else {
            return this.options.subTypes.reduce<{[key:string]:Type<any, any>}>(function(subTypes, type) {
                subTypes[getTypeName(type)] = type;
                return subTypes;
            }, {});
        }
    }

    static allowPlainVal(value:any, errorDetails?:ErrorDetails) :boolean{
        return validateNullValue(this, value) ||
            !!(this.options && this.options.subTypes &&
            this.options.subTypes.some(typeDef => typeDef.allowPlainVal(value, errorDetails)))
    }

    static validate(value:any):value is any {
        return validateNullValue(this, value) ||
            !!(this.options && this.options.subTypes &&
            _.some(this.options.subTypes, (typeDef) => {
                return typeDef.validate(value);
            }));
    }

    static _matchValue(this:Class<any>, value:any, errorContext?:ErrorContext){
        if (!this.options || !this.options.subTypes) {
            MAILBOX.error('Untyped Unions are not supported. please state union of types in the format string|number');
        } else if(!this.isNullable() || value !== null) {
            return new TypeMatch(value, errorContext).tryTypes(...this.options.subTypes);
        }
        return new TypeMatch(value, errorContext).tryType(this);
    }

    static validateType(value:any):value is any {
        return (this.options && this.options.subTypes &&
            _.some(this.options.subTypes, (typeDef) => {
                return typeDef.validateType(value);
            })) || validateNullValue(this, value);
    }

    static cloneValue(value:any) {
        if (!this.options || !this.options.subTypes) {
            MAILBOX.error('Untyped Unions are not supported. please state union of types in the format string|number');
        } else {
            return this.options.subTypes[0].cloneValue(value);
        }
    }

    static create(value:any, options:ClassOptions, errorContext?:ErrorContext) {
        errorContext = errorContext || this.createErrorContext('Type constructor error', 'error');
        if (!this.options || !this.options.subTypes) {
            MAILBOX.error('Untyped Unions are not supported. please state union of types in the format string|number');
        } else {
            const matchedSubType = _.find(this.options.subTypes, type => type.allowPlainVal(value));
            if (matchedSubType){
                return matchedSubType.create(value, options, errorContext);
            } else {
                MAILBOX.error(misMatchMessage(errorContext, this.id, value));
            }
        }
    }
    constructor(value?:null, options?:ClassOptions, errorContext?:ErrorContext){
        MAILBOX.error('Instantiating a union type is not supported');
        super(value, options, errorContext);
    }

    $dirtyableElementsIterator(yielder: DirtyableYielder): void {MAILBOX.error('Instantiating a union type is not supported');}
    $atomsIterator(yielder: AtomYielder): void {MAILBOX.error('Instantiating a union type is not supported');}
    setValue(newValue: any, errorContext?: ErrorContext): boolean {MAILBOX.error('Instantiating a union type is not supported'); return false;}
    setValueDeep(newValue: any, errorContext?: ErrorContext): boolean {MAILBOX.error('Instantiating a union type is not supported');return false;}
    toJSON(recursive?: boolean, typed?: boolean): any {MAILBOX.error('Instantiating a union type is not supported');}
    toJS(typed?: boolean): any {MAILBOX.error('Instantiating a union type is not supported');}
}
defineNonPrimitive('Union', Union);

