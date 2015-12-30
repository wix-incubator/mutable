import Typorama from '../../../src';
import {expect} from 'chai';
import {aNumberArray, aStringArray, UserType, AddressType} from '../builders';
import {either} from '../../../src/composite'

describe('Array', function() {
	describe('mutable instance', function() {

		describe('join', function () {
			it('should join all the elements of an array into a string with default separator', function () {
				expect(aStringArray(['a', 'b']).join()).to.equal("a,b");
			});

			it('should join all the elements of an array into a string with custom separator', function () {
				expect(aStringArray(['a', 'b']).join('|')).to.equal("a|b");
			});
		});

		describe('slice', function () {
			it('creates a slice of array from start up to the end of the array. ', function () {
				var numberArray = aNumberArray([1, 2, 3]);

				var slicedArray = numberArray.slice(1, 3);

				expect(slicedArray.at(0)).to.eql(numberArray.at(1));
			});
			it('should start from 0 if begin is omitted', function () {
				var numberArray = aNumberArray();

				var slicedArray = numberArray.slice();

				expect(slicedArray).to.eql(numberArray);
			});
			it('should offset from the end, if passed a negative BEGIN value', function () {
				var numberArray = aNumberArray([1, 2, 3]);

				var slicedArray = numberArray.slice(-(numberArray.length - 1));

				expect(slicedArray).to.eql(aNumberArray([2, 3]));
			});
			it('should offset from the end, if passed a negative END value', function () {
				var numberArray = aNumberArray([1, 2, 3]);

				var slicedArray = numberArray.slice(0, -1);

				expect(slicedArray).to.eql(aNumberArray([1, 2]));
			});
		});


		describe('concat', function () {
			it('should not alter the original array', function () {
				var numberArray = aNumberArray();
				var oldArray = numberArray.concat();

				numberArray.concat(1, 1);

				expect(numberArray).to.eql(oldArray);
			});

			it('should return a typed object', function () {
				var numberArray = aNumberArray();

				var concattedArray = numberArray.concat(1, 1);

				expect(concattedArray).to.be.instanceOf(Typorama.Array);
			});

			it('should be able to concat N arrays of the same type', function () {
				var concatResult = aNumberArray([1, 2]).concat(aNumberArray([3, 4]), [5, 6]);

				expect(concatResult.length).to.equal(6, 'Length check');
				expect(concatResult.__value__).to.eql([1, 2, 3, 4, 5, 6], 'Equality test'); //TODO: create matcher.
			});

			it('should be able to concat N arrays of the different types', function () {
				var mixedArray = Typorama.Array.of([Typorama.Number, Typorama.String]).create([1, '2']);

				var concatResult = mixedArray.concat(aStringArray(['3', '4']), [5, 6]);

				expect(concatResult.length).to.equal(6, 'Length check');
				expect(concatResult.__value__).to.eql([1, '2', '3', '4', 5, 6], 'Equality test'); //TODO: create matcher.
			});

			it('should allow subtypes allowed by all the different arrays', function () {
				var mixedInstance = Typorama.Array.of(either(UserType, AddressType)).create([
					{_type: UserType.id},
					{_type: AddressType.id},
					{}
				]);
				var addressList = Typorama.Array.of(AddressType).create([{}]);
				var mixedList = [{_type: UserType.id}, {_type: AddressType.id}];

				var concatResult = mixedInstance.concat(addressList, mixedList);

				expect(concatResult.length).to.equal(6);
				expect(concatResult.at(0)).to.be.instanceOf(UserType);
				expect(concatResult.at(1)).to.be.instanceOf(AddressType);
				expect(concatResult.at(2)).to.be.instanceOf(UserType);
				expect(concatResult.at(3)).to.be.instanceOf(AddressType);
				expect(concatResult.at(4)).to.be.instanceOf(UserType);
				expect(concatResult.at(5)).to.be.instanceOf(AddressType);
			});
		});


		describe('toString', function () {
			it('should take an array, and return a string', function () {
				expect(aStringArray(['a', 'b']).toString()).to.eql("a,b");
			});
		});

		describe('toJSON', function () {
			it('should take a typorama array of primitives, and return a native js array of primitives', function () {
				var arrA = aStringArray(['a', 'b']);

				expect(arrA.toJSON(), 'toJSON() called').to.eql(['a', 'b']);
				expect(arrA.toJSON(false), 'toJSON (non-recursive) called').to.eql(['a', 'b']);
			});
			it('should take a typorama array of custom types, and return a native js array of objects', function () {
				var arrA = Typorama.Array.of(UserType).create([{age: 11}, {age: 12}]);

				expect(arrA.toJSON(), 'toJSON() called').to.eql([{age: 11, name: new UserType().name}, {
					age: 12,
					name: new UserType().name
				}]);

				expect(arrA.toJSON(false), 'toJSON (non-recursive) called').to.eql([new UserType({age: 11}), new UserType({age: 12})]);
			});
		});

		describe('valueOf', function () {
			it('should return the primitive value of the specified object', function () {
				var wrapped = ['a', 'b'];
				expect(Typorama.Array.of(Typorama.String).create(wrapped).valueOf()).to.eql(wrapped).and.to.be.instanceOf(Array);
			});

		});
	});
});
