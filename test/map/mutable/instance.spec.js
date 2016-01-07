import Typorama from '../../../src';
import {expect} from 'chai';
import sinon from 'sinon';
import builders from '../builders';
import lifeCycleAsserter from '../lifecycle.js';

function testReadFunctionality(builders, isReadonly) {
	describe('size', function () {
		it('should reflect number of entries in map', function () {
			var numbers = builders.aNumberMap({1: 1, 2: 2, 3: 3});
			expect(numbers.size).to.equal(3);
		});
	});

	describe("with global freeze config", function () {

		before("set global freeze configuration", function () {
			Typorama.config.freezeInstance = true;
		});

		after("clear global freeze configuration", function () {
			Typorama.config.freezeInstance = false;
		});

		it("should throw error on unknown field setter", function () {
			var numbers = builders.aNumberMap();
			expect(function () {
				numbers['boo'] = 4;
			}).to.throw('object is not extensible');
		});

	});

	describe('as field on data object', function () {
		var GroupType;
		before(() => {
			GroupType = Typorama.define('GroupType', {
				spec: function () {
					return {
						title: Typorama.String,
						users: Typorama.Map.of(Typorama.String, builders.UserType)
					};
				}
			});
		});

		it('Should be instantiatable ', function () {
			expect(() => new GroupType()).not.to.throw();
		});

		it('Should be modified from json ', function () {
			var groupData = new GroupType();
			groupData.users = Typorama.Map.of(Typorama.String, builders.UserType).create({
				tom: {'name': 'tom', 'age': 25},
				omri: {'name': 'omri', 'age': 35}
			});
			expect(groupData.users.get('tom').name).to.equal('tom');
			expect(groupData.users.get('tom').age).to.equal(25);
			expect(groupData.users.get('omri').name).to.equal('omri');
			expect(groupData.users.get('omri').age).to.equal(35);
		});
	});

	describe('toJSON', function () {
		it('should return entries json array by default', ()  => {
			var userA = new builders.UserType({age:1000});
			var userB = new builders.UserType({age:1001});
			var map = builders.aUserTypeMap([[userA, userB], [userB, userA]]);

			expect(map.toJSON()).to.eql([
				[userA.toJSON(), userB.toJSON()],
				[userB.toJSON(), userA.toJSON()]
			]);
		});
		it('should return entries array if not recursive', ()  => {
			var userA = new builders.UserType({age:1000});
			var userB = new builders.UserType({age:1001});
			var map = builders.aUserTypeMap([[userA, userB], [userB, userA]]);


			expect(map.toJSON(false)[0][0]).to.equal(userA);
			expect(map.toJSON(false)[0][1]).to.equal(userB);
			expect(map.toJSON(false)[1][0]).to.equal(userB);
			expect(map.toJSON(false)[1][1]).to.equal(userA);
		});
		if (isReadonly){
			it('should expose read only entries', ()  => {
				var userA = new builders.UserType({age:1000});
				var userB = new builders.UserType({age:1001});
				var map = builders.aUserTypeMap([[userA, userB]]);

				expect(map.toJSON(false)[0][0].$isReadOnly(), 'key is readOnly').to.equal(true);
				expect(map.toJSON(false)[0][1].$isReadOnly(), 'value is readonly').to.equal(true);
			});
		}
	});

	describe('clear', function () {
		if (isReadonly){
			it('should not change map', ()  => {
				var numbers = builders.aNumberMap({a: 1});
				numbers.clear();
				expect(numbers.toJSON()).to.eql([['a', 1]]);
			});
		} else {
			it('should remove all elements', ()  => {
				var numbers = builders.aNumberMap({a: 1});
				numbers.clear();
				expect(numbers.toJSON()).to.eql([]);
			});
		}
	});

	describe('set', function () {
		if (isReadonly) {
			it('should not change map', ()  => {
				var numbers = builders.aNumberMap({a: 1});
				numbers.set('a', 5);
				numbers.set('b', 5);
				expect(numbers.toJSON()).to.eql([['a', 1]]);
			});
		} else {
			it('should replace an existing element', ()  => {
				var numbers = builders.aNumberMap({a: 1});
				numbers.set('a', 5);
				expect(numbers.toJSON()).to.eql([['a', 5]]);
			});
			it('should add an element if none exists', ()  => {
				var numbers = builders.aNumberMap();
				numbers.set('a', 42);
				expect(numbers.toJSON()).to.eql([['a', 42]]);
			});
			it('should support a typorama object as an argument', ()  => {
				var userA = new builders.UserType({age:1000});
				var userB = new builders.UserType({age:1001});
				var map = builders.aUserTypeMap();
				map.set(userA, userA).set(userB, userA).set(userA, userB);

				// es6 vaguely defines order of elements in map.
				// if order definition breaks, consider using chai-things plugin for matching regardless of order
				// http://chaijs.com/plugins/chai-things
				expect(map.toJSON(false)).to.eql([[userA, userB], [userB, userA]]);
			});
			lifeCycleAsserter.assertMutatorContract(
				(map, elemFactory) => map.set(elemFactory(), elemFactory()), 'set');
		}
		it('should return the map', () => {
			var numbers = builders.aNumberMap({a: 5});
			expect(numbers.set('a', 42)).to.equal(numbers);
		});
	});

	describe('delete', function () {
		describe('when called with non-existing key', function () {
			it('should not change map ', ()  => {
				var numbers = builders.aNumberMap({a: 1});
				numbers.delete('b');
				expect(numbers.toJSON()).to.eql([['a', 1]]);
			});
			it('should return false', ()  => {
				var numbers = builders.aNumberMap({a: 1});
				expect(numbers.delete('b')).to.eql(false);
			});
		});
		describe('when called with existing key', function () {
			if (isReadonly) {
				it('should not change map', ()  => {
					var numbers = builders.aNumberMap({a: 1});
					numbers.delete('a');
					expect(numbers.toJSON()).to.eql([['a', 1]]);
				});
				it('should return false', () => {
					var numbers = builders.aNumberMap({a: 5});
					expect(numbers.delete('a')).to.equal(false);
				});
			} else {
				it('should remove matching element', ()  => {
					var numbers = builders.aNumberMap({a: 1});
					numbers.delete('a');
					expect(numbers.toJSON()).to.eql([]);
				});
				it('should support a typorama object as an argument', ()  => {
					var userA = new builders.UserType({age:1000});
					var userB = new builders.UserType({age:1001});
					var map = builders.aUserTypeMap([[userA, userB], [userB, userA]]);
					map.delete(userA);
					expect(map.toJSON(false)).to.eql([[userB, userA]]);
				});
				it('should return true', () => {
					var numbers = builders.aNumberMap({a: 5});
					expect(numbers.delete('a')).to.equal(true);
				});
			}
		});
		if (!isReadonly) {
			lifeCycleAsserter.assertMutatorContract(
				(map, elemFactory) => map.delete(map.toJSON()[0][0]), 'delete');
		}
	});
	describe('entries', function() {
		it('should return an iterator over the map elements', () => {
			var iterator = builders.aNumberMap({a: 1, b:2}).entries();
			var elem = iterator.next();
			expect(elem.done).to.eql(false);
			expect(elem.value).to.eql(['a', 1]);
			elem = iterator.next();
			expect(elem.done).to.eql(false);
			expect(elem.value).to.eql(['b', 2]);
			elem = iterator.next();
			expect(elem.done).to.eql(true);
		});
		if (isReadonly){
			it('should expose read only entries', ()  => {
				var userA = new builders.UserType({age:1000});
				var userB = new builders.UserType({age:1001});
				var element = builders.aUserTypeMap([[userA, userB]]).entries().next();

				expect(element.value[0].$isReadOnly(), 'key is readOnly').to.equal(true);
				expect(element.value[1].$isReadOnly(), 'value is readonly').to.equal(true);
			});
		}
	});

}


describe.only('Map', function() {
	describe('mutable instance', function() {
		testReadFunctionality(builders, false);
	});
	describe('read-only instance', function() {
		testReadFunctionality(builders.asReadOnly(), true);
	});
});
