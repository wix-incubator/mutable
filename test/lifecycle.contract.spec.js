import {expect} from 'chai';
import _ from 'lodash';
import sinon from 'sinon';
import {LifeCycleManager} from '../src/lifecycle';

/**
 * this is a parameterized test suite specifically designed to test the dirtyable contract.
 * the setup is messy. the tests themselves can be found in methods contractSuite and mutatorContract.
 **/
export function lifecycleContract(){
    var fixtures = [];
    return {
        addFixture :(containerFactory, elementFactory, description) => {
            var fixture = {
                description : description,
                dirtyableElements: !!elementFactory().$isDirty
            };
            setFactoriesInFixture(fixture, containerFactory, elementFactory);
            addFixtureSetup(fixture);
            fixtures.push(fixture);
        },
        assertMutatorContract: (mutator, description) => {
            fixtures.forEach((fixture) => {
                mutatorContract(description, fixture, mutator);
                contractSuite(_.create(fixture, {
                    containerFactory: () => {
                        var result = fixture.containerFactory();
                        mutator(result, fixture.elementFactory);
                        return result;
                    },
                    description : fixture.description + ' after ' + description
                }));
            });
        },
        assertDirtyContract: () => {
            fixtures.forEach(contractSuite);
        }
    };
}

function setContainedElements(fixture) {
    if (fixture.dirtyableElements) {
        fixture.containedElements = _.intersection(fixture.allElements, _.values(fixture.container.__value__));
        expect(fixture.containedElements.length).to.be.at.least(2);
    } else {
        fixture.containedElements = [];
    }
}

function setFactoriesInFixture(fixture, containerFactory, elementFactory) {
    fixture.containerFactory = () => {
        fixture.allElements = [];
        var result = containerFactory(fixture.elementFactory(), fixture.elementFactory()); // always two elements in the fixture
        return result;
    };
    fixture.elementFactory = (...args) => {
        var result = elementFactory(...args);
        if (fixture.dirtyableElements) {
            sinon.stub(result, '$isDirty');
            sinon.spy(result, '$setDirty');
            sinon.spy(result, '$resetDirty');
            sinon.spy(result, '$setManager');
        }
        fixture.allElements.push(result);
        return result;
    };
}

function addFixtureSetup(fixture) {
    fixture.setup = () => {
        beforeEach('reset', () => {
            fixture.lifecycleManager = new LifeCycleManager();
            sinon.stub(fixture.lifecycleManager, '$change');
            fixture.container = fixture.containerFactory();
            setContainedElements(fixture);
            _.forEach(fixture.containedElements, (elem) => elem.$setManager.reset());
            // reset dirty flag of container
            fixture.container.$resetDirty();
            if (fixture.dirtyableElements) {
                _.forEach(fixture.containedElements, (elem) => elem.$resetDirty.reset());
            }
        });
        afterEach('cleanup', () => {
            delete fixture.container;
        });
    };
}

/**
 * the contract of a mutator
 */
function mutatorContract(description, fixture, mutator) {
    describe('applying ' + description + ' on ' + fixture.description, function () {
        fixture.setup();
        it('calls $setDirty', function () {
            var spy = sinon.spy(fixture.container, '$setDirty');
            mutator(fixture.container, fixture.elementFactory);
            expect(spy.called).to.be.true;
            expect(spy.alwaysCalledOn(fixture.container), '$setDirty called only on container').to.be.true;
            expect(spy.alwaysCalledWithExactly(sinon.match.truthy), "container $setDirty only called with truthy argument").to.be.true;
        });
        if (fixture.dirtyableElements) {
            it('does not affect elements\' lifecycle', function () {
                mutator(fixture.container, fixture.elementFactory);
                expect(_.any(fixture.containedElements, '$isDirty.called'), '$isDirty called on element(s)').to.be.false;
                expect(_.any(fixture.containedElements, '$setDirty.called'), '$setDirty called on element(s)').to.be.false;
                expect(_.any(fixture.containedElements, '$resetDirty.called'), '$resetDirty called on element(s)').to.be.false;
            });
        }
    });
}

/**
 * check the dirty contract
 */
function contractSuite(fixture){
    testSetDirty(fixture);
    testResetDirty(fixture);
    testIsDirty(fixture);
    testSetManager(fixture);
    testMakeChange(fixture);
}

function testSetDirty(fixture) {
    describe('calling $setDirty on ' + fixture.description, function () {
        fixture.setup();
        it('changes result of $isDirty', function () {
            fixture.container.$setDirty(true);
            expect(fixture.container.$isDirty(), 'container dirty after calling $setDirty(true)').to.be.true;
            fixture.container.$setDirty(false);
            expect(fixture.container.$isDirty(), 'container dirty after calling $setDirty(false)').to.be.false;
        });
        describe('with lifecycle manager', () => {
            [true, false].forEach((dirtyState) => {
                describe('to set dirty flag to ' + dirtyState , () =>{
                    [true, false].forEach((managerState) => {
                        describe('when .$change() returns' + managerState , () => {
                            var expectedResult = dirtyState == managerState;
                            it('will return ' +expectedResult, function () {
                                fixture.container.$setDirty(!dirtyState);
                                fixture.lifecycleManager.$change.returns(managerState);
                                fixture.container.$setManager(fixture.lifecycleManager);
                                var result = fixture.container.$setDirty(dirtyState);
                                expect(result, 'result of $setDirty').to.equal(expectedResult);
                                expect(fixture.container.$isDirty(), 'container dirty after calling $setDirty').to.equal(expectedResult == dirtyState);
                            });
                        });
                    });
                });
            });
        });
        if (fixture.dirtyableElements) {
            [true, false].forEach((flagVal) => {
                describe('setting flag to ' + flagVal + ' when elements $isDirty returns ' + !flagVal, () => {
                    it('makes $isDirty return ' + flagVal, function () {
                        fixture.containedElements.forEach((e) => e.$isDirty.returns(!flagVal));
                        expect(fixture.container.$isDirty(), 'container dirty before calling $setDirty(' + flagVal + ')').to.equal(!flagVal);
                        fixture.container.$setDirty(flagVal);
                        expect(fixture.container.$isDirty(), 'container dirty after calling $setDirty(' + flagVal + ')').to.equal(flagVal);
                    });
                    it('in read only form makes no changes', function () {
                        fixture.containedElements.forEach((e) => e.$isDirty.returns(!flagVal));
                        expect(fixture.container.$isDirty(), 'container dirty before calling $setDirty(' + flagVal + ')').to.equal(!flagVal);
                        fixture.container.$asReadOnly().$setDirty(flagVal);
                        expect(fixture.container.$isDirty(), 'container dirty after calling $setDirty(' + flagVal + ')').to.equal(!flagVal);
                    });
                    it('does not affect elements\' lifecycle', function () {
                        fixture.container.$setDirty(flagVal);
                        expect(_.any(fixture.containedElements, '$isDirty.called'), '$isDirty called on element(s)').to.be.false;
                        expect(_.any(fixture.containedElements, '$setDirty.called'), '$resetDirty called on element(s)').to.be.false;
                        expect(_.any(fixture.containedElements, '$resetDirty.called'), '$resetDirty called on element(s)').to.be.false;
                    });
                });
            });
        } else {
            it('setting flag to true in read only form makes no changes', function () {
                expect(fixture.container.$isDirty(), 'container dirty before calling $setDirty(true)').to.be.false;
                fixture.container.$asReadOnly().$setDirty(true);
                expect(fixture.container.$isDirty(), 'container dirty after calling $setDirty(true)').to.be.false;
            });
            it('setting flag to false in read only form makes no changes', function () {
                fixture.container.$setDirty(true);
                expect(fixture.container.$isDirty(), 'container dirty before calling $setDirty(false)').to.be.true;
                fixture.container.$asReadOnly().$setDirty(false);
                expect(fixture.container.$isDirty(), 'container dirty after calling $setDirty(false)').to.be.true;
            });
        }
    });
}
function testResetDirty(fixture) {
    describe('calling $resetDirty on ' + fixture.description, function () {
        fixture.setup();
        it('makes $isDirty return false', function () {
            fixture.container.$setDirty(true);
            fixture.containedElements.forEach((e) => e.$isDirty.returns(false));
            expect(fixture.container.$isDirty(), 'container dirty before calling $resetDirty').to.be.true;
            fixture.container.$resetDirty();
            expect(fixture.container.$isDirty(), 'container dirty after calling $resetDirty').to.be.false;
        });
        if (fixture.dirtyableElements) {
            it('propagates to elements', function () {
                expect(_.any(fixture.containedElements, '$resetDirty.called'), '$resetDirty called on any element(s)').to.be.false;
                fixture.container.$resetDirty();
                expect(_.every(fixture.containedElements, '$resetDirty.called'), '$resetDirty called on all element(s)').to.be.true;
            });
            it('does not affect elements\' lifecycle', function () {
                fixture.container.$resetDirty();
                expect(_.any(fixture.containedElements, '$isDirty.called'), '$isDirty called on element(s)').to.be.false;
                expect(_.any(fixture.containedElements, '$setDirty.called'), '$setDirty called on element(s)').to.be.false;
            });
        }
    });
}
function testIsDirty(fixture){
    describe('calling $isDirty on ' + fixture.description, function () {
        fixture.setup();
        describe('twice returns same result', () => {
            [true, false].forEach((flagVal) => {
                it(': ' + flagVal, function () {
                    if (flagVal) {
                        fixture.container.$setDirty(flagVal);
                    }
                    var dirty1 = fixture.container.$isDirty();
                    var dirty2 = fixture.container.$isDirty();
                    expect(dirty1, 'container dirty flag on first call').to.equal(flagVal);
                    expect(dirty2, 'container dirty flag on second call').to.equal(flagVal);
                });
            });
        });
        it('after calling $setDirty returns true without checking elements', function () {
            fixture.container.$setDirty(true);
            var dirty = fixture.container.$isDirty();
            expect(_.any(fixture.containedElements, '$isDirty.called'), '$isDirty called on element(s)').to.be.false;
            expect(dirty, 'container dirty flag').to.be.true;
        });
        it('(when $setDirty not called) recourse through all elements and returns false by default', function () {
            fixture.containedElements.forEach((e) => e.$isDirty.returns(false));
            var dirty = fixture.container.$isDirty();
            if (fixture.dirtyableElements) {
                expect(_.filter(fixture.containedElements, '$isDirty.called'), 'element(s) that $isDirty was called upon').to.eql(fixture.containedElements);
            }
            expect(dirty, 'container dirty flag').to.be.false;
        });
        if (fixture.dirtyableElements) {
            it('does not affect elements\' lifecycle', function () {
                fixture.container.$isDirty();
                expect(_.any(fixture.containedElements, '$setDirty.called'), '$setDirty called on element(s)').to.be.false;
                expect(_.any(fixture.containedElements, '$resetDirty.called'), '$resetDirty called on element(s)').to.be.false;
            });
            it("(when $setDirty not called) returns true after checking the first element and finding that it's dirty", function () {
                fixture.containedElements[0].$isDirty.returns(true);
                var dirty = fixture.container.$isDirty();
                expect(_.filter(fixture.containedElements, '$isDirty.called'), 'element(s) that $isDirty was called upon').to.eql([fixture.containedElements[0]]);
                expect(dirty, 'container dirty flag').to.be.true;
            });
            it("(when $setDirty not called) returns true after checking the second element and finding that it's dirty", function () {
                fixture.containedElements.forEach((e) => e.$isDirty.returns(false));
                fixture.containedElements[fixture.containedElements.length - 1].$isDirty.returns(true);
                var dirty = fixture.container.$isDirty();
                expect(_.filter(fixture.containedElements, '$isDirty.called'), 'element(s) that $isDirty was called upon').to.eql(fixture.containedElements);
                expect(dirty, 'container dirty flag').to.be.true;
            });
        }
    });
}

function testSetManager(fixture) {
    describe('calling $setManager on ' + fixture.description, function () {
        fixture.setup();
        it('changes the manager field', function () {
            var manager = new LifeCycleManager();
            fixture.container.$setManager(manager);
            expect(fixture.container.__lifecycleManager__, 'container manager').to.equal(manager);
            if (fixture.dirtyableElements) {
                expect(_.every(fixture.containedElements, '$setManager.called'), 'elements $setManager called').to.be.true;
                expect(_.every(fixture.containedElements, (e) => e.$setManager.alwaysCalledWithExactly(manager)), "elements $setManager called with manager").to.be.true;
            }
        });
        it('in readonly form does not change the manager field', function () {
            var manager = new LifeCycleManager();
            fixture.container.$asReadOnly().$setManager(manager);
            expect(fixture.container.__lifecycleManager__, 'container manager').to.be.undefined;
            if (fixture.dirtyableElements) {
                expect(_.any(fixture.containedElements, '$setManager.called'), 'elements $setManager called').to.be.false;
            }
        });
        it('with invalid type does not change the manager field', function () {
            fixture.container.$setManager({});
            expect(fixture.container.__lifecycleManager__, 'container manager').to.be.undefined;
            if (fixture.dirtyableElements) {
                expect(_.any(fixture.containedElements, '$setManager.called'), 'elements $setManager called').to.be.false;
            }
        });
    });
}

//TODO test that elements get the manager upon assignment
function testMakeChange(fixture) {


}