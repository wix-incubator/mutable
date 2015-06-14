import {expect} from 'chai';
import _ from 'lodash';
import sinon from 'sinon';
import {LifeCycleManager, revision} from '../src/lifecycle';

/**
 * this is a parameterized test suite specifically designed to test the dirtyable contract.
 * the setup is messy. the tests themselves can be found in methods contractSuite and mutatorContract.
 **/
export function lifecycleContract(){
    var contexts = [];
    return {
        addFixture :(containerFactory, elementFactory, description) => {
            var context = {
                description : description,
                dirtyableElements: !!elementFactory().$isDirty
            };
            setFactoriesInFixture(context, containerFactory, elementFactory);
            addFixtureSetup(context);
            contexts.push(context);
        },
        assertMutatorContract: (mutator, description) => {
            contexts.forEach((context) => {
                mutatorContract(description, context, (...args) => {
                    mutator(...args);
                    context.sameValue = _.isEqual(context.container.__value__, context.containerFactory().__value__);
                    setContainedElements(context);
                });
                contractSuite(_.create(context, {
                    containerFactory: () => {
                        var result = context.containerFactory();
                        mutator(result, context.elementFactory);
                        return result;
                    },
                    description : context.description + ' after ' + description
                }));
            });
        },
        assertDirtyContract: () => {
            contexts.forEach(contractSuite);
        }
    };
}

function setContainedElements(context) {
    context.containedElements = _.intersection(context.allElements, _.values(context.container.__value__));
}

function setFactoriesInFixture(context, containerFactory, elementFactory) {
    context.containerFactory = () => {
        context.allElements = [];
        var result = containerFactory(context.elementFactory(), context.elementFactory()); // always two elements in the context
        return result;
    };
    context.elementFactory = (...args) => {
        var result = elementFactory(...args);
        if (context.dirtyableElements) {
            sinon.stub(result, '$isDirty');
            sinon.spy(result, '$calcLastChange');
            sinon.spy(result, '$setDirty');
            sinon.spy(result, '$setManager');
        }
        context.allElements.push(result);
        return result;
    };
}

function addFixtureSetup(context) {
    context.setup = () => {
        beforeEach('reset', () => {
            context.lifecycleManager = new LifeCycleManager();
            sinon.spy(context.lifecycleManager, 'onChange');
            context.container = context.containerFactory();
            setContainedElements(context);
            if (context.dirtyableElements) {
                _.forEach(context.containedElements, (elem) => elem.$setManager.reset());
            }
            revision.advance();
            context.beginRev = revision.read();
        });
        afterEach('cleanup', () => {
            delete context.container;
            delete context.sameValue;
            delete context.lifecycleManager;
            delete context.containedElements;
            delete context.allElements;
        });
    };
}

/**
 * the contract of a mutator
 */
function mutatorContract(description, context, mutator) {
    describe('applying ' + description + ' on ' + context.description, function () {
        context.setup();
        it('calls $setDirty on changes', function () {
            var spy = sinon.spy(context.container, '$setDirty');
            mutator(context.container, context.elementFactory);
            if (context.sameValue) {
                expect(spy.called, '$setDirty called').to.be.true;
                expect(spy.alwaysCalledOn(context.container), '$setDirty called only on container').to.be.true;
            } else {
                // TODO uncomment and fix expect(spy.called, '$setDirty called').to.be.false;
            }
        });
        if (context.dirtyableElements) {
            it('does not affect elements\' lifecycle', function () {
                mutator(context.container, context.elementFactory);
                expect(_.any(context.containedElements, '$isDirty.called'), '$isDirty called on element(s)').to.be.false;
                expect(_.any(context.containedElements, '$setDirty.called'), '$setDirty called on element(s)').to.be.false;
            });
            it('sets lifecycle manager in newly added elements', function () {
                context.container.$setManager(context.lifecycleManager);
                var oldElements = context.containedElements;
                mutator(context.container, context.elementFactory);
                var addedElements = _(oldElements).intersection(context.containedElements);
                expect(addedElements.every('$setManager.called'), '$setManager called on element(s)').to.be.true;
                expect(addedElements.every((element) => element.$setManager.calledWithExactly(context.lifecycleManager)), '$setManager called on element(s)').to.be.true;
            });
        }
    });
}

/**
 * check the dirty contract
 */
function contractSuite(context){
    testSetDirty(context);
    testIsDirty(context);
    testSetManager(context);
}

function testSetDirty(context) {
    describe('calling setDirty on ' + context.description, function () {
        context.setup();
        it('changes result of $isDirty', function () {
            context.container.$setDirty();
            expect(context.container.$isDirty(context.beginRev), 'container dirty after calling $setDirty()').to.be.true;
        });
        it('changes result of readonly version $isDirty', function () {
            var ro = context.container.$asReadOnly();
            context.container.$setDirty();
            expect(ro.$isDirty(context.beginRev), 'readonly version dirty after calling $setDirty()').to.be.true;
        });
        describe('with lifecycle manager', () => {
            describe('to set dirty flag to true' , () => {
                it('triggers onChange in lifecycle manager', () =>{
                    context.container.$setManager(context.lifecycleManager);
                    context.container.$setDirty();
                    expect(context.lifecycleManager.onChange.calledOnce).to.be.true;
                });
            });
            describe('to set dirty flag', () =>{
                describe('when lifecycleManager does not allow changes' , () => {
                    it('will not work', function () {
                        context.lifecycleManager.forbidChange();
                        context.container.$setManager(context.lifecycleManager);
                        var result = context.container.$setDirty();
                        expect(result, 'result of $setDirty').to.be.false;
                        expect(context.container.$isDirty(context.beginRev), 'container dirty after calling $setDirty').to.be.false;
                    });
                });
                describe('when lifecycleManager allows changes' , () => {
                    it('will work', function () {
                        context.container.$setManager(context.lifecycleManager);
                        debugger;
                        var result = context.container.$setDirty();
                        expect(result, 'result of $setDirty').to.be.true;
                        expect(context.container.$isDirty(context.beginRev), 'container dirty after calling $setDirty').to.be.true;
                    });
                });
            });
        });
        if (context.dirtyableElements) {
            describe('calling $setDirty when elements $isDirty returns false', () => {
                it('makes $isDirty return true', function () {
                    context.containedElements.forEach((e) => e.$isDirty.returns(false));
                    expect(context.container.$isDirty(context.beginRev), 'container dirty before calling $setDirty').to.equal(false);
                    context.container.$setDirty();
                    expect(context.container.$isDirty(context.beginRev), 'container dirty after calling $setDirty').to.equal(true);
                });
                it('in read only form makes no changes', function () {
                    context.containedElements.forEach((e) => e.$isDirty.returns(false));
                    expect(context.container.$isDirty(context.beginRev), 'container dirty before calling $setDirty').to.equal(false);
                    var ro = context.container.$asReadOnly();
                    ro.$setDirty();
                    expect(context.container.$isDirty(context.beginRev), 'container dirty after calling $setDirty').to.equal(false);
                    expect(ro.$isDirty(context.beginRev), 'readonly dirty after calling $setDirty').to.equal(false);
                });
                it('does not affect elements\' lifecycle', function () {
                    context.container.$setDirty();
                    expect(_.any(context.containedElements, '$isDirty.called'), '$isDirty called on element(s)').to.be.false;
                    expect(_.any(context.containedElements, '$setDirty.called'), '$setDirty called on element(s)').to.be.false;
                });
            });
        } else {
            it('calling $setDirty in read only form makes no changes', function () {
                expect(context.container.$isDirty(context.beginRev), 'container dirty before calling $setDirty').to.be.false;
                var ro = context.container.$asReadOnly();
                ro.$setDirty();
                expect(context.container.$isDirty(context.beginRev), 'container dirty after calling $setDirty').to.be.false;
                expect(ro.$isDirty(context.beginRev), 'read only dirty after calling $setDirty').to.be.false;
            });
        }
    });
}

function testIsDirty(context){
    describe('calling $isDirty on ' + context.description, function () {
        context.setup();
        describe('twice returns same result', () => {
            [true, false].forEach((flagVal) => {
                it(': ' + flagVal, function () {
                    if (flagVal) {
                        context.container.$setDirty();
                    }
                    expect(context.container.$isDirty(context.beginRev), 'container dirty flag on first call').to.equal(flagVal);
                    expect(context.container.$isDirty(context.beginRev), 'container dirty flag on second call').to.equal(flagVal);
                });
            });
        });
        it('after calling $setDirty returns true without checking elements', function () {
            context.container.$setDirty();
            var dirty = context.container.$isDirty(context.beginRev);
            expect(_.any(context.containedElements, '$isDirty.called'), '$isDirty called on element(s)').to.be.false;
            expect(dirty, 'container dirty flag').to.be.true;
        });
        it('(when $setDirty not called) recourse through all elements and returns false by default', function () {
            var dirty = context.container.$isDirty(context.beginRev);
            if (context.dirtyableElements) {
                expect(_.filter(context.containedElements, '$calcLastChange.called'), 'element(s) that $isDirty was called upon').to.eql(context.containedElements);
            }
            expect(dirty, 'container dirty flag').to.be.false;
        });
        it('(when $setDirty not called and manager forbids changes) for the second time returns false without checking elements', function () {
            context.container.$setManager(context.lifecycleManager);
            context.lifecycleManager.forbidChange();
            if (context.dirtyableElements) {
                context.containedElements.forEach((e) => e.$isDirty.returns(false));
            }
            context.container.$isDirty(context.beginRev);
            if (context.dirtyableElements) {
                context.containedElements.forEach((e) => e.$isDirty.reset());
            }
            var dirty = context.container.$isDirty(context.beginRev);
            if (context.dirtyableElements) {
                expect(_.filter(context.containedElements, '$isDirty.called'), 'element(s) that $isDirty was called upon').to.be.empty;
            }
            expect(dirty, 'container dirty flag').to.be.false;
        });
        if (context.dirtyableElements) {
            it('does not affect elements\' lifecycle', function () {
                context.container.$isDirty(context.beginRev);
                expect(_.any(context.containedElements, '$setDirty.called'), '$setDirty called on element(s)').to.be.false;
            });
            it("(when $setDirty not called and an element is dirty) returns true", function () {
                context.containedElements[0].$setDirty();
                var dirty = context.container.$isDirty(context.beginRev);
                expect(dirty, 'container dirty flag').to.be.true;
            });
            it("(when $setDirty not called and manager forbids changes) for the second time returns true without checking elements", function () {
                context.containedElements[0].$setDirty();
                context.container.$setManager(context.lifecycleManager);
                context.lifecycleManager.forbidChange();
                context.container.$isDirty(context.beginRev);
                context.containedElements.forEach((e) => e.$calcLastChange.reset());
                debugger;
                var dirty = context.container.$isDirty(context.beginRev);
                expect(_.filter(context.containedElements, '$calcLastChange.called'), 'element(s) that $calcLastChange was called upon').to.be.empty;
                expect(dirty, 'container dirty flag').to.be.true;
            });
        }
    });
}

function testSetManager(context) {
    describe('calling $setManager on ' + context.description, function () {
        context.setup();
        it('with existing different manager throws error', function () {
            context.container.__lifecycleManager__ = new LifeCycleManager();
            var manager = new LifeCycleManager();
            expect(() => context.container.$setManager(manager)).to.throw(Error);
        });
        it('when no existing manager changes the manager field', function () {
            var manager = new LifeCycleManager();
            context.container.$setManager(manager);
            expect(context.container.__lifecycleManager__, 'container manager').to.equal(manager);
            if (context.dirtyableElements) {
                expect(_.every(context.containedElements, '$setManager.called'), 'elements $setManager called').to.be.true;
                expect(_.every(context.containedElements, (e) => e.$setManager.alwaysCalledWithExactly(manager)), "elements $setManager called with manager").to.be.true;
            }
            context.container.$setManager(manager);
            expect(context.container.__lifecycleManager__, 'container manager').to.equal(manager);
        });
        it('in readonly form does not change the manager field', function () {
            var manager = new LifeCycleManager();
            context.container.$asReadOnly().$setManager(manager);
            expect(context.container.__lifecycleManager__, 'container manager').to.be.undefined;
            if (context.dirtyableElements) {
                expect(_.any(context.containedElements, '$setManager.called'), 'elements $setManager called').to.be.false;
            }
        });
        it('with invalid type does not change the manager field', function () {
            context.container.$setManager({});
            expect(context.container.__lifecycleManager__, 'container manager').to.be.undefined;
            if (context.dirtyableElements) {
                expect(_.any(context.containedElements, '$setManager.called'), 'elements $setManager called').to.be.false;
            }
        });
    });
}