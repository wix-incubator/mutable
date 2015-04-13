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

function spyWrapper(isDirty, setDirty){
    return (factory) =>
        (...args) => {
        var result = factory(...args);
        result.$isDirty = isDirty;
        result.$setDirty = setDirty;
        return result;
    };
}

export function lifecycleContract(containerFactory, elementFactory, fixtureDescription){

    var ctx = {
        elementIsDirty : sinon.stub(),
        elementSetDirty : sinon.spy()
    };
    var spyOn = spyWrapper(ctx.elementIsDirty, ctx.elementSetDirty);
    var spiedElementFactory = spyOn(elementFactory);
    function init() {
        ctx.container = containerFactory(spiedElementFactory(), spiedElementFactory());
    }
    function cleanup() {
        delete ctx.container;
    }
    function reset(){
        ctx.elementIsDirty.reset();
        ctx.elementSetDirty.reset();
        ctx.container.$resetDirty();
    }
    return {
        assertMutatorCallsSetDirty: (mutator, description) => {
            describe('applying ' + description + ' on ' + fixtureDescription, function () {
                before('init', init);
                beforeEach('reset', reset);
                after('cleanup', cleanup);
                it('calls $setDirty', function () {
                    var spy = sinon.spy(ctx.container, '$setDirty');
                    mutator(ctx.container, spiedElementFactory);
                    expect(spy.called).to.be.true;
                });
                it('does not affect elements\' lifecycle', function () {
                    mutator(ctx.container, spiedElementFactory);
                    expect(ctx.elementIsDirty.called).to.be.false;
                    expect(ctx.elementSetDirty.called).to.be.false;
                });
            });
            return this;
        },
        assertIsDirtyContract: () => {
            describe('calling $setDirty on ' + fixtureDescription, function () {
                before('init', init);
                beforeEach('reset', reset);
                after('cleanup', cleanup);
                it('does not affect elements\' lifecycle', function () {
                    var dirty = ctx.container.$setDirty();
                    expect(ctx.elementIsDirty.called).to.be.false;
                    expect(ctx.elementSetDirty.called).to.be.false;
                });
            });
            describe('calling $isDirty on ' + fixtureDescription, function () {
                before('init', init);
                beforeEach('reset', reset);
                after('cleanup', cleanup);
                it('does not affect elements\' lifecycle', function () {
                    var dirty = ctx.container.$isDirty();
                    expect(ctx.elementSetDirty.called).to.be.false;
                });
                it('after calling $setDirty immediately returns true', function () {
                    ctx.container.$setDirty();
                    var dirty = ctx.container.$isDirty();
                    expect(ctx.elementIsDirty.called).to.be.false;
                    expect(dirty).to.be.true;
                });
                it('with non-dirty elements (when $setDirty not called) recourse through all elements and returns false', function () {
                    var dirty = ctx.container.$isDirty();
                    expect(ctx.elementIsDirty.called).to.be.true;
                    // todo assert called twice
                    expect(dirty).to.be.false;
                });
                // TODO test : make stub return true on 1st, assert called once
                // TODO test : make stub return true on 2nd, assert called twice

                // todo caching test
            });
            return this;
        }
    };
}