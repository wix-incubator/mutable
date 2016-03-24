import {expect} from 'chai';

import * as Typorama from '../../../src';
import {either, LifeCycleManager, revision} from '../../../src';
import {aNumberList, aStringList, anEmptyList, UserType, AddressType, UserWithAddressType, aVeryCompositeContainerList} from '../builders';
import {aDataTypeWithSpec} from '../../../test-kit/test-drivers';
import lifeCycleAsserter from '../lifecycle';
import modifyTestSuite from './modify-test-suite';
import {ERROR_FIELD_MISMATCH_IN_LIST_METHOD} from '../../../test-kit/test-drivers/reports';

function complexSubTypeTests() {
	it('single subtype List should allow setting data with json', function () {
		var address = new AddressType({address: 'gaga'});
		var List = Typorama.List.of(AddressType).create([address]);
		revision.advance();
		var rev = revision.read();

		List.setValueDeep([{code: 5}]);

		expect(List.at(0)).to.be.instanceOf(AddressType);
		expect(List.at(0).code).to.be.eql(5);
		expect(List.at(0).address).to.be.eql('');
		expect(List.at(0)).to.be.equal(address);
		expect(List.$isDirty(rev)).to.equal(true);
	});

	it('single not be dirty if nothing changed', function () {
		var address = new AddressType({address: 'gaga'});
		var List = Typorama.List.of(AddressType).create([address]);
		revision.advance();
		var rev = revision.read();

		List.setValueDeep([List.at(0).toJSON()]);

		expect(List.$isDirty(rev)).to.equal(false);
	});

	it('should keep typorama instances', function () {
		var newUser = new UserType();
		var newAddress = new AddressType();
		var mixedList = Typorama.List.of(either(UserType, AddressType)).create([newUser, newAddress]);
		revision.advance();
		var rev = revision.read();

		mixedList.setValueDeep([{age:65}, {code:999}]);

		expect(mixedList.at(0)).to.equal(newUser);
		expect(mixedList.at(1)).to.equal(newAddress);
		expect(mixedList.$isDirty(rev)).to.equal(true);
	});

	it('should replace item for mismatch type', function () {
		var newUser = new UserType();
		var newAddress = new AddressType();
		var mixedList = Typorama.List.of(either(UserType, AddressType)).create([newUser, newAddress]);
		revision.advance();
		var rev = revision.read();

		mixedList.setValueDeep([{_type:'Address' ,age:65}, {code:999}]);

		expect(mixedList.at(0)).to.be.an.instanceOf(AddressType);
		expect(mixedList.at(1)).to.equal(newAddress);
		expect(mixedList.$isDirty(rev)).to.equal(true);
	});

	it('should create new item if item is read only', function() {
		var address = new AddressType({address: 'gaga'});
		var List = Typorama.List.of(AddressType).create([address.$asReadOnly()]);
		revision.advance();
		var rev = revision.read();

		List.setValueDeep([{code: 5}]);

		expect(List.at(0)).to.not.be.equal(address);
		expect(List.$isDirty(rev)).to.equal(true);
	});
}
modifyTestSuite('setValueDeep', { complexSubTypeTests });
