import builders from '../builders';
import {expect} from 'chai';
import {either} from '../../../src/genericTypes'

function testReadFunctionality(builders, isReadonly) {
	describe('at', function () {

		it('should return a number for native immutable Typorama.Number', function () {
			expect(builders.aNumberArray().at(0)).to.equal(1);
		});

		it('should return a string for native immutable Typorama.String', function () {
			expect(builders.aStringArray().at(0)).to.equal('John');
		});

		it('should return wrapped item that passes the test() of their type', function () {
			expect(builders.aNumberArray().__options__.subTypes.validate(builders.aNumberArray().at(0))).to.be.true;
		});

		it('should return a typed item for non-primitive items, such as custom type', function () {
			expect(builders.aUserArray().at(0)).to.be.instanceOf(builders.UserType);
		});

		it('should always return the same reference for a wrapper', function () {
			var arr = builders.aUserArray([{}]);
			var ref1 = arr.at(0);
			var ref2 = arr.at(0);

			expect(ref1).to.equal(ref2);
		});

		it('should return a typed item form multiple types if there is _type field', function () {
			var arr = builders.aUserOrAddressArray([
				{_type: 'User'},
				{_type: 'Address'}]);

			expect(arr.at(0)).to.be.instanceOf(builders.UserType);
			expect(arr.at(1)).to.be.instanceOf(builders.AddressType);

		});
		it('Should handle multi level array', function() {
			var arrComplexType = builders.a2dUserWithAddressTypeArray([[{}], [{}], [{}]]);

			var userWithAddress = arrComplexType.at(0).at(0);
			expect(userWithAddress).to.be.instanceof(builders.UserWithAddressType);
			expect(userWithAddress.$isReadOnly()).to.equal(isReadonly);
		});
		if (isReadonly) {
			it('should return read-only inner complex data', function () {
				var arrComplexType = builders.aUserWithAddressTypeArray([{}]);
				expect(arrComplexType.at(0).$isReadOnly()).to.be.true;
			});

		} else {
			it('should modify inner complex data', function () {
				var arrComplexType = builders.aUserWithAddressTypeArray([{}]);

				arrComplexType.at(0).user.name = 'modified user name';

				expect(arrComplexType.at(0).user.name).to.equal('modified user name');
			});

			it('should keep read only item as read only', function() {
				var readOnlyData = new builders.UserWithAddressType().$asReadOnly();
				var arrComplexType = builders.aUserWithAddressTypeArray([readOnlyData]);

				expect(arrComplexType.at(0).$isReadOnly()).to.eql(true);
			});
		}
	});

	describe('indexOf', function () {
		var stringArray;
		beforeEach(() => {
			stringArray = builders.aStringArray(['a', 'b']);
		});

		it('should return the first index of an element within an array equal to the specified value', function () {
			expect(stringArray.indexOf('a')).to.eql(0);
		});

		it('should return -1 if none is found', function () {
			expect(stringArray.indexOf('a', 1)).to.eql(-1);
		});
	});

	describe('lastIndexOf', function () {
		var stringArray;
		beforeEach(() => {
			stringArray = builders.aStringArray(['a', 'b', 'a']);
		});

		it('should return the last index at which a given element can be found in the array', function () {
			expect(stringArray.lastIndexOf('a')).to.eql(2);
		});

		it('should take a 2nd argument, the index at which to start searching backwards', function () {
			expect(stringArray.lastIndexOf('b', 2)).to.eql(1);
		});

		it('should return -1 if none is found', function () {
			expect(stringArray.lastIndexOf('c')).to.eql(-1);
		});
	});
}

describe('Array', function() {
	describe('mutable instance', function() {
		testReadFunctionality(builders, false);
	});
	describe('read-only instance', function() {
		testReadFunctionality(builders.asReadOnly(), true);
	});
});
