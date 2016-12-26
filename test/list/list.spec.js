import {expect} from 'chai';
import * as Mutable from '../../src';
import {UserType} from './builders';
import * as sinon from 'sinon';

describe('List', function() {
    describe('$setManager', function() {
        let list, manager;
        beforeEach(()=>{
            manager = new Mutable.LifeCycleManager();
            let child = new UserType();
            sinon.spy(child, '$setManager');
            list = Mutable.List.of(UserType).create([child]);
        });
        it('with existing different manager does not change the manager and reports error', function() {
            list.__lifecycleManager__ = manager;
            expect(() => list.$setManager(new Mutable.LifeCycleManager())).to.report({ level: /error/ });
            expect(list.__lifecycleManager__, 'container manager').to.equal(manager);
        });
        it('when no existing manager changes the manager field', function() {
            expect(() => list.$setManager(manager)).not.to.report({ level: /error/ });
            expect(list.__lifecycleManager__, 'container manager').to.equal(manager);
        });
        it('when no existing manager changes the manager field of child elements', function() {
            expect(() => list.$setManager(manager)).not.to.report({ level: /error/ });
            expect(list.at(0).$setManager).to.have.been.calledWithExactly(manager);
        });
        it('in readonly form does not report an error', function() {
            expect(() => list.$asReadOnly().$setManager(manager)).to.not.report({ level: /error/ });
        });
        it('with invalid type reports an error', function() {
            expect(() => list.$setManager({})).to.report({ level: /error/ });
        });
    });
});

require('./mutable/instance.spec');
require('./mutable/item-read.spec');
require('./mutable/views.spec');
require('./mutable/functional-programming.spec');
require('./mutable/set-value.spec');
require('./mutable/item-mutations.spec');
require('./mutable/in-place-mutations.spec');
