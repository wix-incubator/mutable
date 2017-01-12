import * as _ from 'lodash';
import {expect} from 'chai';
import * as sinon from 'sinon';

import * as mu from '../../../src';
import * as builders from '../builders';

function testViewFunctionality(builders, isReadonly) {

    describe('List', function() {
        var usersList;
        beforeEach(() => {
            usersList = builders.aUserList([{ age: 11 }, { age: 12 }]);
        });

        describe('with property name iteratee', function() {

            it('naively works', function() {
                var newList = usersList.map('age');

                // Take a property and return a List
                expect(_.isArray(newList)).to.be.true;
                // Make sure the values and length are correct
                expect(newList).to.eql([11, 12]);
            });

            it('matches property value to thisArg', function() {
                var newList = usersList.map('age', 11);

                // Take a property and return a List
                expect(_.isArray(newList)).to.be.true;
                // Make sure the values and length are correct
                expect(newList).to.eql([true, false]);
            });
        });

        describe('with object iteratee', function() {
            it('works with mu instances', function() {
                var newList = usersList.map(builders.UserType.create({ age: 11 }));

                // Take a property and return a List
                expect(_.isArray(newList), '.map() result is List').to.be.true;
                // Make sure the values and length are correct
                expect(newList, '.map() result').to.eql([true, false]);
            });

            it('works with pojos', function() {
                var newList = usersList.map({ age: 11 });

                // Take a property and return a List
                expect(_.isArray(newList)).to.be.true;
                // Make sure the values and length are correct
                expect(newList).to.eql([true, false]);
            });
        });

        it('calls a callback function on every item in a List and constructs a new List from the results', function() {
            var newList = builders.aNumberList([1, 2, 3]).map(num => num * 2);

            // Take a callback function and return a List
            expect(_.isArray(newList)).to.be.true;
            // Make sure the values and length are correct
            expect(newList).to.eql([2, 4, 6]);
        });

        it('passes the index to the map func', function() {
            var newList = builders.aNumberList([1, 2, 3]).map((num, index) => num * index);

            expect(_.isArray(newList)).to.be.true;
            expect(newList).to.eql([0, 2, 6]);
        });

        if (isReadonly) {
            it('provides readonly version if needsd', function() {
                var newList = usersList.map((user, index) => {
                    expect(user.$isReadOnly()).to.be.equal(true);
                    return user.age * index;
                });

                expect(_.isArray(newList)).to.be.true;
                expect(newList).to.eql([0, 12]);
            });
        }
    });

    describe('reduce', function() {
        var sum = (a, b) => a + b;

        it('runs the iteratee for each member of the List minus one', function() {
            var spy = sinon.spy();
            var items = [1, 2, 3];

            builders.aNumberList(items).reduce(spy);

            expect(spy).to.have.callCount(items.length - 1);
        });

        it('aggregate all elements of a List', function() {
            expect(builders.aNumberList([10, 20, 30]).reduce(sum)).to.equal(60);
        });

        it('aggregate all elements of a List, starting from the zero element', function() {
            expect(builders.aNumberList([10, 20, 30]).reduce(sum, 40)).to.equal(100);
        });

        it('uses the first item of the List as the zero element if none was supplied', function() {
            var numberList = builders.aNumberList();

            expect(numberList.reduce(_.identity)).to.eql(numberList.at(0));
        });

        it('uses the supplied zero element', function() {
            var zeroElement = 42;

            expect(builders.aNumberList().reduce(_.identity, zeroElement)).to.equal(zeroElement);
        });

        it('should match currentValue to the correct current item from the List', function() {
            var mixedList = builders.aUserOrAddressList([{ _type: 'User' }, { _type: 'Address' }])

            mixedList.reduce(function(accumulator, currentValue, index) {
                expect(currentValue).to.eql(mixedList.at(index));
            });
        });

        it('handles an empty List as long as a zero element is supplied', function() {
            expect(builders.anEmptyList().reduce(_.identity, 0)).to.equal(0);
        });

        if (isReadonly) {
            it('provides readonly version of elements', function() {
                var newList = builders.aUserList([{ age: 11 }, { age: 12 }]).reduce((acc, user) => {
                    expect(user.$isReadOnly()).to.be.equal(true);
                });
            });
        }
    });

    describe('forEach', function() {
        it('should call the method passed with item, index, arr', function() {
            var sourceArr = ['a', 'b'];
            var numberList = builders.aStringList(sourceArr);
            var spy = sinon.spy();

            numberList.forEach(spy);

            expect(spy).to.have.been.calledWith('a', 0, numberList).and.calledWith('b', 1, numberList);
        });

        if (isReadonly) {
            it('provides readonly version of elements', function() {
                var newList = builders.aUserList([{ age: 11 }, { age: 12 }]).forEach((user) => {
                    expect(user.$isReadOnly()).to.be.equal(true);
                });
            });
        }
    });

    describe('every', function() {
        it('returns true for an empty List', function() {
            expect(builders.anEmptyList().every(_.identity)).to.be.true;
        });

        it('returns true if all elements pass the test provided by the callback', function() {
            expect(builders.aStringList(['a', 'a']).every(elem => elem === 'a')).to.be.true;
        });

        it('returns false if at least one element in the List returns false from the callback', function() {
            expect(builders.aStringList(['a', 'b']).every(elem => elem === 'a')).to.be.false;
        });
        if (isReadonly) {
            it('provides readonly version of elements', function() {
                var allReadOnly = builders.aUserList([{ age: 11 }, { age: 12 }]).every(user => user.$isReadOnly());
                expect(allReadOnly).to.be.true;
            });
        }
    });

    describe('some', function() {
        it('returns false for an empty List', function() {
            expect(builders.anEmptyList().some(_.identity)).to.be.false;
        });

        it('should return true if any elements pass the test provided by the callback', function() {
            expect(builders.aStringList(['a', 'b']).some(elem => elem === 'a')).to.be.true;

        });
        it('should return false if all elements fail to pass the test provided by the callback', function() {
            expect(builders.aStringList(['a', 'a']).some(elem => elem === 'b')).to.be.false;

        });
        if (isReadonly) {
            it('provides readonly version of elements', function() {
                var someReadWrite = builders.aUserList([{ age: 11 }, { age: 12 }]).some(user => !user.$isReadOnly());
                expect(someReadWrite).to.be.false;
            });
        }
    });

    describe('find', function() {
        it('returns the first element matching a predicate', function() {
            expect(builders.aStringList(['aa', 'ab']).find(x => _.startsWith(x, 'a'))).to.equal('aa');
        });

        it('returns undefined if no matching element passes the predicate', function() {
            expect(builders.aNumberList([1, 2]).find(x => x < 0)).to.be.undefined;
        });

        it('supports an object as the predicate', function() {
            var arr = builders.aUserList([{ name: 'lando' }, { name: 'mollari' }]);

            expect(arr.find({ name: 'mollari' })).to.equal(arr.at(1));
        });
        if (isReadonly) {
            it('provides readonly version of elements', function() {
                var readWriteInstance = builders.aUserList([{ age: 11 }, { age: 12 }]).find(user => !user.$isReadOnly());
                expect(readWriteInstance).to.be.undefined;
            });
            it('returns readOnly element', function() {
                var arr = builders.aUserList([{ name: 'lando' }, { name: 'mollari' }]);
                expect(arr.find({ name: 'mollari' }).$isReadOnly()).to.be.true;
            });
        }
    });

    describe('findIndex', function() {
        it('returns the first element matching a predicate', function() {
            expect(builders.aStringList(['aa', 'ab']).findIndex(x => _.startsWith(x, 'ab'))).to.equal(1);
        });

        it('returns -1 if no matching element passes the predicate', function() {
            expect(builders.aNumberList([1, 2]).findIndex(x => x < 0)).to.equal(-1);
        });

        it('supports an object as the predicate', function() {
            var arr = builders.aUserList([{ name: 'lando' }, { name: 'mollari' }]);

            expect(arr.findIndex({ name: 'mollari' })).to.equal(1);
        });
        if (isReadonly) {
            it('provides readonly version of elements', function() {
                var readWriteInstanceIdx = builders.aUserList([{ age: 11 }, { age: 12 }]).findIndex(user => !user.$isReadOnly());
                expect(readWriteInstanceIdx).to.equal(-1);
            });
        }
    });

    describe('filter', function() {
        it('should return a new List with all elements that pass the predicate', function() {
            var positives = builders.aNumberList(0, 1, 2).filter(x => x > 0);

            expect(positives).to.be.instanceof(mu.List);
            expect(positives.valueOf()).to.eql([1, 2]);
        });

        it('should return an empty List if no elements pass the predicate', function() {
            var positives = builders.aNumberList(0, 1, 2).filter(x => x < 0);

            expect(positives).to.be.instanceof(mu.List);
            expect(positives.valueOf()).to.be.empty;
        });

        it('supports an object as the predicate', function() {
            var lando = { name: 'lando', age: Infinity };
            var mollari = { name: 'mollari', age: Infinity };
            var arr = builders.aUserList([lando, mollari]);

            expect(arr.filter(lando).toJSON()).to.eql([lando]);
        });
        if (isReadonly) {

            it('returns readOnly element if List is ReadOnly', function() {
                var lando = { name: 'lando', age: Infinity };
                var mollari = { name: 'mollari', age: Infinity };
                var arr = builders.aUserList([lando, mollari]);
                expect(arr.filter(user => !user.$isReadOnly()).length).to.equal(0);
            });
        }
    });
}

describe('List', function() {
    describe('mu instance', function() {
        testViewFunctionality(builders, false);
    });
    describe('read-only instance', function() {
        testViewFunctionality(builders.asReadOnly(), true);
    });
});
