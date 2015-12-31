import Typorama from '../../../src';
import {expect} from 'chai';
import sinon from 'sinon';
import {aNumberMap, UserType} from '../builders';

describe('Map', function() {
	describe('mutable instance', function() {
		it('Should have correct length', function() {
			var numbers = aNumberMap({1:1, 2:2, 3:3});
			expect(numbers.size).to.equal(3);
		});

		describe("with global freeze config", function(){

			before("set global freeze configuration", function(){
				Typorama.config.freezeInstance = true;
			});

			after("clear global freeze configuration", function(){
				Typorama.config.freezeInstance = false;
			});

			it("should throw error on unknown field setter", function(){
				var numbers = aNumberMap();
				expect(function(){
					numbers['boo'] = 4;
				}).to.throw('object is not extensible');
			});

		});

		describe('as field on data object', function() {
			var GroupType;
			beforeEach(() => {
				GroupType = Typorama.define('GroupType', {
					spec: function() {
						return {
							title: Typorama.String,
							users: Typorama.Map.of(Typorama.String, UserType)
						};
					}
				});
			});

			it('Should be instantiatable ', function() {
				expect(() => new GroupType()).not.to.throw();
			});

			it('Should be modified from json ', function() {
				var groupData = new GroupType();
				groupData.users = Typorama.Map.of(Typorama.String, UserType).create({
						tom: {'name': 'tom', 'age': 25},
						omri: {'name': 'omri', 'age': 35}
				});

				expect(groupData.users.get('tom').name).to.equal('tom');
				expect(groupData.users.get('tom').age).to.equal(25);
				expect(groupData.users.get('omri').name).to.equal('omri');
				expect(groupData.users.get('omri').age).to.equal(35);
			});
		});

	});

});
