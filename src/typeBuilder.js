import _ from 'lodash';
import * as gopostal from './gopostal';

const MAILBOX = gopostal.getMailBox('Typorama.typeBuilder');

var clonedMembers = [
    'validate', 'validateType', 'allowPlainVal', 'isAssignableFrom',
    'withDefault', 'wrapValue', 'create', 'defaults', 'options', '_spec'
];

function cloneType(Type) {
    function TypeClone(value, options) {
        return new TypeClone.type(value, TypeClone.options || options);
    }
    clonedMembers.forEach(member => TypeClone[member] = Type[member]);
    TypeClone.type = Type;
    return TypeClone;
}

export function withDefault(defaults, validate, options) {
    var NewType = cloneType(this.type || this);
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

export function nullable() {
    var NullableType = cloneType(this.type || this);
    NullableType.options = NullableType.options || {};
    NullableType.options.nullable = true;
    return NullableType;
}