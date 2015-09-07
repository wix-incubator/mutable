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


describe('indexOf', function () {
	var stringArray = aStringArray(['a', 'b']);

	it('should return the first index of an element within an array equal to the specified value', function() {
		expect(stringArray.indexOf('a')).to.eql(0);
	});

	it('should return -1 if none is found', function() {
		expect(stringArray.indexOf('a', 1)).to.eql(-1);
	});
});

describe('lastIndexOf', function () {
	var stringArray = Typorama.Array.of(Typorama.String).create(['a', 'b', 'a']);

	it('should return the last index at which a given element can be found in the array', function() {
		expect(stringArray.lastIndexOf('a')).to.eql(2);
	});

	it('should take a 2nd argument, the index at which to start searching backwards', function() {
		expect(stringArray.lastIndexOf('b', 2)).to.eql(1);
	});

	it('should return -1 if none is found', function() {
		expect(stringArray.lastIndexOf('c')).to.eql(-1);
	});
});

