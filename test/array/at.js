import Typorama from '../../src';
import {aNumberArray, aStringArray, UserType, AddressType, UserWithAddressType} from './builders';
import {expect} from 'chai';
import {either} from '../../src/composite'

describe('at', function() {

	it('should return a number for native immutable Typorama.Number', function() {
		expect(aNumberArray([1]).at(0)).to.equal(1);
	});

	it('should return a string for native immutable Typorama.String', function() {
		expect(aStringArray(["123"]).at(0)).to.equal("123");
	});

	it('should return wrapped item that passes the test() of their type', function() {
		var numberList = aNumberArray([1]);
		expect(numberList.__options__.subTypes.validate(numberList.at(0))).to.beTrue;
	});

	it('should return a typed item for non-primitive items, such as custom type', function() {
		var arr = Typorama.Array.of(UserType).create([{}]);
		expect(arr.at(0)).to.be.instanceOf(UserType);
	});

	it('should always return a the same reference for a wrapper', function() {
		var arr = Typorama.Array.of(UserType).create([{}]);
		var ref1 = arr.at(0);
		var ref2 = arr.at(0);

        expect(ref1).to.equal(ref2);
	});

	it('should return a typed item form multiple types if there is _type field', function() {
        var arr = Typorama.Array.of(either(UserType,  AddressType)).create([{_type:'User'}, {_type:'Address'}]);

        expect(arr.at(0)).to.be.instanceOf(UserType);
        expect(arr.at(1)).to.be.instanceOf(AddressType);

	});

	it('should modify inner complex data', function() {
		var arrComplexType = Typorama.Array.of(UserWithAddressType).create([{}]);

		arrComplexType.at(0).user.name = 'modified user name';

		expect(arrComplexType.at(0).user.name).to.equal('modified user name');
	});

	it('should handle multi level array', function() {
		var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}]]);
        var userWithAddress = arrComplexType.at(0).at(0);

		expect(userWithAddress).to.be.instanceOf(UserWithAddressType);

        userWithAddress.user.name = 'you got a new name';

   		expect(userWithAddress.user.name).to.equal('you got a new name');

	});


});