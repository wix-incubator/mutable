import Typorama from '../src';
import {LifeCycleManager, revision} from '../src/lifecycle.js';
import {aDataTypeWithSpec} from '../test-kit/testDrivers/index';
import {expect} from 'chai';
import {either} from '../src/composite'
import _ from 'lodash';
import {lifecycleContract} from './lifecycle.contract.spec.js';
import sinon from 'sinon';

var UserType = aDataTypeWithSpec({
	name: Typorama.String.withDefault(''),
	age: Typorama.Number.withDefault(10)
}, 'User');

var AddressType = aDataTypeWithSpec({
	address: Typorama.String.withDefault(''),
	code: Typorama.Number.withDefault(10)
}, 'Address');

var UserWithAddressType = aDataTypeWithSpec({
	user: UserType,
	address: AddressType
}, 'UserWithAddress');

function aStringArray() {
	return Typorama.Array.of(Typorama.String).create(["John", "Paul", "George", "Ringo"]);
}

function aNumberArray(optionalArr) {
	return Typorama.Array.of(Typorama.Number).create(optionalArr || [1,2]);
}

var lifeCycleAsserter = lifecycleContract();
lifeCycleAsserter.addFixture(
	(...elements) => Typorama.Array.of(UserType).create(elements),
	() => new UserType(),
	'array with mutable elements'
);
lifeCycleAsserter.addFixture(
	(...elements) => Typorama.Array.of(Typorama.Number).create(elements),
	() => Math.random(),
	'array with primitives'
);


describe('Array data', function() {

	describe('lifecycle:',function() {

		lifeCycleAsserter.assertDirtyContract();
	});
	describe('unsync __value__ array bug', function(){

		it('__value__ should be synced with the readonly', function(){
			var User = Typorama.define('user', {
				spec: function(){
					return {
						name: Typorama.String
					}
				}

			});

			var arr = Typorama.Array.of(User).create();
			var readOnly = arr.$asReadOnly();
			arr.setValue([User.defaults()])
			expect(arr.__value__).to.equal(readOnly.__value__);
		});
		xit('should fail', function(){
			var Type = Typorama.define('Type',{
				spec: function(){
					return {
						items: Typorama.Array.of(User)
					};
				}
			});
			var type = new Type();
			var readOnly = type.$asReadOnly();
			type.setValue({items: Typorama.Array.of(User).create([User.defaults(), User.defaults()]) });
			var items = readOnly.items;
			expect(items.__value__).to.eql(['hello', 'world'])
		})
	});

	describe('mutable instance', function() {

		var TestType, testType;

		before("define an array type with default", function() {
			TestType = aDataTypeWithSpec({
				names: Typorama.Array.of(Typorama.String).withDefault(["Beyonce", "Rihanna", "Britney", "Christina"])
			}, "TestType");
		});

		before("instantiate a type with default array", function() {
			testType = new TestType();
		});

		describe("with global freeze config", function(){

			before("set global freeze configuration", function(){
				Typorama.config.freezeInstance = true;
			});

			after("clear global freeze configuration", function(){
				Typorama.config.freezeInstance = false;
			});

			it("should throw error on unknown field setter", function(){
				var names = Typorama.Array.of(Typorama.String).create(["Beyonce", "Rihanna", "Britney", "Christina"]);

				expect(function(){
					names[4] = "there is no 4 - only at()";
				}).to.throw();
			});

		});

		it('Should have default length', function() {
			var numberList = new Typorama.Array([1, 2, 3, 4], {subTypes: Typorama.Number});
			expect(numberList.length).to.equal(4);
		});

		it('Should be created once for each data instance', function() {
			var numberList = new Typorama.Array([1, 2, 3, 4], {subTypes: Typorama.Number});
			var numberListReadOnly = numberList.$asReadOnly();
			var numberListReadOnly2 = numberList.$asReadOnly();

			expect(numberListReadOnly).to.equal(numberListReadOnly2);
		});

		describe('setValue', function() {
			lifeCycleAsserter.assertMutatorContract((arr, elemFactory) => arr.setValue([elemFactory(), elemFactory()]), 'setValue');

			it('should not get dirty if values are not changed', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				revision.advance();
				var rev = revision.read();
				numberList.setValue([1, 2, 3, 4]);
				expect(numberList.$isDirty(rev)).to.equal(false);
			});
			it('should replace the value of the array', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				numberList.setValue([5, 6, 7, 8]);
				expect(numberList.toJSON()).to.eql([5, 6, 7, 8]);
			});
			it('should completely redefine array data', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				numberList.setValue([1, 2]);

				expect(numberList.toJSON()).to.eql([1,2]);
			});
			describe('setValue on an array with complex subtype',function(){
				it('should keep typorama objects passed to it that fit its subtypes', function() {
					var mixedList = Typorama.Array.of(either(UserType,AddressType)).create([]);
					var newUser = new UserType();
					var newAddress = new AddressType();
					mixedList.setValue([newUser, newAddress]);

					expect(mixedList.at(0)).to.eql(newUser);
					expect(mixedList.at(1)).to.eql(newAddress);
				});
				it('single subtype array should allow setting data with json, ', function() {
					var address = new AddressType({address:'gaga'});
					var mixedList = Typorama.Array.of(AddressType).create([address]);
					mixedList.setValue([{code:5}]);

					expect(mixedList.at(0)).to.be.instanceOf(AddressType);
					expect(mixedList.at(0).code).to.be.eql(5);
					expect(mixedList.at(0).address).to.be.eql('');
					expect(mixedList.at(0)).to.not.be.eql(address);

				});
				it('should set the new item lifecycle manager when creating new from JSON ', function() {

					var mockManager = new LifeCycleManager();
					var address = new AddressType({address:'gaga'});
					var mixedList = Typorama.Array.of(AddressType).create([]);
					mixedList.$setManager(mockManager);
					mixedList.setValue([{code:5}]);

					expect(mixedList.at(0).__lifecycleManager__).to.be.eql(mockManager);

				});
			})

		});

		it("setValue with Typorama object containing Typorama array of string", function() {
			testType = new TestType();

			expect(testType.names.length).to.equal(4);
			expect(testType.names.at(0)).to.equal("Beyonce");
			expect(testType.names.at(1)).to.equal("Rihanna");
			expect(testType.names.at(2)).to.equal("Britney");
			expect(testType.names.at(3)).to.equal("Christina");

			testType.setValue({
				names: Typorama.Array.of(Typorama.String).create(["John", "Paul", "George", "Ringo"])
			});

			expect(testType.names.length).to.equal(4);
			expect(testType.names.at(0)).to.equal("John");
			expect(testType.names.at(1)).to.equal("Paul");
			expect(testType.names.at(2)).to.equal("George");
			expect(testType.names.at(3)).to.equal("Ringo");
		});

		it("setValue on array with JSON array of string", function() {
			var test = Typorama.Array.of(Typorama.String).create();

			expect(test.length).to.equal(0);

			test.setValue(["John", "Paul", "George", "Ringo"]);

			expect(testType.names.length).to.equal(4);
			expect(test.at(0)).to.equal("John");
			expect(test.at(1)).to.equal("Paul");
			expect(test.at(2)).to.equal("George");
			expect(test.at(3)).to.equal("Ringo");
		});


		it("setValue with JSON object containg JSON array of string", function() {
			testType = new TestType();

			expect(testType.names.length).to.equal(4);
			expect(testType.names.at(0)).to.equal("Beyonce");
			expect(testType.names.at(1)).to.equal("Rihanna");
			expect(testType.names.at(2)).to.equal("Britney");
			expect(testType.names.at(3)).to.equal("Christina");

			testType.setValue({ names: ["John", "Paul", "George", "Ringo"] });

			expect(testType.names.length).to.equal(4);
			expect(testType.names.at(0)).to.equal("John");
			expect(testType.names.at(1)).to.equal("Paul");
			expect(testType.names.at(2)).to.equal("George");
			expect(testType.names.at(3)).to.equal("Ringo");
		});

        it("setValue with JSON object containg empty array", function() {
            var TestType1 = aDataTypeWithSpec({
                gaga: Typorama.String
            }, "TestType1");
            var TestType2 = aDataTypeWithSpec({
                baga: Typorama.String
            }, "TestType2");
            var TestType3 = aDataTypeWithSpec({
                gagot: Typorama.Array.of(TestType1,TestType2).withDefault([{},{}])
            }, "TestType3");
            var testObj = new TestType3();


            testObj.setValue({ gagot: [] });

            expect(testObj.gagot.length).to.equal(0);
            expect(testObj.gagot.at(0)).to.equal(undefined);
        });
        it("setValue with array with compatible but different options", function() {
            var TestType1 = aDataTypeWithSpec({
                gaga: Typorama.String
            }, "TestType1");
            var TestType2 = aDataTypeWithSpec({
                baga: Typorama.String
            }, "TestType2");
            var TestType3 = aDataTypeWithSpec({
                gagot: Typorama.Array.of(TestType1,TestType2).withDefault([{},{},{}])
            }, "TestType3");
            var TestType4 = aDataTypeWithSpec({
                gagot: Typorama.Array.of(TestType2).withDefault([{}])
            }, "TestType3");
            var testObj = new TestType3();
            var test2Obj = new TestType4();


            testObj.setValue({ gagot: test2Obj.gagot });

            expect(testObj.gagot.length).to.equal(1);
        });
		describe('at', function() {

			it('Should return a number for native immutable Typorama.Number', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				expect(numberList.at(0)).to.equal(1);
			});

			it('Should return a string for native immutable Typorama.String', function() {
				var arr = Typorama.Array.of(Typorama.String).create(['123', 'abcd']);
				expect(arr.at(0)).to.equal('123');
			});

			it('Should return wrapped item that passes the test() of their type', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				expect(numberList.__options__.subTypes.validate(numberList.at(0))).to.equal(true);
			});

			it('Should return a typed item for none immutable data (like custom types)', function() {
				var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12}]);
				expect(arr.at(0) instanceof UserType).to.equal(true);
			});

			it('Should always return a the same reference for wrapper', function() {
				var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12}]);
				expect(arr.at(0)).to.equal(arr.at(0));
			});

			it('Should return a typed item form multiple types if there is _type field', function() {
				var data = [
					{_type:'User',  name: 'avi', age: 12},
					{_type:'Address', name: 'avi', age: 12}
				];
				var arr = Typorama.Array.of(either(UserType,  AddressType)).create(data);
				expect(arr.at(0) instanceof UserType).to.equal(true, 'first item');
				expect(arr.at(1) instanceof AddressType).to.equal(true, 'second item');
			});

			it('Should modify inner complex data', function() {
				var arrComplexType = Typorama.Array.of(UserWithAddressType).create([{}, {}, {}]);

				arrComplexType.at(1).user.name = 'modified user name';

				expect(arrComplexType.at(1).user.name).to.equal('modified user name');
			});

			it('Should handle multi level array', function() {
				var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]]);

				expect(arrComplexType.at(0).at(0) instanceof UserWithAddressType).to.equal(true);
			});

			it('Should change type form multi level array', function() {
				var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]]);
				var userWithAddress = arrComplexType.at(0).at(0);

				userWithAddress.user.name = 'you got a new name';

				expect(userWithAddress.user.name).to.equal('you got a new name');
			});

			it('Should keep read only item as read only', function() {
				var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
				var readOnlyData = new UserWithAddressType().$asReadOnly();
				var arrComplexType = Typorama.Array.of(UserWithAddressType).create([readOnlyData]);

				var readOnlyItemData = arrComplexType.at(0);

				readOnlyItemData.user.name = 'you got a new name';

				expect(readOnlyItemData.user.name).to.equal(userDefaultName);
				expect(readOnlyItemData).to.equal(readOnlyData);
			});

		});

		describe('pop', function() {
			it('should remove the last element from an array', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				var oldArr = numberList.concat();

				var valueRemoved = numberList.pop();

				expect(numberList.length).to.equal(oldArr.length - 1);
				expect(valueRemoved).to.equal(oldArr.at(oldArr.length - 1));
			});

			it('should return undefined if called on an empty array', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([]);

				var valueRemoved = numberList.pop();

				expect(valueRemoved).to.be.undefined;

			});

			lifeCycleAsserter.assertMutatorContract((arr) => arr.pop(), 'pop');
		});


		describe('set', () => {
			it('should replace an existing element', ()  => {
				var arr = Typorama.Array.of(Typorama.String).create(['a']);
				arr.set(0, 'b');
				expect(arr.toJSON()).to.eql(['b']);
			});
			it('should add an element if none exists', ()  => {
				var arr = Typorama.Array.of(Typorama.String).create([]);
				arr.set(0, 'b');
				expect(arr.toJSON()).to.eql(['b']);
			});
			it ('should return the element', () => {
				var arr = Typorama.Array.of(Typorama.String).create(['a']);
				expect(arr.set(0, 'b')).to.eql('b');
			});
			lifeCycleAsserter.assertMutatorContract((arr, elemFactory) => arr.set(0, elemFactory()), 'set');
		});

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

		describe('shift', function() {
			it('should return the first element from the array', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				var arrayBeforeShift = numberList.concat();

				var valueRemoved = numberList.shift();

				expect(arrayBeforeShift.at(0)).to.equal(valueRemoved);
			});

			it('should remove an element from the array', function () {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				var lengthBeforeShift = numberList.length;

				numberList.shift();

				expect(numberList.length).to.equal(lengthBeforeShift - 1);
			});

			lifeCycleAsserter.assertMutatorContract((arr) => arr.shift(), 'shift');
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

		describe('join', function() {
			it('should join all the elements of an array into a string with default separator', function() {
				var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b']);
				var result = arrA.join();
				expect(result).to.equal("a,b");
			});
			it('should join all the elements of an array into a string with custom separator', function() {
				var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b']);
				var result = arrA.join('|');
				expect(result).to.equal("a|b");
			});
		});

		describe('slice', function () {
			it('creates a slice of array from start up to the end of the array. ', function () {
				var numberArray = aNumberArray([1,2,3]);

				var slicedArray = numberArray.slice(1,3);

				expect(slicedArray.at(0)).to.eql(numberArray.at(1));
			});
			it('should start from 0 if begin is omitted', function () {
				var numberArray = aNumberArray();

				var slicedArray = numberArray.slice();

				expect(slicedArray).to.eql(numberArray);
			});
			it('should offset from the end, if passed a negative BEGIN value', function () {
				var numberArray = aNumberArray([1,2,3]);

				var slicedArray = numberArray.slice(-(numberArray.length-1));

				expect(slicedArray).to.eql(aNumberArray([2,3]));
			});
			it('should offset from the end, if passed a negative END value', function () {
				var numberArray = aNumberArray([1,2,3]);

				var slicedArray = numberArray.slice(0, -1);

				expect(slicedArray).to.eql(aNumberArray([1,2]));
			});
			it('should not alter the original array', function () {
				var numberArray = aNumberArray();
				var oldArray = numberArray.concat();

				var slicedArray = numberArray.concat(1,1);

				expect(numberArray).to.eql(oldArray);
			});
			it('should return a typed object', function () {
				var numberArray = aNumberArray();

				var slicedArray = numberArray.concat(1,1);

				expect(slicedArray instanceof Typorama.Array).to.be.true;
			});
		});

		describe('toString', function() {
			it('should take an array, and return a string', function() {
				var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b']);

				var result = arrA.toString();

				expect(result).to.eql("a,b");
			});
		});

		describe('toJSON', function() {
			it('should take a typorama array of primitives, and return a native js array of primitives', function() {
				var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b']);

				expect(arrA.toJSON(), 'toJSON() called').to.eql(['a', 'b']);
				expect(arrA.toJSON(false), 'toJSON(false) called').to.eql(['a', 'b']);
			});
			it('should take a typorama array of custom types, and return a native js array of objects', function() {
				var arrA = Typorama.Array.of(UserType).create([{age : 11}, {age : 12}]);

				expect(arrA.toJSON(), 'toJSON() called').to.eql([{age : 11, name : new UserType().name}, {age : 12, name : new UserType().name}]);
				expect(arrA.toJSON(false), 'toJSON(false) called').to.eql([new UserType({age : 11}), new UserType({age : 12})]);
			});
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

		describe('push',function() {
			it('it should add a number to an array ', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				var lengthBeforePush = numberList.length;
				var newIndex = numberList.push(5);
				expect(newIndex).to.equal(5);
				expect(numberList.length).to.equal(lengthBeforePush+1);
				expect(numberList.at(4)).to.equal(5);
			});

			it('Should add a typed item for none immutable data (like custom types)', function() {
				var arr = Typorama.Array.of(UserType).create([]);
				arr.push({name: 'zag'});
				expect(arr.at(0) instanceof UserType).to.equal(true);
			});

			it('Should add a typed item form multiple types if there is _type field', function() {
				var arr = Typorama.Array.of(either(UserType, AddressType)).create([]);
				arr.push({_type: 'User'});
				arr.push({_type: 'Address'});
				expect(arr.at(0) instanceof UserType).to.equal(true);
				expect(arr.at(1) instanceof AddressType).to.equal(true);
			});

			it('Should support multiple push items', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
				numberList.push(5, 6);

				expect(numberList.length).to.equal(6);
				expect(numberList.at(4)).to.equal(5);
				expect(numberList.at(5)).to.equal(6);
			});
			lifeCycleAsserter.assertMutatorContract((arr, elemFactory) => arr.push(elemFactory()), 'push');

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

	describe('(Read Only) instance', function() {

		it('Should have default length', function() {
			var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
			expect(numberList.length).to.equal(4);
		});

		it('Should keep the source instance not readOnly', function() {
			// this is beacause the readonly instance used to have a bug in which it changed the original item value while wrapping it
			var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);

			numberList.$asReadOnly();
			numberList.setValue([5,6]);

			expect(numberList.toJSON()).to.eql([5,6]);
		});

		describe("with global freeze config", function(){

			before("set global freeze configuration", function(){
				Typorama.config.freezeInstance = true;
			});

			after("clear global freeze configuration", function(){
				Typorama.config.freezeInstance = false;
			});

			it("should throw error on unknown field setter", function(){
				var names = Typorama.Array.of(Typorama.String).create(["Beyonce", "Rihanna", "Britney", "Christina"]).$asReadOnly();

				expect(function(){
					names[4] = "there is no 4 - only at()";
				}).to.throw();
			});

		});

		describe('at', function() {

			it('Should return a number for native immutable Typorama.Number', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
				expect(numberList.at(0)).to.equal(1);
			});

			it('Should return a string for native immutable Typorama.String', function() {
				var arr = Typorama.Array.of(Typorama.String).create(['123', 'abcd']).$asReadOnly();
				expect(arr.at(0)).to.equal('123');
			});

			it('Should return wrapped item that passes the test() of their type', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
				expect(numberList.__options__.subTypes.validate(numberList.at(0))).to.equal(true);
			});

			it('Should return a typed item for none immutable data (like custom types)', function() {
				var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12}]).$asReadOnly();
				expect(arr.at(0) instanceof UserType).to.equal(true);
			});

			it('Should return a typed item form multiple types if there is _type field', function() {
				var data = [
					{_type:'User',  name: 'avi', age: 12},
					{_type:'Address', name: 'avi', age: 12}
				];
				var arr = Typorama.Array.of(either(UserType, AddressType)).create(data).$asReadOnly();
				expect(arr.at(0) instanceof UserType).to.equal(true);
				expect(arr.at(1) instanceof AddressType).to.equal(true);
			});

			it('Should not modify inner complex data', function() {
				var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
				var arrComplexType = Typorama.Array.of(UserWithAddressType).create([{}, {}, {}]).$asReadOnly();

				arrComplexType.at(1).user.name = 'modified user name';

				expect(arrComplexType.at(1).user.name).to.equal(userDefaultName);
			});

			it('Should handle multi level array', function() {
				//var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]], true);
				var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]]);

				var arrComplexTypeReadOnly = arrComplexType.$asReadOnly();

				expect(arrComplexTypeReadOnly.at(0).at(0) instanceof UserWithAddressType).to.equal(true);
			});

			it('Should not change type from multi level array', function() {
				//var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]], true);
				var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]]).$asReadOnly();
				var userWithAddress = arrComplexType.at(0).at(0);

				userWithAddress.user.name = 'you got a new name';

				expect(userWithAddress.user.name).to.equal('');
			});

		});

		describe('push',function() {
			it('should not modify an array ', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
				var lengthBeforePush = numberList.length;
				var newIndex = numberList.push(5);
				expect(newIndex).to.be.null;
				expect(numberList.length).to.equal(lengthBeforePush);
				expect(numberList.at(4)).to.equal(undefined);

			})
		});

		describe('splice',function() {
			it('should not modify an array ', function() {
				var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
				var lengthBeforeSplice = numberList.length;
				var removedItems = numberList.splice(1, 2, 7, 6, 5);
				expect(removedItems).to.be.null;
				expect(numberList.length).to.equal(lengthBeforeSplice);
				expect(numberList.at(0)).to.equal(1);
				expect(numberList.at(1)).to.equal(2);
				expect(numberList.at(2)).to.equal(3);
				expect(numberList.at(3)).to.equal(4);
			})
		});
	});

});

