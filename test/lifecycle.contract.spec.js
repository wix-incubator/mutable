import {expect} from 'chai';
import _ from 'lodash';
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

function spyWrapper(factory, isDirty, setDirty){
    return (...args) => {
        var result = factory(...args);
        result.$isDirty = isDirty;
        result.$setDirty = setDirty;
        return result;
    };
}

export function lifecycleContract(){
    var fixtures = [];
    return {
        addFixture :(containerFactory, elementFactory, description) => {
            var fixture = {
                description : description,
                elementIsDirty: sinon.stub(),
                elementSetDirty: sinon.spy(),
                mutableElements: _.isObject(elementFactory())
            };
            fixture.elementFactory = fixture.mutableElements ? spyWrapper(elementFactory, fixture.elementIsDirty, fixture.elementSetDirty) : elementFactory;
            fixture.init = () => {
                fixture.container = containerFactory(fixture.elementFactory(), fixture.elementFactory());
            };
            fixture.cleanup = () => {
                delete fixture.container;
            };
            fixture.reset = () => {
                fixture.elementIsDirty.reset();
                fixture.elementSetDirty.reset();
                fixture.container.$resetDirty();
            };
            fixtures.push(fixture);
            return this;
        },
        assertMutatorCallsSetDirty: (mutator, description) => {
            fixtures.forEach((fixture) => {
                describe('applying ' + description + ' on ' + fixture.description, function () {
                    before('init', fixture.init);
                    beforeEach('reset', fixture.reset);
                    after('cleanup', fixture.cleanup);
                    it('calls $setDirty', function () {
                        var spy = sinon.spy(fixture.container, '$setDirty');
                        mutator(fixture.container, fixture.elementFactory);
                        expect(spy.called).to.be.true;
                    });
                    if (fixture.mutableElements) {
                        it('does not affect elements\' lifecycle', function () {
                            mutator(fixture.container, fixture.elementFactory);
                            expect(fixture.elementIsDirty.called).to.be.false;
                            expect(fixture.elementSetDirty.called).to.be.false;
                        });
                    }
                });
            });
            return this;
        },
        assertIsDirtyContract: () => {
            fixtures.forEach((fixture) => {
                describe('calling $setDirty on ' + fixture.description, function () {
                    before('init', fixture.init);
                    beforeEach('reset', fixture.reset);
                    after('cleanup', fixture.cleanup);
                    if (fixture.mutableElements) {
                        it('does not affect elements\' lifecycle', function () {
                            var dirty = fixture.container.$setDirty();
                            expect(fixture.elementIsDirty.called).to.be.false;
                            expect(fixture.elementSetDirty.called).to.be.false;
                        });
                    }
                });
                describe('calling $isDirty on ' + fixture.description, function () {
                    before('init', fixture.init);
                    beforeEach('reset', fixture.reset);
                    after('cleanup', fixture.cleanup);
                    if (fixture.mutableElements) {
                        it('does not affect elements\' lifecycle', function () {
                            var dirty = fixture.container.$isDirty();
                            expect(fixture.elementSetDirty.called).to.be.false;
                        });
                    }
                    it('after calling $setDirty immediately returns true', function () {
                        fixture.container.$setDirty();
                        var dirty = fixture.container.$isDirty();
                        expect(fixture.elementIsDirty.called).to.be.false;
                        expect(dirty, 'container dirty flag').to.be.true;
                    });
                    it('(when $setDirty not called) recourse through all elements and returns false by default', function () {
                        fixture.elementIsDirty.returns(false);
                        var dirty = fixture.container.$isDirty();
                        if (fixture.mutableElements) {
                            expect(fixture.elementIsDirty.calledTwice).to.be.true;
                        }
                        expect(dirty, 'container dirty flag').to.be.false;
                    });

                    if (fixture.mutableElements) {
                        it('(when $setDirty not called) returns true after checking the first element and finding that it\'s dirty', function () {
                            fixture.elementIsDirty.onFirstCall().returns(true);
                            var dirty = fixture.container.$isDirty();
                            expect(fixture.elementIsDirty.calledOnce, 'checked one element for dirty').to.be.true;
                            expect(dirty, 'container dirty flag').to.be.true;
                        });
                        it('(when $setDirty not called) returns true after checking the second element and finding that it\'s dirty', function () {
                            fixture.elementIsDirty.onFirstCall().returns(false);
                            fixture.elementIsDirty.onSecondCall().returns(true);
                            var dirty = fixture.container.$isDirty();
                            expect(fixture.elementIsDirty.calledTwice, 'checked two elements for dirty').to.be.true;
                            expect(dirty, 'container dirty flag').to.be.true;
                        });
                    }
                    // todo caching test
                });
            });
            return this;
        }
    };
}