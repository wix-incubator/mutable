import {expect} from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

function spyWrapper(factory, isDirty, setDirty, resetDirty){
    return (...args) => {
        var result = factory(...args);
        result.$isDirty = isDirty;
        result.$setDirty = setDirty;
        result.$resetDirty = resetDirty;
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
                elementResetDirty: sinon.spy(),
                dirtyableElements: !!elementFactory().$isDirty
            };
            fixture.elementFactory = fixture.dirtyableElements ? spyWrapper(elementFactory, fixture.elementIsDirty, fixture.elementSetDirty, fixture.elementResetDirty) : elementFactory;
            fixture.init = () => {
                fixture.container = containerFactory(fixture.elementFactory(), fixture.elementFactory());
            };
            fixture.cleanup = () => {
                delete fixture.container;
            };
            fixture.reset = () => {
                fixture.elementIsDirty.reset();
                fixture.elementSetDirty.reset();
                fixture.elementResetDirty.reset();
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
                        expect(spy.alwaysCalledWithExactly(sinon.match.falsy), 'container $setDirty cache not triggered').to.be.false;
                    });
                    if (fixture.dirtyableElements) {
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
        assertDirtyContract: () => {
            fixtures.forEach((fixture) => {
                describe('calling $setDirty on ' + fixture.description, function () {
                    before('init', fixture.init);
                    beforeEach('reset', fixture.reset);
                    after('cleanup', fixture.cleanup);
                    [true, false].forEach((flagVal) => {
                        describe('setting flag to ' + flagVal, () => {
                            it('makes $isDirty return ' + flagVal, function () {
                                fixture.container.$setDirty(flagVal);
                                expect(fixture.container.$isDirty()).to.equal(flagVal);
                            });
                            if (fixture.dirtyableElements) {
                                it('does not affect elements\' lifecycle', function () {
                                    fixture.container.$setDirty(flagVal);
                                    expect(fixture.elementIsDirty.called).to.be.false;
                                    expect(fixture.elementSetDirty.called).to.be.false;
                                });
                            }
                        });
                    });
                });
                describe('calling $resetDirty on ' + fixture.description, function () {
                    before('init', fixture.init);
                    beforeEach('reset', fixture.reset);
                    beforeEach('dirty container', () => {
                        fixture.container.$setDirty(true);
                    });
                    after('cleanup', fixture.cleanup);
                    it('makes $isDirty return false', function () {
                        expect(fixture.container.$isDirty()).to.be.true;
                        fixture.container.$resetDirty();
                        expect(fixture.container.$isDirty()).to.be.false;
                    });
                    if (fixture.dirtyableElements) {
                        it('propagates to elements', function () {
                            fixture.container.$resetDirty();
                            expect(fixture.elementResetDirty.called).to.be.true;
                        });
                        it('does not affect elements\' lifecycle', function () {
                            fixture.container.$resetDirty();
                            expect(fixture.elementIsDirty.called).to.be.false;
                            expect(fixture.elementSetDirty.called).to.be.false;
                        });
                    }
                });
                describe('calling $isDirty on ' + fixture.description, function () {
                    before('init', fixture.init);
                    beforeEach('reset', fixture.reset);
                    after('cleanup', fixture.cleanup)
                    it('after calling $setDirty immediately returns true', function () {
                        fixture.container.$setDirty();
                        var dirty = fixture.container.$isDirty();
                        expect(fixture.elementIsDirty.called).to.be.false;
                        expect(dirty, 'container dirty flag').to.be.true;
                    });
                    it('(when $setDirty not called) recourse through all elements and returns false by default', function () {
                        fixture.elementIsDirty.returns(false);
                        var dirty = fixture.container.$isDirty();
                        if (fixture.dirtyableElements) {
                            expect(fixture.elementIsDirty.calledTwice).to.be.true;
                        }
                        expect(dirty, 'container dirty flag').to.be.false;
                    });
                    if (fixture.dirtyableElements) {
                        it('does not affect elements\' lifecycle', function () {
                            var dirty = fixture.container.$isDirty();
                            expect(fixture.elementSetDirty.called).to.be.false;
                        });
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
                });
            });
            return this;
        }
    };
}