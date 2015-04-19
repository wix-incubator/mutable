import _ from 'lodash';
import {LifeCycleManager} from '../src/lifecycle';
import {expect, err} from 'chai';
import sinon from 'sinon';

describe('LifecycleManager :', function() {
	var lifecycleManager;
	beforeEach('init', ()=>{
		lifecycleManager = new LifeCycleManager();
		sinon.spy(lifecycleManager, 'onChange');
	});
	describe('by default', () => {
		it('$change() returns true', ()=>{
			var result = lifecycleManager.$change();
			expect(result, 'result of call to $change()').to.be.true;
		});
		it('$change() calls onChange()', ()=>{
			lifecycleManager.$change();
			expect(lifecycleManager.onChange.calledOnce).to.be.true;
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
		it('$change() does not call onChange()', ()=>{
			lifecycleManager.$change();
			expect(lifecycleManager.onChange.called).to.be.false;
		});
		describe('after forbidChange()', () => {
			beforeEach('init', ()=>{
				lifecycleManager.allowChange();
			});
			it('allowChange() makes $change() return true again', ()=>{
				var result = lifecycleManager.$change();
				expect(result, 'result of call to $change()').to.be.true;
			});
			it('allowChange() makes $change() call onChange() again', ()=>{
				lifecycleManager.$change();
				expect(lifecycleManager.onChange.calledOnce).to.be.true;
			});
		});
	});
});