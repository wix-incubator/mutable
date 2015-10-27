import _ from 'lodash';
import {getMailBox} from 'gopostal';
import {cloneType} from './utils';

const MAILBOX = getMailBox('Typorama.PrimitiveBase');


class PrimitiveBase {
	static create(){}
	static defaults(){}
	static validate(value){}	
	static allowPlainVal(){}
	static validateType(){}
	
    static nullable() {
        var NullableType = cloneType(this);
        NullableType.options = NullableType.options ? _.cloneDeep(NullableType.options) : {};
		NullableType.options.nullable = true;
        return NullableType;
    }		
    static withDefault(defaults, validate, options) {
       var NewType = cloneType(this);
       if(validate) {
           NewType.validate = validate;
       }
       NewType.options = options || this.options;

       if(defaults !== undefined) {
           if(defaults === null) {
               var isNullable = NewType.options && NewType.options.nullable;
               if(isNullable) {
                   NewType.defaults = () => null;
               } else {
                   MAILBOX.error('Cannot assign null value to a type which is not defined as nullable.');
               }
           } else if(_.isFunction(defaults)) {
               NewType.defaults = () => defaults;
           } else {
               NewType.defaults = () => _.cloneDeep(defaults);
           }
       }
       return NewType;
   }
}

export default PrimitiveBase;