import {expect} from 'chai';

import * as Mutable from '../../../src';
import {aNumberList, aStringList, aVeryCompositeContainerList, UserType} from '../builders';
import lifeCycleAsserter from '../lifecycle.js';
import {ERROR_FIELD_MISMATCH_IN_LIST_METHOD} from '../../../test-kit/test-drivers/reports'

describe('List', function() {
    describe('mutable instance', function() {

        describe('reverse', function() {
            it('should reverse the order of elements in a List', function() {
                var numberList = aNumberList();
                var newList = numberList.concat();

                newList.reverse();

                expect(newList).to.be.instanceOf(Mutable.List);

                for (var i = 0; i < numberList.length; i++) {
                    expect(numberList.at(i)).to.equal(newList.at(newList.length - i - 1));
                }
            });

            lifeCycleAsserter.assertMutatorContract((arr) => arr.reverse(), 'reverse');
        });

        describe('sort', function() {
            it('should return a sorted copy of the list but not change the original', function() {
                const stringList = aStringList(['2', '1', '3']);
                const numberList = aNumberList([ 2, 1, 3]);

                function reverseCompareNumbers(a, b) {
                    return b-a;
                }

                const sortedStringList = stringList.sort().toJSON();
                const sortedNumberList = numberList.sort().toJSON();
                const funkySortNumberList = numberList.sort(reverseCompareNumbers).toJSON();

                expect(sortedStringList, 'sorting with native string comparator').to.eql(['1', '2', '3']);
                expect(sortedNumberList, 'sorting with native number comparator').to.eql([ 1, 2, 3]);
                expect(funkySortNumberList, 'sorting with custom comparator').to.eql([ 3, 2, 1]);

                expect(stringList.toJSON(), 'original string list unchanged').to.eql(['2', '1', '3']);
                expect(numberList.toJSON(), 'original number list unchanged').to.eql([ 2, 1, 3]);
            });
        });

        describe('splice', function() {
            it('changes the content of a List by removing existing elements and/or adding new elements', function() {
                var numberList = aNumberList([1, 2, 3, 4]);

                var removedItems = numberList.splice(1, 2, 7, 10, 13);

                expect(numberList.length).to.equal(5);
                expect(numberList.at(0)).to.equal(1);
                expect(numberList.at(1)).to.equal(7);
                expect(numberList.at(2)).to.equal(10);
                expect(numberList.at(3)).to.equal(13);
                expect(numberList.at(4)).to.equal(4);

                expect(removedItems.length).to.equal(2);
                expect(removedItems[0]).to.equal(2);
                expect(removedItems[1]).to.equal(3);
            });

            it('Should wrap items for none immutable data (like custom types)', function() {
                var arr = Mutable.List.of(UserType).create([{ name: 'aag' }, { name: 'dag' }]);

                arr.splice(0, 1, { name: 'zag' });

                expect(arr.at(1)).to.be.instanceOf(UserType);
                expect(arr.at(0).name).to.equal('zag');
                expect(arr.at(1).name).to.equal('dag');
            });

            // todo: add another test with _type annotation
            it("report correct path for field type mismatch in deep field", function() {
                var numberList = aVeryCompositeContainerList([{}, {}, {}, {}]);
                expect(() => numberList.splice(2, 1, {}, { child1: { user: { age: "666" } } }))
                    .to.report(ERROR_FIELD_MISMATCH_IN_LIST_METHOD('splice', 'List<VeryCompositeContainer>[3].child1.user.age', 'number', 'string'));
            });
            lifeCycleAsserter.assertMutatorContract((arr, elemFactory) => arr.splice(1, 2, elemFactory()), 'splice');
        });
    });
});
