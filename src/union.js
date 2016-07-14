import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import BaseType from './base-type';
import VoidType from './void';
import defineType from './define-type';
import {validateNullValue, misMatchMessage} from './validation';
import {TypeMatch} from './type-match';
import {toString} from './generic-types';
const MAILBOX = getMailBox('Typorama.Union');


function getTypeName(type) {
    let result = type.id || type.name;
    if (type.options && type.options.subTypes) {
        let genericSubtypesArr = Object.keys(type.options.subTypes).map(k => type.options.subTypes[k]);
        result = result + toString(...genericSubtypesArr);
    }
    return result;
}

class _Union extends BaseType {
    static defaults() {
        if (!this.options || !this.options.subTypes) {
            MAILBOX.error('Untyped Unions are not supported. please state union of types in the format string|number');
        } else {
            return this.options.subTypes[0].defaults();
        }
    }

    static of(subTypes) {
        const result = this.withDefault(undefined, undefined, { subTypes });
        result.id = subTypes.map(getTypeName).join('|');
        if(_.includes(subTypes,VoidType))
            return result.nullable(true)
        return result;
    };

    static getTypes(){
        if (!this.options || !this.options.subTypes) {
            MAILBOX.error('Untyped Unions are not supported. please state union of types in the format string|number');
        } else {
            return this.options.subTypes.reduce(function(subTypes, type) {
                subTypes[getTypeName(type)] = type;
                return subTypes;
            }, {});
        }
    }

    static allowPlainVal(value, errorDetails = null) {
        return validateNullValue(this, value) ||
            (this.options && this.options.subTypes &&
            this.options.subTypes.some(typeDef => typeDef.allowPlainVal(value, errorDetails)))
    }

    static validate(value) {
        return validateNullValue(this, value) ||
            (this.options && this.options.subTypes &&
            _.some(this.options.subTypes, (typeDef) => {
                return typeDef.validate(value);
            }));
    }

    static _matchValue(value, errorContext){
        if (!this.options || !this.options.subTypes) {
            MAILBOX.error('Untyped Unions are not supported. please state union of types in the format string|number');
        } else {
            return new TypeMatch(value, errorContext).tryTypes(...this.options.subTypes);
        }
    }

    static validateType(value) {
        return (this.options && this.options.subTypes &&
            _.some(this.options.subTypes, (typeDef) => {
                return typeDef.validateType(value);
            })) || validateNullValue(this, value);
    }

    static cloneValue(value) {
        if (!this.options || !this.options.subTypes) {
            MAILBOX.error('Untyped Unions are not supported. please state union of types in the format string|number');
        } else {
            return this.options.subTypes[0].cloneValue(value);
        }
    }

    static create(value, options, errorContext) {
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

    static preConstructor(){
        MAILBOX.error('Instantiating a union type is not supported');
        super.preConstructor();
    }
}

export default defineType('Union', {
    spec: function(Union) {return {};}
}, null, _Union);

