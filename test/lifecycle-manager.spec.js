import * as sinon from 'sinon';
import {expect} from 'chai';

import * as Mutable from '../src';

describe('LifecycleManager', function() {
    var lifecycleManager;
    beforeEach('init', () => {
        lifecycleManager = new Mutable.LifeCycleManager();
        sinon.spy(lifecycleManager, 'onChange');
    });
    describe('by default', () => {
        it('$change() returns true', () => {
            expect(lifecycleManager.isMutable()).not.to.be.ok;
        });
    });
    describe('after forbidChange()', () => {
        beforeEach('init', () => {
            lifecycleManager.forbidChange();
        });
        it('$getLockToken() returns false', () => {
            expect(lifecycleManager.isMutable()).to.be.ok;
        });
        describe('allowChange() makes', () => {
            beforeEach('init', () => {
                lifecycleManager.allowChange();
            });
            it('$getLockToken() return true again', () => {
                expect(lifecycleManager.isMutable()).not.to.be.ok;
            });
        });
    });
});
