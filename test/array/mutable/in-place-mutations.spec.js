import Typorama from '../../../src';
import {aNumberArray, aStringArray, UserType} from '../builders';
import {expect} from 'chai';
import lifeCycleAsserter from '../lifecycle.js';

describe('Array', function() {
	describe('mutable instance', function() {

		describe('reverse', function () {
			it('should reverse the order of elements in an array', function () {
				var numberList = aNumberArray();
				var newList = numberList.concat();

				newList.reverse();

				expect(newList).to.be.instanceOf(Typorama.Array);

				for (var i = 0; i < numberList.length; i++) {
					expect(numberList.at(i)).to.equal(newList.at(newList.length - i - 1));
				}
				;
			});

			lifeCycleAsserter.assertMutatorContract((arr) => arr.reverse(), 'reverse');
		});

		describe('sort', function () {
			it('should sort the elements of an array in place', function () {
				var stringArray = aStringArray(['Blue', 'Humpback', 'Beluga']);
				var numberArray = aNumberArray([40, 1, 5, 200]);

				function compareNumbers(a, b) {
					return a - b;
				}

				var sortedStringArray = stringArray.sort().toJSON();
				var sortedNumberArray = numberArray.sort().toJSON();
				var funkySortNumberArray = numberArray.sort(compareNumbers).toJSON();

				expect(sortedStringArray).to.eql(sortedStringArray.sort());
				expect(sortedNumberArray).to.eql(sortedNumberArray.sort());
				expect(funkySortNumberArray).to.eql(funkySortNumberArray.sort(compareNumbers));
			});

			lifeCycleAsserter.assertMutatorContract((arr) => arr.sort(function (a, b) {
				return a > b;
			}), 'sort');
		});

		describe('splice', function () {
			it('changes the content of an array by removing existing elements and/or adding new elements', function () {
				var numberList = aNumberArray([1, 2, 3, 4]);

				var removedItems = numberList.splice(1, 2, 7, 10, 13);

				expect(numberList.length).to.equal(5);
				expect(numberList.at(0)).to.equal(1);
				expect(numberList.at(1)).to.equal(7);
				expect(numberList.at(2)).to.equal(10);
				expect(numberList.at(3)).to.equal(13);
				expect(numberList.at(4)).to.equal(4);

				expect(removedItems.length).to.equal(2);
				expect(removedItems[0]).to.equal(2);
				expect(removedItems[1]).to.equal(3);
			});

			it('Should wrap items for none immutable data (like custom types)', function () {
				var arr = Typorama.Array.of(UserType).create([{name: 'aag'}, {name: 'dag'}]);

				arr.splice(0, 1, {name: 'zag'});

				expect(arr.at(1)).to.be.instanceOf(UserType);
				expect(arr.at(0).name).to.equal('zag');
				expect(arr.at(1).name).to.equal('dag');
			});

			lifeCycleAsserter.assertMutatorContract((arr, elemFactory) => arr.splice(1, 2, elemFactory()), 'splice');
		});
	});
});
