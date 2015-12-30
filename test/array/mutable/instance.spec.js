import Typorama from '../../../src';
import {expect} from 'chai';
import sinon from 'sinon';
import {aNumberArray, aStringArray, UserType, AddressType, UserWithAddressType} from '../builders';

describe('Array', function() {
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

		describe('as field on data object', function() {

			var GroupType = Typorama.define('GroupType', {
				spec: function() {
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
});
