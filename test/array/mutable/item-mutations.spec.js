import Typorama from '../../../src';
import {aNumberArray, aStringArray, anEmptyArray, UserType, AddressType} from '../builders';
import {expect} from 'chai';
import {either} from '../../../src/genericTypes'
import lifeCycleAsserter from '../lifecycle.js';

describe('Array', function() {
	describe('mutable instance', function() {

		describe('pop', function () {
			it('should remove the last element from an array', function () {
				var numberList = aNumberArray();
				var oldArr = numberList.concat();

				var valueRemoved = numberList.pop();

				expect(numberList.length).to.equal(oldArr.length - 1);
				expect(valueRemoved).to.equal(oldArr.at(oldArr.length - 1));
			});

			it('should return undefined if called on an empty array', function () {
				var numberList = anEmptyArray();

				var valueRemoved = numberList.pop();

				expect(valueRemoved).to.be.undefined;

			});

			lifeCycleAsserter.assertMutatorContract((arr) => arr.pop(), 'pop');
		});

		describe('push', function () {
			it('it should add a number to an array ', function () {
				var numberList = aNumberArray([1, 2, 3, 4]);
				var lengthBeforePush = numberList.length;

				var newIndex = numberList.push(5);

				expect(newIndex).to.equal(lengthBeforePush + 1);
				expect(numberList.at(lengthBeforePush)).to.equal(5);
			});

			it('should add a typed item for non-primitive data (like custom types)', function () {
				var arr = Typorama.Array.of(UserType).create([]);
				arr.push({});
				expect(arr.at(0)).to.be.instanceOf(UserType);
			});

			it('should add a typed item form multiple types if there is _type field', function () {
				var arr = Typorama.Array.of(either(UserType, AddressType)).create([]);
				arr.push({_type: 'User'});
				arr.push({_type: 'Address'});
				expect(arr.at(0)).to.be.instanceOf(UserType);
				expect(arr.at(1)).to.be.instanceOf(AddressType);
			});

			it('should support push of multiple items', function () {
				var numberList = aNumberArray([1, 2]);
				numberList.push(3, 4);

				expect(numberList.length).to.equal(4);
				expect(numberList.at(2)).to.equal(3);
				expect(numberList.at(3)).to.equal(4);
			});

			it('should report deep errors', function () {
				var numberList = aNumberArray([1, 2]);
				numberList.push(3, 4);

				expect(numberList.length).to.equal(4);
				expect(numberList.at(2)).to.equal(3);
				expect(numberList.at(3)).to.equal(4);
			});
			lifeCycleAsserter.assertMutatorContract((arr, elemFactory) => arr.push(elemFactory()), 'push');
		});

		describe('set', function () {
			it('should replace an existing element', ()  => {
				var arr = aStringArray(['a']);

				arr.set(0, 'b');

				expect(arr.toJSON()).to.eql(['b']);
			});
			it('should add an element if none exists', ()  => {
				var arr = anEmptyArray();

				arr.set(0, 42);

				expect(arr.toJSON()).to.eql([42]);
			});

			it('should return the element', () => {
				var arr = aStringArray(['a']);

				expect(arr.set(0, 'b')).to.eql('b');
			});

			lifeCycleAsserter.assertMutatorContract((arr, elemFactory) => arr.set(0, elemFactory()), 'set');
		});

		describe('shift', function () {
			it('should return the first element from the array', function () {
				var numberList = aNumberArray();
				var arrayBeforeShift = numberList.concat();

				var valueRemoved = numberList.shift();

				expect(arrayBeforeShift.at(0)).to.equal(valueRemoved);
			});

			it('should remove an element from the array', function () {
				var numberList = aNumberArray();
				var lengthBeforeShift = numberList.length;

				numberList.shift();

				expect(numberList.length).to.equal(lengthBeforeShift - 1);
			});

			lifeCycleAsserter.assertMutatorContract((arr) => arr.shift(), 'shift');
		});


		describe('unshift', function () {
			it('should return the length of the array', function () {
				var numberList = aNumberArray();

				var valueRemoved = numberList.unshift();

				expect(numberList.length).to.equal(valueRemoved, 'Did not return the proper array.length');
			});

			it('should add an element to the array', function () {
				var numberList = aNumberArray();
				var lengthBeforeUnshift = numberList.length;

				numberList.unshift(5);

				expect(numberList.length).to.equal(lengthBeforeUnshift + 1);
			});

			lifeCycleAsserter.assertMutatorContract((arr, elemFactory) => arr.unshift(elemFactory(), elemFactory()), 'unshift');

		});
	});
});
