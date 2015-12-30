import Typorama from '../../../src';
import {expect} from 'chai';
import sinon from 'sinon';
import {aNumberMap} from '../builders';

describe('Map', function() {
	describe('mutable instance', function() {
		it('Should have default length', function() {
			var numberList = aNumberMap({1:1, 2:2, 3:3});
			expect(numberList.size).to.equal(3);
		});
	});
});
