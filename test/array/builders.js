import _ from 'lodash';
import Typorama from '../../src';
import {aDataTypeWithSpec} from '../../test-kit/testDrivers/index';
import {either} from '../../src/genericTypes'

var UserType = aDataTypeWithSpec({
	name: Typorama.String.withDefault(''),
	age: Typorama.Number.withDefault(10)
}, 'User');

var AddressType = aDataTypeWithSpec({
	address: Typorama.String.withDefault(''),
	code: Typorama.Number.withDefault(10)
}, 'Address');

var UserWithAddressType = aDataTypeWithSpec({
	user: UserType,
	address: AddressType
}, 'UserWithAddress');


var VeryCompositeContainer = aDataTypeWithSpec({
	child1: UserWithAddressType
}, 'VeryCompositeContainer');


function aStringArray(optionalArr) {
	return Typorama.Array.of(Typorama.String).create(optionalArr || ["John", "Paul", "George", "Ringo"]);
}

function aNumberArray(optionalArr) {
	return Typorama.Array.of(Typorama.Number).create(optionalArr || [1,2]);
}

function aNumberStringArray(optionalArr) {
	return Typorama.Array.of(either(Typorama.Number, Typorama.String)).create(optionalArr || [1,'ho']);
}

function anEmptyArray() {
	return aNumberArray([]);
}

function aUserArray(optionalArr) {
	return Typorama.Array.of(UserType).create(optionalArr || [{},{name:'yossi'}]);
}

function aUserWithAddressTypeArray(optionalArr) {
	return Typorama.Array.of(UserWithAddressType).create(optionalArr || [{},{name:'yossi'}]);
}

function aUserOrAddressArray(optionalArr) {
	return Typorama.Array.of(either(UserType, AddressType)).create(optionalArr || [{},{name:'yossi'}]);
}

function a2dUserWithAddressTypeArray(optionalArr) {
	return Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create(optionalArr || [[{}],[{name:'yossi'}]]);
}

function aVeryCompositeContainerArray(optionalArr) {
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
