import Typorama from '../../src';
import {LifeCycleManager, revision} from '../../src/lifecycle.js';
import {aDataTypeWithSpec} from '../../test-kit/testDrivers/index';
import {expect} from 'chai';
import {either} from '../../src/composite'
import _ from 'lodash';
import {lifecycleContract} from '../lifecycle.contract.spec.js';
import sinon from 'sinon';
import {aNumberArray, aStringArray, UserType, AddressType, UserWithAddressType} from './builders';
import lifeCycleAsserter from './lifecycle.js';

describe('Array data', function() {

	describe('lifecycle:',function() {
		lifeCycleAsserter.assertDirtyContract();
	});

	describe('mutable instance', function() {

		it('Should have default length', function() {
			var numberList = aNumberArray([1, 2, 3]);
			expect(numberList.length).to.equal(3);
		});

		describe("with global freeze config", function(){

			before("set global freeze configuration", function(){
				Typorama.config.freezeInstance = true;
			});

			after("clear global freeze configuration", function(){
				Typorama.config.freezeInstance = false;
			});

			it("should throw error on unknown field setter", function(){
				var names = aStringArray();

				expect(function(){
					names[4] = "there is no 4 - only at()";
				}).to.throw('object is not extensible');
			});

		});

		require('./set-value');

		require('./at');

		require('./item-mutations');

		require('./views');

		describe('reverse', function() {
			it('should reverse the order of elements in an array', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				var newList = numberList.concat();

				newList.reverse();

				for (var i = 0; i < numberList.length; i++) {
					expect(numberList.at(i)).to.equal(newList.at(newList.length - i - 1));
				};
			});

			it('should return a typed array', function () {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				var newList = numberList.concat();

				newList.reverse();

				expect(newList instanceof Typorama.Array).to.be.true;
			});

			lifeCycleAsserter.assertMutatorContract((arr) => arr.reverse(), 'reverse');
		});

		describe('sort', function() {
					it('should sort the elements of an array in place', function() {
						var stringArray = Typorama.Array.of(Typorama.String).create(['Blue', 'Humpback', 'Beluga']);
						var numberArray = Typorama.Array.of(Typorama.Number).create([40, 1, 5, 200]);

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

					lifeCycleAsserter.assertMutatorContract((arr) => arr.sort(function(a, b) {return a > b; }), 'sort');
				});


		describe('indexOf', function () {
			it('should return the first index of an element within an array equal to the specified value', function() {
				var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b']);

				var result = arrA.indexOf('a');

				expect(result).to.eql(0);
			});
			it('should return -1 if none is found', function() {
				var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b']);

				var result = arrA.indexOf('a', 1);

				expect(result).to.eql(-1);
			});
		});

		describe('lastIndexOf', function () {
			it('should return the last index at which a given element can be found in the array', function() {
				var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b', 'a']);
				var result = arrA.lastIndexOf('a');

				expect(result).to.eql(2);
			});

			it('should take a 2nd argument, the index at which to start searching backwards', function() {
				var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b', 'a']);

				var result = arrA.lastIndexOf('b', 2);

				expect(result).to.eql(1);
			});

			it('should return -1 if none is found', function() {
				var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b', 'a']);

				var result = arrA.lastIndexOf('c');

				expect(result).to.eql(-1);
			});
		});

		describe('valueOf', function() {
			it('should return the primitive value of the specified object', function() {
				var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b']);

				var result = arrA.valueOf();
				expect(result).to.eql(['a', 'b']);
				expect(result instanceof Array).to.be.true;
			});

		});

		describe('map', function() {
			describe('with property name iteratee', function() {
				it('naively works', function() {
					var usersList = Typorama.Array.of(UserType).create([{age: 11}, {age: 12}]);
					var newList = usersList.map('age');

					// Take a property and return an array
					expect(_.isArray(newList)).to.be.true;
					// Make sure the values and length are correct
					expect(newList).to.eql([11, 12]);
				});
				it('matches property value to thisArg', function() {
					var usersList = Typorama.Array.of(UserType).create([{age: 11}, {age: 12}]);
					var newList = usersList.map('age', 11);

					// Take a property and return an array
					expect(_.isArray(newList)).to.be.true;
					// Make sure the values and length are correct
					expect(newList).to.eql([true, false]);
				});
			});
			describe('with object iteratee', function() {
				it('works with typorama instances', function() {
					var usersList = Typorama.Array.of(UserType).create([{age: 11}, {age: 12}]);
					var newList = usersList.map(UserType.create({age: 11}));

					// Take a property and return an array
					expect(_.isArray(newList)).to.be.true;
					// Make sure the values and length are correct
					expect(newList).to.eql([true, false]);
				});
				it('works with pojos', function() {
					var usersList = Typorama.Array.of(UserType).create([{age: 11}, {age: 12}]);
					var newList = usersList.map({age: 11});

					// Take a property and return an array
					expect(_.isArray(newList)).to.be.true;
					// Make sure the values and length are correct
					expect(newList).to.eql([true, false]);
				});
			});
			it('calls a callback function on every item in an array and constructs a new array from the results', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3]);
				var doubles = function(num) {
					return num * 2;
				};
				var newList = numberList.map(doubles);

				// Take a callback function and return an array
				expect(_.isArray(newList)).to.be.true;
				// Make sure the values and length are correct
				expect(newList).to.eql([2, 4, 6]);
			});

			it('passes the index to the map func', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3]);
				var doubles = function(num,index) {
					return num * index;
				};
				var newList = numberList.map(doubles);

				expect(_.isArray(newList)).to.be.true;
				expect(newList).to.eql([0, 2, 6]);
			});


			it('provides readonly version if needsd', function() {
				var numberList = Typorama.Array.of(UserType).create([new UserType({age:5}),new UserType({age:10}),new UserType({age:15})]);
				numberList = numberList.$asReadOnly();
				var doubles = function(user,index) {
					expect(user.$isReadOnly()).to.be.equal(true);
					return user.age * index;
				};
				var newList = numberList.map(doubles);

				expect(_.isArray(newList)).to.be.true;
				expect(newList).to.eql([0, 10, 30]);
			});

		});

		describe('reduce', function() {
			// Run only as many times as it should
			it('should run as many times as array.length if accum default value is NOT passed', function () {
				var numberList = Typorama.Array.of(Typorama.Number).create([23, 542, 233, 24]);
				var counter = 0;

				var reduceArry = numberList.reduce(function(accumulator, currentValue) {
					counter++;
					return accumulator+currentValue;
				});

				expect(counter).to.equal(3);
			});
			it('should run as many times as array.length if accum default value is passed', function () {
				var numberList = Typorama.Array.of(Typorama.Number).create([23, 542, 233, 24]);
				var counter = 0;
				var defAccum = 42;

				var reduceArry = numberList.reduce(function(accumulator, currentValue) {
					counter++;
					return accumulator+currentValue;
				}, defAccum);

				expect(counter).to.equal(4);
			});

			// Make sure extra paramater is passed as the initial value of accum

			it('should use the first item of the array as the def accumulator', function () {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);

				var result = numberList.reduce(function(accumulator, currentValue) {
					return accumulator;
				});

				expect(result).to.eql(numberList.at(0));
			});

			it('should take an extra paramater to be passed as the default accumulator', function () {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				var defAccum = 42;

				var result = numberList.reduce(function(accumulator, currentValue) {
					return accumulator;
				}, defAccum);

				expect(result).to.eql(defAccum);
			});

			// Make sure what I return once, is passed as accum

			it('should take an extra paramater to be passed as the default accumulator', function () {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				var newAccum=numberList.at(0);

				var result = numberList.reduce(function(accumulator, currentValue, index) {
					// Expect the value of accumulator to equal the value the last cycle returned
					expect(accumulator).to.eql(newAccum);

					newAccum = accumulator+currentValue;
					return newAccum;
				});
			});

			// Compare returned value to the expected result

			it('should take an array, iteratae over it with a callback function and accumilate the results into a single value', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);

				var result = numberList.reduce(function(accumulator, currentValue) {
					return accumulator + currentValue;
				});

				expect(result).to.eql(10);
			});

			// Make sure n = current value

			it('should match currentValue to the correct current item from the array', function () {
				var mixedList = Typorama.Array.of(either(UserType, AddressType)).create([{_type: 'User'}, {_type: 'Address'}])

				mixedList.reduce(function(accumulator, currentValue, index) {
					expect(currentValue).to.eql(mixedList.at(index));
					return currentValue;
				});
			});
		});

		describe('forEach',function() {
			it('should call the method passed with item, index, arr', function() {
				var sourceArr = [1,2,3];
				var numberList = Typorama.Array.of(Typorama.Number).create(sourceArr);
				var count = 0;

				numberList.forEach(function(item, index, arr) {
					expect(item).to.equal(sourceArr[index]);
					expect(index).to.equal(count);
					expect(arr).to.equal(numberList);
					count++;
				})

			});
		});

		describe('concat',function() { // ToDo: make them work
			it('should be able to concat N arrays of the same type', function() {
				var firstNumberList = Typorama.Array.of(Typorama.Number).create([1, 2]);
				var secondNumberList = Typorama.Array.of(Typorama.Number).create([3, 4]);
				var thirdNumberList = [5,6];
				var concatResult = firstNumberList.concat(secondNumberList, thirdNumberList);

				expect(concatResult.length).to.equal(6, 'Length check');
				expect(concatResult.__value__).to.eql([1, 2, 3, 4, 5, 6], 'Equality test'); //TODO: create matcher.
			});

			it('should be able to concat N arrays of the different types', function() {
				var mixedArray = Typorama.Array.of([Typorama.Number, Typorama.String]).create([1, '2']);
				var strings = Typorama.Array.of(Typorama.String).create(['3', '4']);
				var numbers = [5, 6];
				var concatResult = mixedArray.concat(strings, numbers);
				expect(concatResult.length).to.equal(6, 'Length check');
				expect(concatResult.__value__).to.eql([1, '2', '3', '4', 5, 6], 'Equality test'); //TODO: create matcher.
			});

			it('should allow subtypes allowed by all the different arrays',function() {
				var mixedInstance = Typorama.Array.of(either(UserType, AddressType)).create([
					{ _type: UserType.id },
					{ _type: AddressType.id },
					{}
				]);
				var addressList = Typorama.Array.of(AddressType).create([{}]);
				var mixedList = [{_type: UserType.id}, {_type: AddressType.id}];
				var concatResult = mixedInstance.concat(addressList, mixedList);

				expect(concatResult.length).to.equal(6);
				expect(concatResult.at(0) instanceof UserType    ).to.equal(true, 'Type test expected:UserType');
				expect(concatResult.at(1) instanceof AddressType ).to.equal(true, 'Type test expected:AddressType');
				expect(concatResult.at(2) instanceof UserType    ).to.equal(true, 'Type test expected:UserType');
				expect(concatResult.at(3) instanceof AddressType ).to.equal(true, 'Type test expected:AddressType');
				expect(concatResult.at(4) instanceof UserType    ).to.equal(true, 'Type test expected:UserType');
				expect(concatResult.at(5) instanceof AddressType ).to.equal(true, 'Type test expected:AddressType');

			});
		});

		describe('splice',function() {
			it('changes the content of an array by removing existing elements and/or adding new elements', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
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

			it('Should wrap items for none immutable data (like custom types)', function() {
				var arr = Typorama.Array.of(UserType).create([{name: 'aag'}, {name: 'dag'}]);
				arr.splice(0, 1, {name: 'zag'});
				expect(arr.at(1) instanceof UserType).to.equal(true);
				expect(arr.at(0).name).to.equal('zag');
				expect(arr.at(1).name).to.equal('dag');
			});

			lifeCycleAsserter.assertMutatorContract((arr, elemFactory) => arr.splice(1, 2, elemFactory()), 'splice');
		});
		describe('unshift', function () {
			it('should return the length of the array', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);

				var valueRemoved = numberList.unshift();

				expect(numberList.length).to.equal(valueRemoved, 'Did not return the proper array.length');
			});

			it('should add an element to the array', function () {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				var lengthBeforeUnshift = numberList.length;

				numberList.unshift(5);

				expect(numberList.length).to.equal(lengthBeforeUnshift + 1);
			});
			lifeCycleAsserter.assertMutatorContract((arr, elemFactory) => arr.unshift(elemFactory(), elemFactory()), 'unshift');

		});
		describe('every',function() {
			it('should return true if all elements pass the test provided by the callback', function() {
				var arr = Typorama.Array.of(Typorama.String).create(['a', 'a']);
				var areAll = arr.every(function (element) {
					return element === 'a';
				});
				expect(areAll).to.equal(true);
			});
			it('should return false if at least one element in the array returns false from the callback', function() {
				var arr = Typorama.Array.of(Typorama.String).create(['a', 'b']);
				var areAll = arr.every(function (element) {
					return element === 'a';
				});
				expect(areAll).to.equal(false);
			})
		});

		describe('some', function() {
			it('should return true if any elements pass the test provided by the callback', function() {
				var arr = Typorama.Array.of(Typorama.String).create(['a', 'b']);
				var areAll = arr.some(function (element) {
					return element === 'a';
				});
				expect(areAll).to.equal(true);
			});
			it('should return false if all elements fail to pass the test provided by the callback', function() {
				var arr = Typorama.Array.of(Typorama.String).create(['b', 'b']);
				var areAll = arr.some(function (element) {
					return element === 'a';
				});
				expect(areAll).to.equal(false);
			})
		});

		describe('find',function() {
			it('should return the first element that passes the callback test', function() {
				var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
				var itemFound = arr.find(function(element) {
					return element.name === 'mollari'
				});
				expect(itemFound).to.equal(arr.at(1));
			});
			xit('should return the first element that matches the passed object', function() {
				var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
				var itemFound = arr.find({name: 'mollari'});
				expect(itemFound).to.equal(arr.at(1));
			});
			it('should return undefined if no elements that pass the callback test', function() {
				var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
				var itemFound = arr.find((element) => element.name === `G'Kar`);
				expect(itemFound).to.equal(undefined);
			})

		});

		describe('findIndex',function() {
			it('should return the index of the first element that passes the callback test', function() {
				var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
				var itemIndex = arr.findIndex(function(element) {
					return element.name === 'mollari'
				});
				expect(itemIndex).to.equal(1);
			});
			xit('should return the index of the first element that matches the passed object', function() {
				var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
				var itemIndex = arr.findIndex({name: 'mollari'});
				expect(itemIndex).to.equal(1);
			});
			it('should return -1 if no elements pass the callback test', function() {
				var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
				var itemIndex = arr.findIndex((element) => `G'Kar` === element.name);
				expect(itemIndex).to.equal(-1);
			})

		});

		describe('filter',function() {
			it('should return a new array with all elements that pass the callback test', function() {
				var arr = Typorama.Array.of(Typorama.Number).create([42, 3, 15, 4, 7]);
				var filterArray = arr.filter(function(element) {
					return element > 5;
				});
                expect(filterArray).to.be.instanceof(Typorama.Array);
				expect(filterArray.length).to.equal(3);
				expect(filterArray.valueOf()).to.eql([42, 15, 7]);
			});
			it('should return an empty array if no elements pass the callback test', function() {
				var arr = Typorama.Array.of(Typorama.Number).create([42, 3, 15, 4, 7]);
				var filterArray = arr.filter(function(element) {
					return element > 50;
				});
				expect(filterArray.length).to.equal(0);
			});
		});


		describe('as field on data object', function() {

			var GroupType = Typorama.define('GroupType', {
				spec: function(GroupType) {
					return {
						title: Typorama.String,
						users: Typorama.Array.of(UserType)
					};
				}
			});

			it('Should be modified from json ', function() {
				var groupData = new GroupType();

				groupData.users = Typorama.Array.of(UserType).create([
					{'name':'tom', 'age':25},
					{'name':'omri', 'age':35}
				]);

				expect(groupData.users.at(0).name).to.equal('tom');
				expect(groupData.users.at(0).age).to.equal(25);
				expect(groupData.users.at(1).name).to.equal('omri');
				expect(groupData.users.at(1).age).to.equal(35);
			});
		});

	});

	require("./read-only");

});

