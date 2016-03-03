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

		mixedList.mergeValue([{code: 5}]);

		expect(mixedList.at(0)).to.be.instanceOf(AddressType);
		expect(mixedList.at(0).code).to.be.eql(5);
		expect(mixedList.at(0).address).to.be.eql('gaga');
		expect(mixedList.at(0)).to.be.equal(address);

	});
}
modifyTestSuite('mergeValue', { complexSubTypeTests });


/**
merge missing:
 when reaching typorama make sure to use instance and not duplicate or merge into

 */


