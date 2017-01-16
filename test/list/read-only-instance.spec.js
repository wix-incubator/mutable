import {expect} from 'chai';

import * as mu from '../../src';
import * as b from './builders';

const builders = b.asReadOnly();

describe('List', function() {
    describe('read-only instance', function() {

        it('Should have default length', function() {
            var numberList = builders.aNumberList([1, 2, 3]);
            expect(numberList.length).to.equal(3);
        });

        it('Should keep the source instance not readOnly', function() {
            // this is because the readonly instance used to have a bug in which it changed the original item value while wrapping it
            var numberList = builders.aNumberList();

            numberList.setValue([5, 6]);

            expect(numberList.toJSON()).to.eql([5, 6]);
        });

        it('Should be created once for each data instance', function() {
            var numberList = builders.aNumberList().$asReadWrite();

            expect(numberList.$asReadOnly()).to.equal(numberList.$asReadOnly());
        });

        describe('__value__', function() {
            it('should be synced with the readonly', function() {
                var readOnly = builders.aUserList();
                var arr = readOnly.$asReadWrite();

                arr.setValue([builders.UserType.defaults()]);

                expect(arr.__value__).to.equal(readOnly.__value__);
            });
        });
        describe('should not be modified by', function() {
            it('push', function() {
                var numberList = builders.aNumberList();
                var lengthBeforePush = numberList.length;

                var newIndex = numberList.push(3);

                expect(newIndex).to.be.null;
                expect(numberList.length).to.equal(lengthBeforePush);
                expect(numberList.at(lengthBeforePush)).to.equal(undefined);
            });
            it('pop', function() {
                var numberList = builders.aNumberList([5]);
                var lengthBeforePop = numberList.length;

                var item = numberList.pop();

                expect(item).to.be.null;
                expect(numberList.length).to.equal(lengthBeforePop);
                expect(numberList.at(0)).to.equal(5);
            });
            it('unshift', function() {
                var numberList = builders.aNumberList();
                var lengthBeforeUnshift = numberList.length;

                var newLength = numberList.unshift(953);

                expect(newLength).to.be.null;
                expect(numberList.length).to.equal(lengthBeforeUnshift);
                expect(numberList.at(0)).to.equal(builders.aNumberList().at(0));
            });
            it('shift', function() {
                var numberList = builders.aNumberList([5]);
                var lengthBeforePop = numberList.length;

                var item = numberList.pop();

                expect(item).to.be.null;
                expect(numberList.length).to.equal(lengthBeforePop);
                expect(numberList.at(0)).to.equal(5);
            });

            it('set', function() {
                var numberList = builders.aNumberList([5]);
                var result = numberList.set(0, 3);
                expect(result).to.be.null;
                expect(numberList.at(0)).to.equal(5);
            });

            it('reverse', function() {
                var numberList = builders.aNumberList();
                numberList.reverse();

                for (var i = 0; i < numberList.length; i++) {
                    expect(numberList.at(i)).to.equal(builders.aNumberList().at(i));
                }
            });

            it('sort', function() {
                var numberList = builders.aNumberList([40, 1, 5, 200]);
                numberList.sort();
                expect(numberList.toJSON()).to.eql([40, 1, 5, 200]);
            });

            it('splice', function() {
                var numberList = builders.aNumberList();
                var lengthBeforeSplice = numberList.length;

                var removedItems = numberList.splice(0, 1, 17);

                expect(removedItems).to.be.null;
                expect(numberList.length).to.equal(lengthBeforeSplice);
                expect(numberList.at(0)).to.equal(1);
                expect(numberList.at(1)).to.equal(2);
            });

            it('slice', function() {
                var numberList = builders.aNumberList([1, 2, 3, 4, 5]);
                var lengthBeforeSlice = numberList.length;

                var slicedList = numberList.slice(3);
                var emptySlice = numberList.slice(0, 0);

                expect(numberList.length).to.equal(lengthBeforeSlice);
                expect(slicedList.at(0)).to.equal(4);
                expect(slicedList.at(1)).to.equal(5);
                expect(emptySlice.length).to.equal(0);
            })
        });
    });
});
