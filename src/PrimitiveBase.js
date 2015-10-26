import {getMailBox} from 'gopostal';
import _ from 'lodash';

const MAILBOX = getMailBox('Typorama.PrimitiveBase');

const clonedMembers = [
    'validate',
	'validateType', 
	'validateAndWrap',
	'allowPlainVal', 
	'isAssignableFrom', 
	'nullable',
    'withDefault', 
	'wrapValue', 
	'create', 
	'defaults', 
	'options', 
	'_spec',
	'id'
];

class PrimitiveBase {
	
	static cloneType(Type){
		function TypeClone(value, options) {
			return new TypeClone.type(value, TypeClone.options || options);
		}
		clonedMembers.forEach(member => {TypeClone[member] = Type[member]});
		TypeClone.type = Type;
		return TypeClone;
	}
	
    static validateNullValue(Type, value) {
        if(value === null) {
            if(!(Type.options && Type.options.nullable)) {
                MAILBOX.error('Cannot assign null value to a type which is not defined as nullable.');
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    static nullable() {
        var NullableType = PrimitiveBase.cloneType(this.type || this);
        NullableType.options = NullableType.options || {};
        NullableType.options.nullable = true;
        return NullableType;
    }

    static withDefault(defaults, validate, options) {
       var NewType = PrimitiveBase.cloneType(this.type || this);
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