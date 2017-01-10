import {expect} from 'chai';

import * as mu from '../../../src';
import {aNumberList, aStringList, aVeryCompositeContainerList, UserType} from '../builders';
import {ERROR_FIELD_MISMATCH_IN_LIST_METHOD} from '../../../test-kit/test-drivers/reports'

describe('List', function() {
    describe('mu instance', function() {

        describe('reverse', function() {
            it('should reverse the order of elements in a List', function() {
                const numberList = aNumberList();
                const newList = numberList.reverse();
                expect(newList).to.be.instanceOf(mu.List);
                for (let i = 0; i < numberList.length; i++) {
                    expect(numberList.at(i)).to.equal(newList.at(newList.length - i - 1));
                }
            });
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
                var arr = mu.List.of(UserType).create([{ name: 'aag' }, { name: 'dag' }]);

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

            describe('lifecycleManager', function() {
                let arr, manager, child;
                beforeEach(()=>{
                    manager = new LifeCycleManager();
                    arr = mu.List.of(UserType).create([new builders.UserType(), new builders.UserType(), new builders.UserType()]);
                    arr.$setManager(manager);
                    child = new builders.UserType();
                    sinon.spy(child, '$setManager');
                });
                if (context.dirtyableElements) {
                    it('sets lifecycle manager in newly added elements', function() {
                        arr.splice(1, 2, child);
                        expect(child.$setManager).to.have.been.calledWithExactly(manager);
                    });
                    it('does not try to set lifecycle manager in read-only newly added elements', function() {
                        arr.splice(1, 2, child.$asReadOnly());
                        expect(child.$setManager).to.have.not.been.calledWithExactly(manager);
                    });
                }
            });
        });
    });
});
