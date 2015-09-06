import {withDefault, nullable} from './typeBuilder'
import * as gopostal from 'gopostal';

const MAILBOX = gopostal.getMailBox('Typorama.PrimitiveBase');

class _PrimitiveBase {

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
}

_PrimitiveBase.withDefault = withDefault;
_PrimitiveBase.nullable = nullable;

export default _PrimitiveBase;