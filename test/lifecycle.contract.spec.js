const _ = require('lodash');
import {expect} from 'chai';
import * as sinon from 'sinon';

import {LifeCycleManager} from '../src';

/**
 * this is a parameterized test suite specifically designed to test the dirtyable contract.
 * the setup is messy. the tests themselves can be found in methods contractSuite and mutatorContract.
 **/
export function lifecycleContract() {
    var contexts = [];
    function addFixture(description, elementFactory, containerFactory) {
        var context = {
            description: description,
            dirtyableElements: !!elementFactory().$asReadOnly,
            readOnlyElements: elementFactory().$isReadOnly && elementFactory().$isReadOnly()
        };
        setFactoriesInFixture(context, containerFactory, elementFactory);
        addFixtureSetup(context);
        contexts.push(context);
        return context;
    }
    return {
        addFixture: (containerFactory, elementFactory, description) => {
            let context = addFixture(description, elementFactory, containerFactory);
            if (context.dirtyableElements) {
                addFixture(description + ' (readonly elements)', () => elementFactory().$asReadOnly(), containerFactory);
            }
        },
        assertMutatorContract: (mutator, description) => {
            if (!contexts.length){
                throw new Error('empty contexts!');
            }
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
                    description: context.description + ' after ' + description
                }));
            });
        },
        assertDirtyContract: () => {
            if (!contexts.length){
                throw new Error('empty contexts!');
            }
            contexts.forEach(contractSuite);
        }
    };
}

function setContainedElements(context) {
    var elements = [];
    context.container.$dirtyableElementsIterator((c, e) => elements.push(e));
    context.containedElements = _.intersection(context.allElements, elements);
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
            context.container = context.containerFactory();
            setContainedElements(context);
            if (context.dirtyableElements) {
                _.forEach(context.containedElements, (elem) => elem.$setManager.reset());
            }
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
    describe('applying ' + description + ' on ' + context.description, function() {
        context.setup();
        if (context.dirtyableElements) {
            it('sets lifecycle manager in newly added elements', function() {
                context.container.$setManager(context.lifecycleManager);
                var oldElements = context.containedElements;
                mutator(context.container, context.elementFactory);
                var addedElements = _(oldElements).intersection(context.containedElements);
                expect(addedElements.every('$setManager.called'), '$setManager called on element(s)').to.be.true;
                expect(addedElements.every((element) => element.$setManager.calledWithExactly(context.lifecycleManager)), '$setManager called on element(s)').to.be.true;
            });
            it('does not try to set lifecycle manager in read-only newly added elements', function() {
                context.container.$setManager(context.lifecycleManager);
                var oldElements = context.containedElements;
                mutator(context.container, (...args) => context.elementFactory(...args).$asReadOnly());
                var addedElements = _(oldElements).intersection(context.containedElements);
                expect(addedElements.some('$setManager.called'), '$setManager not called on element(s)').to.be.false;
            });
        }
    });
}

/**
 * check the dirty contract
 */
function contractSuite(context) {
    testSetManager(context);
}

function testSetManager(context) {
    describe('calling $setManager on ' + context.description, function() {
        context.setup();
        it('with existing different manager does not change the manager and reports error', function() {
            var manager = context.container.__lifecycleManager__ = new LifeCycleManager();
            expect(() => context.container.$setManager(new LifeCycleManager())).to.report({ level: /error/ });
            expect(context.container.__lifecycleManager__, 'container manager').to.equal(manager);
        });
        it('when no existing manager changes the manager field', function() {
            var manager = new LifeCycleManager();
            context.container.$setManager(manager);
            expect(context.container.__lifecycleManager__, 'container manager').to.equal(manager);
        });
        if (context.readOnlyElements) {
            it('when no existing manager does not change the manager field of child elements', function() {
                expect(() => context.container.$setManager(new LifeCycleManager())).not.to.report({ level: /error/ });
                expect(_.some(context.containedElements, '$setManager.called'), 'no elements $setManager called').to.be.false;
            });
        } else if (context.dirtyableElements) {
            it('when no existing manager changes the manager field of child elements', function() {
                var manager = new LifeCycleManager();
                context.container.$setManager(manager);
                expect(_.every(context.containedElements, '$setManager.called'), 'elements $setManager called').to.be.true;
                expect(_.every(context.containedElements, (e) => e.$setManager.alwaysCalledWithExactly(manager)), "elements $setManager called with manager").to.be.true;
            });
        }
        it('in readonly form does not report an error', function() {
            var manager = new LifeCycleManager();
            expect(() => context.container.$asReadOnly().$setManager(manager)).to.not.report({ level: /error/ });
        });
        it('with invalid type reports an error', function() {
            expect(() => context.container.$setManager({})).to.report({ level: /error/ });
        });
    });
}
