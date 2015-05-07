import {expect} from 'chai';
import _ from 'lodash';
import sinon from 'sinon';
import {LifeCycleManager} from '../src/lifecycle';

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
    if (context.dirtyableElements) {
        context.containedElements = _.intersection(context.allElements, _.values(context.container.__value__));
    } else {
        context.containedElements = [];
    }
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
            sinon.spy(result, '$setDirty');
            sinon.spy(result, '$resetDirty');
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
            sinon.stub(context.lifecycleManager, '$change');
            sinon.spy(context.lifecycleManager, 'onChange');
            context.container = context.containerFactory();
            setContainedElements(context);
            _.forEach(context.containedElements, (elem) => elem.$setManager.reset());
            // reset dirty flag of container
            context.container.$resetDirty();
            if (context.dirtyableElements) {
                _.forEach(context.containedElements, (elem) => elem.$resetDirty.reset());
            }
        });
        afterEach('cleanup', () => {
            delete context.container;
        });
    };
}

/**
 * the contract of a mutator
 */
function mutatorContract(description, context, mutator) {
    describe('applying ' + description + ' on ' + context.description, function () {
        context.setup();
        it('calls $setDirty', function () {
            var spy = sinon.spy(context.container, '$setDirty');
            mutator(context.container, context.elementFactory);
            expect(spy.called).to.be.true;
            expect(spy.alwaysCalledOn(context.container), '$setDirty called only on container').to.be.true;
            expect(spy.alwaysCalledWithExactly(sinon.match.truthy), "container $setDirty only called with truthy argument").to.be.true;
        });
        if (context.dirtyableElements) {
            it('does not affect elements\' lifecycle', function () {
                mutator(context.container, context.elementFactory);
                expect(_.any(context.containedElements, '$isDirty.called'), '$isDirty called on element(s)').to.be.false;
                expect(_.any(context.containedElements, '$setDirty.called'), '$setDirty called on element(s)').to.be.false;
                expect(_.any(context.containedElements, '$resetDirty.called'), '$resetDirty called on element(s)').to.be.false;
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
    testResetDirty(context);
    testIsDirty(context);
    testSetManager(context);
}

function testSetDirty(context) {
    describe('calling $setDirty on ' + context.description, function () {
        context.setup();
        it('changes result of $isDirty', function () {
            context.container.$setDirty(true);
            expect(context.container.$isDirty(), 'container dirty after calling $setDirty(true)').to.be.true;
            context.container.$setDirty(false);
            expect(context.container.$isDirty(), 'container dirty after calling $setDirty(false)').to.be.false;
        });
        describe('with lifecycle manager', () => {
            describe('to set dirty flag to true' , () => {
                it('triggers onChange in lifecycle manager', () =>{
                    context.lifecycleManager.$change.returns(true);
                    context.container.$setManager(context.lifecycleManager);
                    context.container.$setDirty(true);
                    expect(context.lifecycleManager.onChange.calledOnce).to.be.true;
                });
            });
            [true, false].forEach((dirtyState) => {
                describe('to set dirty flag to ' + dirtyState , () =>{
                    [true, false].forEach((managerState) => {
                        describe('when .$change() returns' + managerState , () => {
                            var expectedResult = dirtyState == managerState;
                            it('will return ' +expectedResult, function () {
                                context.container.$setDirty(!dirtyState);
                                context.lifecycleManager.$change.returns(managerState);
                                context.container.$setManager(context.lifecycleManager);
                                var result = context.container.$setDirty(dirtyState);
                                expect(result, 'result of $setDirty').to.equal(expectedResult);
                                expect(context.container.$isDirty(), 'container dirty after calling $setDirty').to.equal(expectedResult == dirtyState);
                            });
                        });
                    });
                });
            });
        });
        if (context.dirtyableElements) {
            [true, false].forEach((flagVal) => {
                describe('setting flag to ' + flagVal + ' when elements $isDirty returns ' + !flagVal, () => {
                    it('makes $isDirty return ' + flagVal, function () {
                        context.containedElements.forEach((e) => e.$isDirty.returns(!flagVal));
                        expect(context.container.$isDirty(), 'container dirty before calling $setDirty(' + flagVal + ')').to.equal(!flagVal);
                        context.container.$setDirty(flagVal);
                        expect(context.container.$isDirty(), 'container dirty after calling $setDirty(' + flagVal + ')').to.equal(flagVal);
                    });
                    it('in read only form makes no changes', function () {
                        context.containedElements.forEach((e) => e.$isDirty.returns(!flagVal));
                        expect(context.container.$isDirty(), 'container dirty before calling $setDirty(' + flagVal + ')').to.equal(!flagVal);
                        context.container.$asReadOnly().$setDirty(flagVal);
                        expect(context.container.$isDirty(), 'container dirty after calling $setDirty(' + flagVal + ')').to.equal(!flagVal);
                    });
                    it('does not affect elements\' lifecycle', function () {
                        context.container.$setDirty(flagVal);
                        expect(_.any(context.containedElements, '$isDirty.called'), '$isDirty called on element(s)').to.be.false;
                        expect(_.any(context.containedElements, '$setDirty.called'), '$resetDirty called on element(s)').to.be.false;
                        expect(_.any(context.containedElements, '$resetDirty.called'), '$resetDirty called on element(s)').to.be.false;
                    });
                });
            });
        } else {
            it('setting flag to true in read only form makes no changes', function () {
                expect(context.container.$isDirty(), 'container dirty before calling $setDirty(true)').to.be.false;
                context.container.$asReadOnly().$setDirty(true);
                expect(context.container.$isDirty(), 'container dirty after calling $setDirty(true)').to.be.false;
            });
            it('setting flag to false in read only form makes no changes', function () {
                context.container.$setDirty(true);
                expect(context.container.$isDirty(), 'container dirty before calling $setDirty(false)').to.be.true;
                context.container.$asReadOnly().$setDirty(false);
                expect(context.container.$isDirty(), 'container dirty after calling $setDirty(false)').to.be.true;
            });
        }
    });
}
function testResetDirty(context) {
    describe('calling $resetDirty on ' + context.description, function () {
        context.setup();
        it('makes $isDirty return false', function () {
            context.container.$setDirty(true);
            context.containedElements.forEach((e) => e.$isDirty.returns(false));
            expect(context.container.$isDirty(), 'container dirty before calling $resetDirty').to.be.true;
            context.container.$resetDirty();
            expect(context.container.$isDirty(), 'container dirty after calling $resetDirty').to.be.false;
        });
        if (context.dirtyableElements) {
            it('propagates to elements', function () {
                expect(_.any(context.containedElements, '$resetDirty.called'), '$resetDirty called on any element(s)').to.be.false;
                context.container.$resetDirty();
                expect(_.every(context.containedElements, '$resetDirty.called'), '$resetDirty called on all element(s)').to.be.true;
            });
            it('does not affect elements\' lifecycle', function () {
                context.container.$resetDirty();
                expect(_.any(context.containedElements, '$isDirty.called'), '$isDirty called on element(s)').to.be.false;
                expect(_.any(context.containedElements, '$setDirty.called'), '$setDirty called on element(s)').to.be.false;
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
                        context.container.$setDirty(flagVal);
                    }
                    var dirty1 = context.container.$isDirty();
                    var dirty2 = context.container.$isDirty();
                    expect(dirty1, 'container dirty flag on first call').to.equal(flagVal);
                    expect(dirty2, 'container dirty flag on second call').to.equal(flagVal);
                });
            });
        });
        it('after calling $setDirty returns true without checking elements', function () {
            context.container.$setDirty(true);
            var dirty = context.container.$isDirty();
            expect(_.any(context.containedElements, '$isDirty.called'), '$isDirty called on element(s)').to.be.false;
            expect(dirty, 'container dirty flag').to.be.true;
        });
        it('(when $setDirty not called) recourse through all elements and returns false by default', function () {
            context.containedElements.forEach((e) => e.$isDirty.returns(false));
            var dirty = context.container.$isDirty();
            if (context.dirtyableElements) {
                expect(_.filter(context.containedElements, '$isDirty.called'), 'element(s) that $isDirty was called upon').to.eql(context.containedElements);
            }
            expect(dirty, 'container dirty flag').to.be.false;
        });
        if (context.dirtyableElements) {
            it('does not affect elements\' lifecycle', function () {
                context.container.$isDirty();
                expect(_.any(context.containedElements, '$setDirty.called'), '$setDirty called on element(s)').to.be.false;
                expect(_.any(context.containedElements, '$resetDirty.called'), '$resetDirty called on element(s)').to.be.false;
            });
            it("(when $setDirty not called) returns true after checking the first element and finding that it's dirty", function () {
                context.containedElements[0].$isDirty.returns(true);
                var dirty = context.container.$isDirty();
                expect(_.filter(context.containedElements, '$isDirty.called'), 'element(s) that $isDirty was called upon').to.eql([context.containedElements[0]]);
                expect(dirty, 'container dirty flag').to.be.true;
            });
            it("(when $setDirty not called) returns true after checking the second element and finding that it's dirty", function () {
                context.containedElements.forEach((e) => e.$isDirty.returns(false));
                context.containedElements[context.containedElements.length - 1].$isDirty.returns(true);
                var dirty = context.container.$isDirty();
                expect(_.filter(context.containedElements, '$isDirty.called'), 'element(s) that $isDirty was called upon').to.eql(context.containedElements);
                expect(dirty, 'container dirty flag').to.be.true;
            });
        }
    });
}

function testSetManager(context) {
    describe('calling $setManager on ' + context.description, function () {
        context.setup();
        it('changes the manager field', function () {
            var manager = new LifeCycleManager();
            context.container.$setManager(manager);
            expect(context.container.__lifecycleManager__, 'container manager').to.equal(manager);
            if (context.dirtyableElements) {
                expect(_.every(context.containedElements, '$setManager.called'), 'elements $setManager called').to.be.true;
                expect(_.every(context.containedElements, (e) => e.$setManager.alwaysCalledWithExactly(manager)), "elements $setManager called with manager").to.be.true;
            }
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