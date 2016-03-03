import {aNumberArray, aStringArray, anEmptyArray, UserType, AddressType, UserWithAddressType, aVeryCompositeContainerArray} from '../builders';
import {LifeCycleManager, revision} from '../../../src/lifecycle.js';
import {aDataTypeWithSpec} from '../../../test-kit/testDrivers/index';
import Typorama from '../../../src';
import {expect} from 'chai';
import {either} from '../../../src/genericTypes';
import lifeCycleAsserter from '../lifecycle.js';
import modifyTestSuite from './modify-test-suite';
import {ERROR_FIELD_MISMATCH_IN_LIST_METHOD} from '../../../test-kit/testDrivers/reports'

function complexSubTypeTests() {
	it('single subtype array should allow setting data with json', function () {
		var address = new AddressType({address: 'gaga'});
		var mixedList = Typorama.Array.of(AddressType).create([address]);

		mixedList.setValueDeep([{code: 5}]);

		expect(mixedList.at(0)).to.be.instanceOf(AddressType);
		expect(mixedList.at(0).code).to.be.eql(5);
		expect(mixedList.at(0).address).to.be.eql('');
		expect(mixedList.at(0)).to.be.equal(address);
	});

	it('should keep typorama instances', function () {
		var newUser = new UserType();
		var newAddress = new AddressType();
		var mixedList = Typorama.Array.of(either(UserType, AddressType)).create([newUser, newAddress]);


		mixedList.setValueDeep([{age:65}, {code:999}]);

		expect(mixedList.at(0)).to.equal(newUser);
		expect(mixedList.at(1)).to.equal(newAddress);
	});

	//it('should replace item for mismatch', function () {
	//	var newUser = new UserType();
	//	var newAddress = new AddressType();
	//	var mixedList = Typorama.Array.of(either(UserType, AddressType)).create([newUser, newAddress]);
    //
	//	mixedList.setValueDeep([{_type: ,age:65}, {code:999}]);
    //
	//	expect(mixedList.at(0)).to.equal(newUser);
	//	expect(mixedList.at(1)).to.equal(newAddress);
	//});
}
modifyTestSuite('setValueDeep', { complexSubTypeTests });
