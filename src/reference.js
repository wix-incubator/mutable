import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import BaseType from './base-type';
import defineType from './define-type';
import {validateAndWrap, validateNullValue} from './validation';

const MAILBOX = getMailBox('Typorama.Reference');

class _Reference extends BaseType {

	static allowPlainVal(value){

		return (_.isObject(value) && _.every(this._spec, (fieldSpec, fieldId) => {
			return fieldSpec.allowPlainVal(value[fieldId]);
		})) || validateNullValue(this, value);
	}

	static wrapValue(refVal, spec, options = {}) {
		var isValid = true;
		_.each(spec, (fieldSpec, key) => {
			var fieldVal = refVal[key];
			if(fieldVal === undefined){
				MAILBOX.error(`${this.id} cannot accept value with missing field "${key}"`);
				isValid = false;
			} else if(!fieldSpec.validateType(fieldVal)){
				MAILBOX.error(`${this.id} field "${key}" cannot accept value with mismatched type`);
				isValid = false;
			}
		});
		return isValid ? refVal : {};
	}

	static cloneValue(value){ return value; }
}

export default defineType('Reference', {
	spec: function(Reference) {
		return {};
	}
}, null, _Reference);
