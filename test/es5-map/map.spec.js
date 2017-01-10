import {expect} from 'chai';
import * as sinon from 'sinon';
import {UserType} from './builders';
import * as mu from '../../src';
describe('Es5 Map', function() {
    describe('$setManager', function() {
        let map, manager;
        beforeEach(()=>{
            manager = new mu.LifeCycleManager();
            let child = new UserType();
            sinon.spy(child, '$setManager');
            map = new (mu.Es5Map.of(UserType))({child});
        });
        it('with existing different manager does not change the manager and reports error', function() {
            map.__lifecycleManager__ = manager;
            expect(() => map.$setManager(new mu.LifeCycleManager())).to.report({ level: /error/ });
            expect(map.__lifecycleManager__, 'container manager').to.equal(manager);
        });
        it('when no existing manager changes the manager field', function() {
            expect(() => map.$setManager(manager)).not.to.report({ level: /error/ });
            expect(map.__lifecycleManager__, 'container manager').to.equal(manager);
        });
        it('when no existing manager changes the manager field of child elements', function() {
            expect(() => map.$setManager(manager)).not.to.report({ level: /error/ });
            expect(map.get('child').$setManager).to.have.been.calledWithExactly(manager);
        });
        it('in readonly form does not report an error', function() {
            expect(() => map.$asReadOnly().$setManager(manager)).to.not.report({ level: /error/ });
        });
        it('with invalid type reports an error', function() {
            expect(() => map.$setManager({})).to.report({ level: /error/ });
        });
    });
});

require('./mutable/instance.spec');
require('./type-edge-cases.spec');
