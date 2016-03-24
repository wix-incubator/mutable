import * as Typorama from '../../../src';
import {expect} from 'chai';
import builders from '../builders';
import {either} from '../../../src/genericTypes'

function testViewFunctionality(builders, isReadonly) {

	describe('join', function () {
		it('should join all the elements of an array into a string with default separator', function () {
			expect(builders.aStringArray(['a', 'b']).join()).to.equal("a,b");
		});

		it('should join all the elements of an array into a string with custom separator', function () {
			expect(builders.aStringArray(['a', 'b']).join('|')).to.equal("a|b");
		});
	});

	describe('slice', function () {
		it('creates a slice of array from start up to the end of the array. ', function () {
			var numberArray = builders.aNumberArray([1, 2, 3]);

			var slicedArray = numberArray.slice(1, 3);

			expect(slicedArray.at(0)).to.eql(numberArray.at(1));
		});
		it('should start from 0 if begin is omitted', function () {
			var numberArray = builders.aNumberArray();

			var slicedArray = numberArray.slice();

			expect(slicedArray).to.eql(numberArray.$asReadWrite());
		});
		it('should offset from the end, if passed a negative BEGIN value', function () {
			var numberArray = builders.aNumberArray([1, 2, 3]);

			var slicedArray = numberArray.slice(-(numberArray.length - 1));

			expect(slicedArray).to.eql(builders.aNumberArray([2, 3]).$asReadWrite());
		});
		it('should offset from the end, if passed a negative END value', function () {
			var numberArray = builders.aNumberArray([1, 2, 3]);

			var slicedArray = numberArray.slice(0, -1);

			expect(slicedArray).to.eql(builders.aNumberArray([1, 2]).$asReadWrite());
		});
		it('should return mutable List', function () {
			var numberArray = builders.aNumberArray([1, 2, 3]);

			var slicedArray = numberArray.slice();

			expect(slicedArray.$isReadOnly()).to.be.false;
		});
		if (isReadonly){
			it('should return list with read only elements', function () {
				var arr = builders.aUserArray();

				var slicedArray = arr.slice();

				expect(slicedArray.at(0).$isReadOnly()).to.be.true;
			});
		}
	});


	describe('concat', function () {
		it('should not alter the original array', function () {
			var numberArray = builders.aNumberArray();
			var oldArray = numberArray.concat();

			numberArray.concat(1, 1);

			expect(numberArray.$asReadWrite()).to.eql(oldArray);
		});

		it('should return a mutable List', function () {
			var numberArray = builders.aNumberArray();

			var concattedArray = numberArray.concat(1, 1);

			expect(concattedArray).to.be.instanceOf(Typorama.Array);
			expect(concattedArray.$isReadOnly()).to.be.false;

		});
		if (isReadonly){
			it('should return list with read only elements', function () {
				var arr = builders.aUserArray();

				var concattedArray = arr.concat({});

				expect(concattedArray.at(0).$isReadOnly()).to.be.true;
			});
		}
		it('should be able to concat N arrays of the same type', function () {
			var concatResult = builders.aNumberArray([1, 2]).concat(builders.aNumberArray([3, 4]), [5, 6]);

			expect(concatResult.length).to.equal(6, 'Length check');
			expect(concatResult.__value__).to.eql([1, 2, 3, 4, 5, 6], 'Equality test'); //TODO: create matcher.
		});

		it('should be able to concat N arrays of the different types', function () {
			var mixedArray = builders.aNumberStringArray([1, '2']);

			var concatResult = mixedArray.concat(builders.aStringArray(['3', '4']), [5, 6]);

			expect(concatResult.length).to.equal(6, 'Length check');
			expect(concatResult.__value__).to.eql([1, '2', '3', '4', 5, 6], 'Equality test'); //TODO: create matcher.
		});

		it('should allow subtypes allowed by all the different arrays', function () {
			var mixedInstance = builders.aUserOrAddressArray([
				{_type: builders.UserType.id},
				{_type: builders.AddressType.id},
				{}
			]);
			var userList = builders.aUserArray([{}]);
			var mixedList = [{_type: builders.UserType.id}, {_type: builders.AddressType.id}];

			var concatResult = mixedInstance.concat(userList, mixedList);

			expect(concatResult.length).to.equal(6);
			expect(concatResult.at(0)).to.be.instanceOf(builders.UserType);
			expect(concatResult.at(1)).to.be.instanceOf(builders.AddressType);
			expect(concatResult.at(2)).to.be.instanceOf(builders.UserType);
			expect(concatResult.at(3)).to.be.instanceOf(builders.UserType);
			expect(concatResult.at(4)).to.be.instanceOf(builders.UserType);
			expect(concatResult.at(5)).to.be.instanceOf(builders.AddressType);
		});
	});


	describe('toString', function () {
		it('should take an array, and return a string', function () {
			expect(builders.aStringArray(['a', 'b']).toString()).to.eql("a,b");
		});
	});

	describe('toJSON', function () {
		it('should take a typorama array of primitives, and return a native js array of primitives', function () {
			var arrA = builders.aStringArray(['a', 'b']);

			expect(arrA.toJSON(), 'toJSON() called').to.eql(['a', 'b']);
			expect(arrA.toJSON(false), 'toJSON (non-recursive) called').to.eql(['a', 'b']);
		});
		it('should take a typorama array of custom types, and return a native js array of objects', function () {
			var arrA = builders.aUserArray([{age: 11}, {age: 12}]);

			expect(arrA.toJSON(), 'toJSON() called').to.eql([{age: 11, name: new builders.UserType().name}, {
				age: 12,
				name: new builders.UserType().name
			}]);

			expect(arrA.toJSON(false), 'toJSON (non-recursive) called').to.eql([new builders.UserType({age: 11}), new builders.UserType({age: 12})]);
		});
	});

	describe('valueOf', function () {
		it('should return the primitive value of the specified object', function () {
			var wrapped = ['a', 'b'];
			expect(builders.aStringArray(wrapped).valueOf()).to.eql(wrapped).and.to.be.instanceOf(Array);
		});

	});
}

describe('Array', function() {
	describe('mutable instance', function() {
		testViewFunctionality(builders, false);

	});
	describe('read-only instance', function() {
		testViewFunctionality(builders.asReadOnly(), true);

	});
});
