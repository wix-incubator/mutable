import {expect} from 'chai';
import sinon from 'sinon';

describe('assume',() => {
    it('spy works', () =>{
        var spy = sinon.spy();
        expect(spy.called).to.be.false;
        spy.reset();

        spy();
        expect(spy.called).to.be.true;

        spy.reset();

        expect(spy.called).to.be.false;
        spy();
        expect(spy.called).to.be.true;
    });
});

export function assertSetDirtyContract(factory, mutator, description, ...predicates) {
    describe(description, function () {
        var ctx = new Object();
        before('init', function () {
            ctx.instance = factory();
            ctx.dirtySpy = sinon.spy(ctx.instance, '$setDirty');
        });
        beforeEach('clear spy',() => ctx.dirtySpy.reset());
        it('calls $setDirty', function () {
            mutator(ctx.instance);
            expect(ctx.dirtySpy.called).to.be.true;
        });
        predicates.forEach(function (predicate) {
            it(predicate.description, function () {
                var isOk = predicate.condition(ctx.instance);
                expect(isOk).to.be.true;
            });
        });
        after('cleanup', function () {
            delete ctx.instance;
        });
    });
}

export function isDirtyContractTest(containerFactory, elementFactory, description, ...predicates){
    describe('calling $isDirty on ' + description, function () {
        var ctx = new Object();
        before('init', function () {
            ctx.element = elementFactory();
            ctx.container = containerFactory(ctx.element);
            ctx.dirtyStub = sinon.stub(ctx.element, '$isDirty', () => true);
        });
        beforeEach('clear spy', () => ctx.dirtyStub.reset());
        beforeEach('clear dirty', () => ctx.container.$resetDirty());
        it('returns true if $setDirty was called', function () {
            ctx.container.$setDirty();
            var dirty = ctx.container.$isDirty();
            expect(ctx.dirtyStub.called).to.be.false;
            expect(dirty).to.be.true;
        });
        it('depends on element\'s $isDirty if $setDirty not called', function () {
            var dirty = ctx.container.$isDirty();
            expect(ctx.dirtyStub.called).to.be.true;
            expect(dirty).to.be.true;
        });
        predicates.forEach(function (predicate) {
            it(predicate.description, function () {
                var isOk = predicate.condition(ctx.instance);
                expect(isOk).to.be.true;
            });
        });
        after('cleanup', function () {
            delete ctx.container;
            delete ctx.element;
        });
    });
}