import * as sinon from 'sinon';
import {expect} from 'chai';

import * as Typorama from "../src";

describe('LifecycleManager', function() {
	var lifecycleManager;
	beforeEach('init', ()=>{
		lifecycleManager = new Typorama.LifeCycleManager();
		sinon.spy(lifecycleManager, 'onChange');
	});
	describe('by default', () => {
		it('$change() returns true', ()=>{
			var result = lifecycleManager.$getLockToken();
			expect(result, 'result of call to $getLockToken()').not.to.be.defined;
		});
	});
	describe('after forbidChange()', () => {
		beforeEach('init', ()=>{
			lifecycleManager.forbidChange();
		});
		it('$getLockToken() returns false', ()=>{
			var result = lifecycleManager.$getLockToken();
			expect(result, 'result of call to $getLockToken()').to.be.defined;
		});
		describe('allowChange() makes', () => {
			beforeEach('init', ()=>{
				lifecycleManager.allowChange();
			});
			it('$getLockToken() return true again', ()=>{
				var result = lifecycleManager.$getLockToken();
				expect(result, 'result of call to $getLockToken()').not.to.be.defined;
			});
		});
	});
});