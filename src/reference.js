import BaseType from "./BaseType";
import DefineType from "./defineType";
import { validateAndWrap, validateNullValue } from "./validation";
import {getMailBox}       from 'gopostal';
import _ from "lodash";

const MAILBOX = getMailBox('Typorama.Reference');

class _Reference extends BaseType {

	static allowPlainVal(value){

		return (_.isPlainObject(value) && _.every(this._spec, (fieldSpec, fieldId) => {
			return fieldSpec.allowPlainVal(value[fieldId]);
		})) || validateNullValue(this, val);
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

var Reference = DefineType('Reference', {
	spec: function(Reference) {
		return {};
	}
}, null, _Reference);


export default Reference;
