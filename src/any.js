import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import BaseType from './base-type';
import {misMatchMessage} from './validation';
import {TypeMatch} from './type-match';
import {getClassesByName, getAllClasses} from '../src/class-repo';

const MAILBOX = getMailBox('Mutable.Any');

export default class Any extends BaseType {
    static options = {nullable:true};

    static defaults() {return null;}

    static allowPlainVal() {return true;}

    static validate() {return true;}

    static validateType() {return true;}

    static _matchValue(value, errorContext){
        if(value===null) {
            return new TypeMatch(value, errorContext).tryType(this);
        } else if (value && value._type) {
            return new TypeMatch(value, errorContext).tryTypes(...getClassesByName(value._type));
        } else {
            return new TypeMatch(value, errorContext).tryTypes(...getAllClasses());
        }
    }

    static create(value, options, errorContext) {
        errorContext = errorContext || this.createErrorContext('Type constructor error', 'error');
        // TODO: use common sense to match primitive types and list
        const types = (value && value._type)? getClassesByName(value._type) : getAllClasses();
        const matchedSubType = _.find(types, type => type.allowPlainVal(value));
        if (matchedSubType){
            return matchedSubType.create(value, options, errorContext);
        } else {
            MAILBOX.error(misMatchMessage(errorContext, this.id, value));
        }
    }

    static preConstructor(){
        MAILBOX.error('Instantiating the \'any\' type is not supported');
        super.preConstructor();
    }
}
