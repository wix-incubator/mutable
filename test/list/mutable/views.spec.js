import {expect} from 'chai';
import * as mu from '../../../src';
import * as builders from '../builders';

function testViewFunctionality(builders, isReadonly) {

    describe('join', function() {
        it('should join all the elements of a List into a string with default separator', function() {
            expect(builders.aStringList(['a', 'b']).join()).to.equal("a,b");
        });

        it('should join all the elements of a List into a string with custom separator', function() {
            expect(builders.aStringList(['a', 'b']).join('|')).to.equal("a|b");
        });
    });

    describe('slice', function() {
        it('creates a slice of List from start up to the end of the List. ', function() {
            var numberList = builders.aNumberList([1, 2, 3]);

            var slicedList = numberList.slice(1, 3);

            expect(slicedList.at(0)).to.eql(numberList.at(1));
        });
        it('should start from 0 if begin is omitted', function() {
            var numberList = builders.aNumberList();

            var slicedList = numberList.slice();

            expect(slicedList).to.eql(numberList.$asReadWrite());
        });
        it('should offset from the end, if passed a negative BEGIN value', function() {
            var numberList = builders.aNumberList([1, 2, 3]);

            var slicedList = numberList.slice(-(numberList.length - 1));

            expect(slicedList.toJSON()).to.eql([2, 3]);
        });
        it('should offset from the end, if passed a negative END value', function() {
            var numberList = builders.aNumberList([1, 2, 3]);

            var slicedList = numberList.slice(0, -1);

            expect(slicedList.toJSON()).to.eql([1, 2]);
        });
        it('should return mutable List', function() {
            var numberList = builders.aNumberList([1, 2, 3]);

            var slicedList = numberList.slice();

            expect(slicedList.$isReadOnly()).to.be.false;
        });
        if (isReadonly) {
            it('should return list with read only elements', function() {
                var arr = builders.aUserList();

                var slicedList = arr.slice();

                expect(slicedList.at(0).$isReadOnly()).to.be.true;
            });
        }
    });


    describe('concat', function() {
        it('should not alter the original List', function() {
            var numberList = builders.aNumberList();
            var oldList = numberList.concat();

            numberList.concat(1, 1);

            expect(numberList.$asReadWrite()).to.eql(oldList);
        });

        it('should return a mutable List', function() {
            var numberList = builders.aNumberList();

            var concattedList = numberList.concat(1, 1);

            expect(concattedList).to.be.instanceOf(mu.List);
            expect(concattedList.$isReadOnly()).to.be.false;

        });
        if (isReadonly) {
            it('should return list with read only elements', function() {
                var arr = builders.aUserList();

                var concattedList = arr.concat({});

                expect(concattedList.at(0).$isReadOnly()).to.be.true;
            });
        }
        it('should be able to concat N Lists of the same type', function() {
            var concatResult = builders.aNumberList([1, 2]).concat(builders.aNumberList([3, 4]), [5, 6]);

            expect(concatResult.length).to.equal(6, 'Length check');
            expect(concatResult.toJS()).to.eql([1, 2, 3, 4, 5, 6], 'Equality test'); //TODO: create matcher.
        });

        it('should be able to concat N Lists of the different types', function() {
            var mixedList = builders.aNumberStringList([1, '2']);

            var concatResult = mixedList.concat(builders.aStringList(['3', '4']), [5, 6]);

            expect(concatResult.length).to.equal(6, 'Length check');
            expect(concatResult.toJS()).to.eql([1, '2', '3', '4', 5, 6], 'Equality test'); //TODO: create matcher.
        });

        it('should allow subtypes allowed by all the different Lists', function() {
            var mixedInstance = builders.aUserOrAddressList([
                { _type: builders.UserType.id },
                { _type: builders.AddressType.id },
                {}
            ]);
            var userList = builders.aUserList([{}]);
            var mixedList = [{ _type: builders.UserType.id }, { _type: builders.AddressType.id }];

            var concatResult = mixedInstance.concat(userList, mixedList);

            expect(concatResult.length).to.equal(6);
            expect(concatResult.at(0)).to.be.instanceOf(builders.UserType);
            expect(concatResult.at(1)).to.be.instanceOf(builders.AddressType);
            expect(concatResult.at(2)).to.be.instanceOf(builders.UserType);
            expect(concatResult.at(3)).to.be.instanceOf(builders.UserType);
            expect(concatResult.at(4)).to.be.instanceOf(builders.UserType);
            expect(concatResult.at(5)).to.be.instanceOf(builders.AddressType);
        });
    });


    describe('toString', function() {
        it('should take a List, and return a string', function() {
            expect(builders.aStringList(['a', 'b']).toString()).to.eql("a,b");
        });
    });

    describe('toJSON', function() {
        it('should take a mutable List of primitives, and return a native js List of primitives', function() {
            var arrA = builders.aStringList(['a', 'b']);

            expect(arrA.toJSON(), 'toJSON() called').to.eql(['a', 'b']);
            expect(arrA.toJSON(false), 'toJSON (non-recursive) called').to.eql(['a', 'b']);
        });
        it('should take a mutable List of custom types, and return a native js List of objects', function() {
            const list = builders.aUserList([{ age: 11 }, { age: 12 }]);

            expect(list.toJSON(), 'toJSON() called').to.eql([{ age: 11, name: new builders.UserType().name }, {
                age: 12,
                name: new builders.UserType().name
            }]);

            expect(list.toJSON(false), 'toJSON (non-recursive) called').to.eql([list.at(0), list.at(1)]);

            expect(list.toJSON(true, true), 'toJSON (with types) called').to.eql([
                new builders.UserType({ age: 11 }).toJSON(true, true),
                new builders.UserType({ age: 12 }).toJSON(true, true)
            ]);
        });
    });
    describe('toJS', function(){

        it('should call toJS on items that implement it', function(){
            const serializableType = builders.UserType;
            const List = mu.List.of([serializableType, mu.Function]);

            const funcItem = () => {};
            const serializableItem = new serializableType();
            serializableItem.toJS = () => 'called';
            const input = [serializableItem, funcItem];

            const list = new List(input);
            const res = list.toJS();

            expect(res[0]).to.eql('called');
            expect(res[1]).to.equal(funcItem);
        });

    });
    describe('valueOf', function() {
        it('should return the primitive value of the specified object', function() {
            var wrapped = ['a', 'b'];
            expect(builders.aStringList(wrapped).valueOf()).to.eql(wrapped).and.to.be.instanceOf(Array);
        });

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
