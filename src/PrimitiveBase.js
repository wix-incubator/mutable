import _ from 'lodash';
import {getMailBox} from 'gopostal';
import {cloneType} from './utils';
import {validateNullValue} from "./validation";

const MAILBOX = getMailBox('Typorama.PrimitiveBase');


class PrimitiveBase {
	static create(){}
	static defaults(){}
	static validate(value){}
	static allowPlainVal(val){ return validateNullValue(this, val); }
	static validateType(){}

    static nullable() {
        var NullableType = cloneType(this);
		NullableType.options.nullable = true;
        return NullableType;
    }
	static cloneValue(value){
		return _.cloneDeep(value);
	}
    static withDefault(defaults, validate, options) {
       var NewType = cloneType(this);
       if(validate) {
           NewType.validate = validate;
       }
		if(options){
			NewType.options = options;
		}

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
               NewType.defaults = () => NewType.cloneValue(defaults);
           }
       }
       return NewType;
   }
}

export default PrimitiveBase;
