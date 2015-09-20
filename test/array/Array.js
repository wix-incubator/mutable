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

		require('./item-read');

		require('./views');

		require('./functional-programming')

		require('./set-value');

		require('./item-mutations');

		require('./in-place-mutations');
	});

	require("./read-only-instance");

});

describe('List data type', function () {
	it('should be identical with the Array data type', function () {
		expect(Typorama.List).to.equal(Typorama.Array);
	});
});