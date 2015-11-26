import {aNumberArray, aStringArray, anEmptyArray, UserType, AddressType, UserWithAddressType} from '../builders';
import {LifeCycleManager, revision} from '../../../src/lifecycle.js';
import {aDataTypeWithSpec} from '../../../test-kit/testDrivers/index';
import Typorama from '../../../src';
import {expect} from 'chai';
import {either} from '../../../src/composite';
import lifeCycleAsserter from '../lifecycle.js';

describe('Array mutable instance', function() {

	describe('setValue', function () {
		lifeCycleAsserter.assertMutatorContract((arr, elemFactory) => arr.setValue([elemFactory(), elemFactory()]), 'setValue');

		it('should not get dirty if values are not changed', function () {
			var numberList = aNumberArray([1]);

			revision.advance();
			var rev = revision.read();
			numberList.setValue([1]);

			expect(numberList.$isDirty(rev)).to.beFalse;
		});

		it("accepts a vanilla JS array", function () {
			var list = anEmptyArray();

			expect(list.length).to.equal(0);

			list.setValue([17, 42]);

			expect(list.length).to.equal(2);
			expect(list.at(0)).to.equal(17);
			expect(list.at(1)).to.equal(42);
		});

		describe('replaces the value', function() {

			function aTestType(values) {
				var TestType = aDataTypeWithSpec({
					names: Typorama.Array.of(Typorama.String).withDefault(values)
				}, "TestType");

				return new TestType();
			};

			it("with Typorama object containing Typorama array of string", function () {
				var testType = aTestType(["Beyonce", "Rihanna"]);

				expect(testType.names.length).to.equal(2);
				expect(testType.names.at(0)).to.equal("Beyonce");
				expect(testType.names.at(1)).to.equal("Rihanna");

				testType.setValue({
					names: aStringArray(["John", "Paul", "George"])
				});

				expect(testType.names.length).to.equal(3);
				expect(testType.names.at(0)).to.equal("John");
				expect(testType.names.at(1)).to.equal("Paul");
				expect(testType.names.at(2)).to.equal("George");
			});

			it("with JSON object containg JSON array of string", function () {
				var testType = aTestType(["Beyonce", "Rihanna"]);

				testType.setValue({names: ["John", "Paul", "George"]});

				expect(testType.names.length).to.equal(3);
				expect(testType.names.at(0)).to.equal("John");
				expect(testType.names.at(1)).to.equal("Paul");
				expect(testType.names.at(2)).to.equal("George");
			});
		});

		it("with JSON object containg empty array", function () {
			var TestType1 = aDataTypeWithSpec({
				gaga: Typorama.String
			}, "TestType1");
			var TestType2 = aDataTypeWithSpec({
				baga: Typorama.String
			}, "TestType2");
			var TestType3 = aDataTypeWithSpec({
				gagot: Typorama.Array.of(TestType1, TestType2).withDefault([{}, {}])
			}, "TestType3");
			var testObj = new TestType3();

			testObj.setValue({gagot: []});

			expect(testObj.gagot.length).to.equal(0);
			expect(testObj.gagot.at(0)).to.equal(undefined);
		});

		it("with array with compatible but different options", function () {
			var TestType1 = aDataTypeWithSpec({
				gaga: Typorama.String
			}, "TestType1");
			var TestType2 = aDataTypeWithSpec({
				baga: Typorama.String
			}, "TestType2");
			var TestType3 = aDataTypeWithSpec({
				gagot: Typorama.Array.of(TestType1, TestType2).withDefault([{}, {}, {}])
			}, "TestType3");
			var TestType4 = aDataTypeWithSpec({
				gagot: Typorama.Array.of(TestType2).withDefault([{}])
			}, "TestType3");
			var testObj = new TestType3();
			var test2Obj = new TestType4();


			testObj.setValue({gagot: test2Obj.gagot});

			expect(testObj.gagot.length).to.equal(1);
		});

		describe('on an array with complex subtype', function () {
			it('should keep typorama objects passed to it that fit its subtypes', function () {
				var mixedList = Typorama.Array.of(either(UserType, AddressType)).create([]);
				var newUser = new UserType();
				var newAddress = new AddressType();
				mixedList.setValue([newUser, newAddress]);

				expect(mixedList.at(0)).to.eql(newUser);
				expect(mixedList.at(1)).to.eql(newAddress);
			});
			it('single subtype array should allow setting data with json, ', function () {
				var address = new AddressType({address: 'gaga'});
				var mixedList = Typorama.Array.of(AddressType).create([address]);
				mixedList.setValue([{code: 5}]);

				expect(mixedList.at(0)).to.be.instanceOf(AddressType);
				expect(mixedList.at(0).code).to.be.eql(5);
				expect(mixedList.at(0).address).to.be.eql('');
				expect(mixedList.at(0)).to.not.be.eql(address);

			});

			it('should set the new item lifecycle manager when creating new from JSON ', function () {
				var mockManager = new LifeCycleManager();
				var mixedList = Typorama.Array.of(AddressType).create([]);
				mixedList.$setManager(mockManager);
				mixedList.setValue([{code: 5}]);

				expect(mixedList.at(0).__lifecycleManager__).to.be.eql(mockManager);

			});
		})

	});
});
