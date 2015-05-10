import _ from 'lodash';
import {expect, err} from 'chai';
import sinon from 'sinon';
import Typorama from "../src";

describe('LifecycleManager :', function() {
	var lifecycleManager;
	beforeEach('init', ()=>{
		lifecycleManager = new Typorama.LifeCycleManager();
		sinon.spy(lifecycleManager, 'onChange');
	});
	afterEach('$change() does not call onChange()', ()=>{
		lifecycleManager.$change();
		expect(lifecycleManager.onChange.called).to.be.false;
	});
	describe('by default', () => {
		it('$change() returns true', ()=>{
			var result = lifecycleManager.$change();
			expect(result, 'result of call to $change()').to.be.true;
		});
	});
	describe('after forbidChange()', () => {
		beforeEach('init', ()=>{
			lifecycleManager.forbidChange();
		});
		it('$change() returns false', ()=>{
			var result = lifecycleManager.$change();
			expect(result, 'result of call to $change()').to.be.false;
		});
		describe('allowChange() makes', () => {
			beforeEach('init', ()=>{
				lifecycleManager.allowChange();
			});
			it('$change() return true again', ()=>{
				var result = lifecycleManager.$change();
				expect(result, 'result of call to $change()').to.be.true;
			});
		});
	});
});