import * as _ from 'lodash';
import * as Typorama from '../../src';
import {aDataTypeWithSpec} from '../../test-kit/testDrivers/index';
import {either} from '../../src/genericTypes'

export var UserType = aDataTypeWithSpec({
	name: Typorama.String.withDefault(''),
	age: Typorama.Number.withDefault(10)
}, 'User');

export var AddressType = aDataTypeWithSpec({
	address: Typorama.String.withDefault(''),
	code: Typorama.Number.withDefault(10)
}, 'Address');

export var UserWithAddressType = aDataTypeWithSpec({
	user: UserType,
	address: AddressType
}, 'UserWithAddress');


export var VeryCompositeContainer = aDataTypeWithSpec({
	child1: UserWithAddressType
}, 'VeryCompositeContainer');


export function aStringArray(optionalArr) {
	return Typorama.Array.of(Typorama.String).create(optionalArr || ["John", "Paul", "George", "Ringo"]);
}

export function aNumberArray(optionalArr) {
	return Typorama.Array.of(Typorama.Number).create(optionalArr || [1,2]);
}

export function aNumberStringArray(optionalArr) {
	return Typorama.Array.of(either(Typorama.Number, Typorama.String)).create(optionalArr || [1,'ho']);
}

export function anEmptyArray() {
	return aNumberArray([]);
}

export function aUserArray(optionalArr) {
	return Typorama.Array.of(UserType).create(optionalArr || [{},{name:'yossi'}]);
}

export function aUserWithAddressTypeArray(optionalArr) {
	return Typorama.Array.of(UserWithAddressType).create(optionalArr || [{},{name:'yossi'}]);
}

export function aUserOrAddressArray(optionalArr) {
	return Typorama.Array.of(either(UserType, AddressType)).create(optionalArr || [{},{name:'yossi'}]);
}

export function a2dUserWithAddressTypeArray(optionalArr) {
	return Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create(optionalArr || [[{}],[{name:'yossi'}]]);
}

export function aVeryCompositeContainerArray(optionalArr) {
	return Typorama.Array.of(VeryCompositeContainer).create(optionalArr || [{},{child1:{user:{name:'yossi'}}}]);
}
const exported = {UserType, AddressType, UserWithAddressType, aStringArray, aNumberArray, aNumberStringArray, anEmptyArray,aUserArray, aUserWithAddressTypeArray, aUserOrAddressArray, aVeryCompositeContainerArray, a2dUserWithAddressTypeArray};

function asReadOnly(){
	return _.mapValues(exported, prop => {
		if (prop.id){			// typorama type
			return prop;
		} else {				// factory method
			return _.flow(prop, list => list.$asReadOnly());
		}
	});
}

export default _.defaults(exported, {asReadOnly});
