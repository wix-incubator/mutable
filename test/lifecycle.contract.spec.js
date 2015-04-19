import {expect} from 'chai';
import _ from 'lodash';
import sinon from 'sinon';
import {LifeCycleManager} from '../src/lifecycle';

/**
 * this is a parameterised test suite specifically designed to test the dirtyable contract.
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

function spyWrapper(factory, isDirty, setDirty, resetDirty, setManager){
    return (...args) => {
        var result = factory(...args);
        result.$isDirty = isDirty;
        result.$setDirty = setDirty;
        result.$resetDirty = resetDirty;
        result.$setManager = setManager;
        return result;
    };
}

function setFactoriesInFixture(fixture, containerFactory, elementFactory) {
// since spy.reset() sucks, we use indirection as a method of resetting spies state
    var isDirtyWrapper = () => fixture.elementIsDirty();
    var setDirtyWrapper = (v) => fixture.elementSetDirty(v);
    var resetDirtyWrapper = () => fixture.elementResetDirty();
    var setManagerWrapper = (v) => fixture.elementSetManager(v);
    fixture.elementFactory = fixture.dirtyableElements ? spyWrapper(elementFactory, isDirtyWrapper, setDirtyWrapper, resetDirtyWrapper, setManagerWrapper) : elementFactory;
    fixture.containerFactory = () => {
        var result = containerFactory(fixture.elementFactory(), fixture.elementFactory()); // always two elements in the fixture
        if (fixture.dirtyableElements) {
            expect(
                _.all(result.__value__, (val) => !val.$isDirty || val.$isDirty === isDirtyWrapper),
                "all dirtyable elements' $isDirty methods are stubbed").to.be.true;
        }
        return result;
    };
}

function addFixtureSetup(fixture) {
    fixture.setup = () => {
        beforeEach('reset', () => {
            fixture.lifecycleManager = new LifeCycleManager();
            sinon.stub(fixture.lifecycleManager, '$change');
            fixture.container = fixture.containerFactory();
            // reset dirty flag of container
            fixture.elementResetDirty = _.noop;
            fixture.container.$resetDirty();
            // reset spies / stubs state
            fixture.elementSetManager = sinon.spy();
            fixture.elementIsDirty = sinon.stub();
            fixture.elementSetDirty = sinon.spy();
            fixture.elementResetDirty = sinon.spy();
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
                expect(fixture.elementIsDirty.called, '$isDirty called on element(s)').to.be.false;
                expect(fixture.elementSetDirty.called, '$setDirty called on element(s)').to.be.false;
                expect(fixture.elementResetDirty.called, '$resetDirty called on element(s)').to.be.false;
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
                        fixture.elementIsDirty.returns(!flagVal); // always two elements in the fixture
                        expect(fixture.container.$isDirty(), 'container dirty before calling $setDirty(' + flagVal + ')').to.equal(!flagVal);
                        fixture.container.$setDirty(flagVal);
                        expect(fixture.container.$isDirty(), 'container dirty after calling $setDirty(' + flagVal + ')').to.equal(flagVal);
                    });
                    it('in read only form makes no changes', function () {
                        fixture.elementIsDirty.returns(!flagVal); // always two elements in the fixture !
                        expect(fixture.container.$isDirty(), 'container dirty before calling $setDirty(' + flagVal + ')').to.equal(!flagVal);
                        fixture.container.$asReadOnly().$setDirty(flagVal);
                        expect(fixture.container.$isDirty(), 'container dirty after calling $setDirty(' + flagVal + ')').to.equal(!flagVal);
                    });
                    it('does not affect elements\' lifecycle', function () {
                        fixture.container.$setDirty(flagVal);
                        expect(fixture.elementIsDirty.called, '$isDirty called on element(s)').to.be.false;
                        expect(fixture.elementSetDirty.called, '$setDirty called on element(s)').to.be.false;
                        expect(fixture.elementResetDirty.called, '$resetDirty called on element(s)').to.be.false;
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
            fixture.elementIsDirty.returns(false);
            expect(fixture.container.$isDirty(), 'container dirty before calling $resetDirty').to.be.true;
            fixture.container.$resetDirty();
            expect(fixture.container.$isDirty(), 'container dirty after calling $resetDirty').to.be.false;
        });
        if (fixture.dirtyableElements) {
            it('propagates to elements', function () {
                expect(fixture.elementResetDirty.called, '$resetDirty called on element(s)').to.be.false;
                fixture.container.$resetDirty();
                expect(fixture.elementResetDirty.called, '$resetDirty called on element(s)').to.be.true; // todo assert called once per element?
            });
            it('does not affect elements\' lifecycle', function () {
                fixture.container.$resetDirty();
                expect(fixture.elementIsDirty.called, '$isDirty called on element(s)').to.be.false;
                expect(fixture.elementSetDirty.called, '$setDirty called on element(s)').to.be.false;
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
            expect(fixture.elementIsDirty.called, '$isDirty called on element(s)').to.be.false;
            expect(dirty, 'container dirty flag').to.be.true;
        });
        it('(when $setDirty not called) recourse through all elements and returns false by default', function () {
            fixture.elementIsDirty.returns(false);
            var dirty = fixture.container.$isDirty();
            if (fixture.dirtyableElements) {
                expect(fixture.elementIsDirty.calledTwice, '$isDirty called on element(s) twice').to.be.true; // always two elements in the fixture
            }
            expect(dirty, 'container dirty flag').to.be.false;
        });
        if (fixture.dirtyableElements) {
            it('does not affect elements\' lifecycle', function () {
                fixture.container.$isDirty();
                expect(fixture.elementSetDirty.called, '$setDirty called on element(s)').to.be.false;
                expect(fixture.elementResetDirty.called, '$resetDirty called on element(s)').to.be.false;
            });
            it("(when $setDirty not called) returns true after checking the first element and finding that it's dirty", function () {
                fixture.elementIsDirty.onFirstCall().returns(true); // always two elements in the fixture
                var dirty = fixture.container.$isDirty();
                expect(fixture.elementIsDirty.calledOnce, '$isDirty called on element(s) once').to.be.true;
                expect(dirty, 'container dirty flag').to.be.true;
            });
            it("(when $setDirty not called) returns true after checking the second element and finding that it's dirty", function () {
                fixture.elementIsDirty.onFirstCall().returns(false);
                fixture.elementIsDirty.onSecondCall().returns(true); // always two elements in the fixture
                var dirty = fixture.container.$isDirty();
                expect(fixture.elementIsDirty.calledTwice, '$isDirty called on element(s) twice').to.be.true;
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
                expect(fixture.elementSetManager.calledTwice, 'container manager').to.be.true;
                expect(fixture.elementSetManager.alwaysCalledWithExactly(manager), "elements $setManager called with manager").to.be.true;
            }
        });
        it('in readonly form does not change the manager field', function () {
            var manager = new LifeCycleManager();
            fixture.container.$asReadOnly().$setManager(manager);
            expect(fixture.container.__lifecycleManager__, 'container manager').to.be.undefined;
            if (fixture.dirtyableElements) {
                expect(fixture.elementSetManager.called, 'container manager').to.be.false;
            }
        });
        it('with invalid type does not change the manager field', function () {
            fixture.container.$setManager({});
            expect(fixture.container.__lifecycleManager__, 'container manager').to.be.undefined;
            if (fixture.dirtyableElements) {
                expect(fixture.elementSetManager.called, 'container manager').to.be.false;
            }
        });
    });
}


function testMakeChange(fixture) {


}