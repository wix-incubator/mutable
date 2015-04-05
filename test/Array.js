import Typorama from "../";
import {
    aDataTypeWithSpec
}
from "./testDrivers/index";
import {
    expect
}
from "chai";

describe('Array data', () => {

    var UserType = aDataTypeWithSpec({
        name: Typorama.String.withDefault(''),
        age: Typorama.Number.withDefault(10)
    }, 'User');

    var AddressType = aDataTypeWithSpec({
        address: Typorama.String.withDefault(''),
        code: Typorama.Number.withDefault(10)
    }, 'Address');

    var UserWithAddressType = aDataTypeWithSpec({
        user: UserType,
        address: AddressType
    }, 'UserWithAddress');

    describe('(Mutable) instance', () => {

        it('Should have default length', () => {
            var numberList = new Typorama.Array([1, 2, 3, 4], false, Typorama.Number);
            expect(numberList.length).to.equal(4);
        });

        it('Should be created once for each data instance', () => {
            var numberList = new Typorama.Array([1, 2, 3, 4], false, Typorama.Number);
            var numberListReadOnly = numberList.$asReadOnly();
            var numberListReadOnly2 = numberList.$asReadOnly();

            expect(numberListReadOnly).to.equal(numberListReadOnly2);
        });

        describe('at()', () => {

            it('Should return a number for native immutable Typorama.Number', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                expect(numberList.at(0)).to.equal(1);
            });

            it('Should return a string for native immutable Typorama.String', () => {
                var arr = Typorama.Array.of(Typorama.String).create(['123', 'sdfs']);
                expect(arr.at(0)).to.equal('123');
            })

            it('Should return wrapped item that passes the test() of their type', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                expect(numberList.__options__.subTypes.test(numberList.at(0))).to.be.true;
            });

            it('Should return a typed item for none immutable data (like custom types)', () => {
                var arr = Typorama.Array.of(UserType).create([{
                    name: 'avi',
                    age: 12
                }]);
                expect(arr.at(0) instanceof UserType).to.be.true;
            });

            it('Should always return a the same reference for wrapper', () => {
                var arr = Typorama.Array.of(UserType).create([{
                    name: 'avi',
                    age: 12
                }]);
                expect(arr.at(0)).to.equal(arr.at(0));
            });

            it('Should return a typed item form multiple types if there is _type field', () => {
                var data = [{
                    _type: 'User',
                    name: 'avi',
                    age: 12
                }, {
                    _type: 'Address',
                    name: 'avi',
                    age: 12
                }];
                var arr = Typorama.Array.of([UserType, AddressType]).create(data);
                expect(arr.at(0) instanceof UserType).to.be.true;
                expect(arr.at(1) instanceof AddressType).to.be.true;
            });

            it('Should modify inner complex data', () => {
                var arrComplexType = Typorama.Array.of(UserWithAddressType).create([{}, {}, {}]);

                arrComplexType.at(1).user.name = 'modified user name';

                expect(arrComplexType.at(1).user.name).to.equal('modified user name');
            });

            it('Should handle multi level array', () => {
                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([
                    [{}],
                    [{}],
                    [{}]
                ]);
                expect(arrComplexType.at(0).at(0) instanceof UserWithAddressType).to.be.true;
            });

            it('Should change type form multi level array', () => {
                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([
                    [{}],
                    [{}],
                    [{}]
                ]);
                var userWithAddress = arrComplexType.at(0).at(0);

                userWithAddress.user.name = 'you got a new name';

                expect(userWithAddress.user.name).to.equal('you got a new name');
            });

            it('Should keep read only item as read only', () => {
                var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
                var readOnlyData = new UserWithAddressType().$asReadOnly();
                var arrComplexType = Typorama.Array.of(UserWithAddressType).create([readOnlyData]);

                var readOnlyItemData = arrComplexType.at(0);

                readOnlyItemData.user.name = 'you got a new name';

                expect(readOnlyItemData.user.name).to.equal(userDefaultName);
                expect(readOnlyItemData).to.equal(readOnlyData);
            });

        });
        describe('unshift()', () => {
            // throw 'Slice not implemented yet'
        });
        describe('pop()', () => {
            it('should remove the last element from an array', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                var lengthBeforePop = numberList.length;
                var valueRemoved = numberList.pop();

                expect(numberList.length).to.equal(lengthBeforePop - 1);
                expect(valueRemoved).to.equal(4);
                expect(numberList.$isInvalidated()).to.be.true;
            });

            it('should return undefined if called on an empty array', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([]);
                expect(numberList.pop()).to.be.undefined;

            });
        });

        describe('reverse()', () => {
            it('should reverse the order of elements in an array', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                var newList = numberList.concat();
                newList.reverse();
                expect(numberList.length).to.equal(newList.length);
                for (var i = 0; i < numberList.length; i++) {
                    expect(numberList.at(i)).to.equal(newList.at(newList.length - i - 1));
                };
                expect(newList.$isInvalidated()).to.be.true;
            });
        });

        describe('sort()', () => {
            it('should sort the elements of an anarray in place, and returns the array', () => {
                var stringArray = Typorama.Array.of(Typorama.String).create(['Blue', 'Humpback', 'Beluga']);
                var numberArray = Typorama.Array.of(Typorama.Number).create([40, 1, 5, 200]);

                function compareNumbers(a, b) {
                    return a - b;
                }
                expect(stringArray.sort()).to.eql(['Beluga', 'Blue', 'Humpback']);
                expect(numberArray.sort()).to.eql([1, 200, 40, 5]);
                expect(numberArray.sort(compareNumbers)).to.eql([1, 5, 40, 200]);
                expect(stringArray.$isInvalidated()).to.be.true;
            });
        });
        describe('shift()', () => {
            it('should remove the first element from an array, and returns that element', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                var lengthBeforePop = numberList.length;
                var arrayBeforeShift = numberList.concat();
                var valueRemoved = numberList.shift();

                expect(arrayBeforeShift.at(0)).to.equal(valueRemoved);
                expect(numberList.length).to.equal(lengthBeforePop - 1);
                expect(numberList.$isInvalidated()).to.be.true;
            });
        });

        describe('push()', () => {
            it('should add a number to an array ', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                var lengthBeforePush = numberList.length;
                var newIndex = numberList.push(5);
                expect(newIndex).to.equal(5);
                expect(numberList.length).to.equal(lengthBeforePush + 1);
                expect(numberList.at(4)).to.equal(5);
                expect(numberList.$isInvalidated()).to.be.true;
            });

            it('should add a typed item for none immutable data (like custom types)', () => {
                var arr = Typorama.Array.of(UserType).create([]);
                arr.push({
                    name: 'zag'
                });
                expect(arr.at(0) instanceof UserType).to.be.true;
            });

            it('should add a typed item form multiple types if there is _type field', () => {
                var arr = Typorama.Array.of([UserType, AddressType]).create([]);
                arr.push({
                    _type: 'User'
                });
                arr.push({
                    _type: 'Address'
                });
                expect(arr.at(0) instanceof UserType).to.be.true;
                expect(arr.at(1) instanceof AddressType).to.be.true;
            });
        });

        describe('forEach', () => {
            it('should call the method passed with item, index, arr', () => {
                var sourceArr = [1, 2, 3];
                var numberList = Typorama.Array.of(Typorama.Number).create(sourceArr);
                var count = 0;

                numberList.forEach(function(item, index, arr) {
                    expect(item).to.equal(sourceArr[index]);
                    expect(index).to.equal(count);
                    expect(arr).to.equal(numberList);
                    count++;
                })

            });
        });
        describe('concat()', () => {
            it('should create a new array built from the source array and all arrays passed to it', () => {

                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2]);
                var numberList1 = Typorama.Array.of(Typorama.Number).create([3, 4]);
                var concatRes = numberList.concat(numberList1);

                expect(concatRes.length).to.equal(4);
                for (var i = 0; i < 4; i++) {
                    expect(concatRes.at(i)).to.equal(i + 1);
                }
            });

            it('should fail for arrays containing different, primitive, type elements', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2]);
                var stringList = Typorama.Array.of(Typorama.String).create(['3', '4']);

                expect(function() {
                    numberList.concat(stringList);
                }).to.throw();
            });

            it('should fail for arrays containing different type elements', () => {
                var userList = Typorama.Array.of(UserType).create([{}]);
                var addressList = Typorama.Array.of(AddressType).create([{}]);

                expect(function() {
                    userList.concat(addressList);
                }).to.throw();
            });

            it('should pass when trying to pass an array containing an element with ONE of the subtypes contained within the other array', function() {
                var data = [{
                    _type: 'User',
                    name: 'avi',
                    age: 12
                }, {
                    _type: 'Address',
                    name: 'avi',
                    age: 12
                }];
                var mixedList = Typorama.Array.of([UserType, AddressType]).create(data);
                var addressList = Typorama.Array.of(AddressType).create([{}]);

                debugger;
                var concList = mixedList.concat(addressList);

                expect(concList.length).to.equal(3);

            });


        });

        describe('join()', () => {
            it('should join all the elements of an array into a string', () => {
                var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b']);

                var result = arrA.join();

                expect(result).to.equal("a,b");

            });
        });

        describe('valueOf()', () => {
            it('should return the primitive value of the specified object', () => {
                var arrA = Typorama.Array.of(Typorama.String).create(['a', 'b']);

                var result = arrA.valueOf();
                // debugger;
                expect(result).to.eql(['a', 'b']);
                expect(result instanceof Array).to.be.true;
            });

        });
        describe('map()', () => {
            it('calls a callback function on every item in an array and constructs a new array from the results', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3]);
                var doubles = function(num) {
                    return num * 2;
                };
                debugger;
                var newList = numberList.map(doubles);

                // Take a callback function and return an array
                expect(newList instanceof Typorama.Array).to.be.true;
                // Make sure the values and length are correct
                expect(newList.__value__).to.eql([2, 4, 6]);
                // Array to be invalidated
                expect(numberList.$isInvalidated()).to.be.false;
            });

            it('passes the extra argument when callback is envoked', () => {
                function A() {
                    this.arr = [1, 2, 3];
                    this.factor = 2;
                    this.multi = function(n) {
                        return n * this.factor;
                    };
                }

                var a = new A(),
                    b = new A();
                a.doIt = function() {
                    return this.arr.map(this.multi, this);
                };
                // This cannot run as this.multi actually runs on this.arr
                // b.doIt = function(){
                //   return this.arr.map(this.multi);
                // };

                expect(a.doIt()).to.eql([2, 4, 6]);
                // expect(b.doIt()).to.eql([NaN, NaN, NaN]);
            });
        });
        describe('splice()', () => {

            it('changes the content of an array by removing existing elements and/or adding new elements', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
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
                expect(numberList.$isInvalidated()).to.be.true;
            });

            it('Should wrap items for none immutable data (like custom types)', () => {
                var arr = Typorama.Array.of(UserType).create([{
                    name: 'aag'
                }, {
                    name: 'dag'
                }]);
                arr.splice(0, 1, {
                    name: 'zag'
                });
                expect(arr.at(1) instanceof UserType).to.be.true;
                expect(arr.at(0).name).to.equal('zag');
                expect(arr.at(1).name).to.equal('dag');
            });
        });

        describe('every()', () => {
            it('should return true if all elements pass the test provided by the callback', () => {

                var arr = Typorama.Array.of(Typorama.String).create(['a', 'a']);
                var areAll = arr.every(function(element) {
                    return element === 'a';
                });
                expect(areAll).to.be.true;
            });
            it('should return false if at least one element in the array returns false from the callback', () => {
                var arr = Typorama.Array.of(Typorama.String).create(['a', 'b']);
                var areAll = arr.every(function(element) {
                    return element === 'a';
                });
                expect(areAll).to.equal(false);
            })
        });

        describe('some()', () => {
            it('should return true if any elements pass the test provided by the callback', () => {
                var arr = Typorama.Array.of(Typorama.String).create(['a', 'b']);
                var areAll = arr.some(function(element) {
                    return element === 'a';
                });
                expect(areAll).to.be.true;
            });
            it('should return false if all elements fail to pass the test provided by the callback', () => {
                var arr = Typorama.Array.of(Typorama.String).create(['b', 'b']);
                var areAll = arr.some(function(element) {
                    return element === 'a';
                });
                expect(areAll).to.equal(false);
            })
        });

        describe('find', () => {
            it('should return the first element that passes the callback test', () => {
                var arr = Typorama.Array.of(UserType).create([{
                    name: 'lando'
                }, {
                    name: 'mollari'
                }]);
                var itemFound = arr.find(function(element) {
                    return element.name === 'mollari'
                });
                expect(itemFound).to.equal(arr.at(1));
            });
            xit('should return the first element that matches the passed object', () => {
                var arr = Typorama.Array.of(UserType).create([{
                    name: 'lando'
                }, {
                    name: 'mollari'
                }]);
                var itemFound = arr.find({
                    name: 'mollari'
                });
                expect(itemFound).to.equal(arr.at(1));
            });
            it('should return undefined if no elements that pass the callback test', () => {
                var arr = Typorama.Array.of(UserType).create([{
                    name: 'lando'
                }, {
                    name: 'mollari'
                }]);
                var itemFound = arr.find(function(element) {
                    return element.name === "G'Kar"
                });
                expect(itemFound).to.equal(undefined);
            })

        });

        describe('findIndex', () => {
            it('should return the index of the first element that passes the callback test', () => {
                var arr = Typorama.Array.of(UserType).create([{
                    name: 'lando'
                }, {
                    name: 'mollari'
                }]);
                var itemIndex = arr.findIndex(function(element) {
                    return element.name === 'mollari'
                });
                expect(itemIndex).to.equal(1);
            });
            xit('should return the index of the first element that matches the passed object', () => {
                var arr = Typorama.Array.of(UserType).create([{
                    name: 'lando'
                }, {
                    name: 'mollari'
                }]);
                var itemIndex = arr.findIndex({
                    name: 'mollari'
                });
                expect(itemIndex).to.equal(1);
            });
            it('should return -1 if no elements pass the callback test', () => {
                var arr = Typorama.Array.of(UserType).create([{
                    name: 'lando'
                }, {
                    name: 'mollari'
                }]);
                var itemIndex = arr.findIndex(function(element) {
                    return element.name === "G'Kar"
                });
                expect(itemIndex).to.equal(-1);
            })

        });

        describe('filter()', () => {
            it('should return a new array with all elements that pass the callback test', () => {
                var arr = Typorama.Array.of(Typorama.Number).create([42, 3, 15, 4, 7]);
                var filterArray = arr.filter(function(element) {
                    return element > 5;
                });
                expect(filterArray.length).to.equal(3);
                expect(filterArray.valueOf()).to.eql([42, 15, 7]);
            });
            it('should return an empty array if no elements pass the callback test', () => {
                var arr = Typorama.Array.of(Typorama.Numbers).create([42, 3, 15, 4, 7]);
                var filterArray = arr.filter(function(element) {
                    return element > 50;
                });
                expect(filterArray.length).to.equal(0);
            });
        });

        describe('as field on data object', () => {

            var GroupType = Typorama.define('GroupType', {
                spec: function(GroupType) {
                    return {
                        title: Typorama.String,
                        users: Typorama.Array.of(UserType)
                    };
                }
            });

            it('Should be modified from json ', () => {
                var groupData = new GroupType();

                groupData.users = [{
                    'name': 'tom',
                    'age': 25
                }, {
                    'name': 'omri',
                    'age': 35
                }];

                expect(groupData.users.at(0).name).to.equal('tom');
                expect(groupData.users.at(0).age).to.equal(25);
                expect(groupData.users.at(1).name).to.equal('omri');
                expect(groupData.users.at(1).age).to.equal(35);
            });
        });

    });

    describe('(Read Only) instance', () => {

        it('Should have default length', () => {
            var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
            expect(numberList.length).to.equal(4);
        });

        describe('at()', () => {

            it('Should return a number for native immutable Typorama.Number', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
                expect(numberList.at(0)).to.equal(1);
            });

            it('Should return a string for native immutable Typorama.String', () => {
                var arr = Typorama.Array.of(Typorama.String).create(['123', 'sdfs']).$asReadOnly();
                expect(arr.at(0)).to.equal('123');
            });

            it('Should return wrapped item that passes the test() of their type', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
                expect(numberList.__options__.subTypes.test(numberList.at(0))).to.be.true;
            });

            it('Should return a typed item for none immutable data (like custom types)', () => {
                var arr = Typorama.Array.of(UserType).create([{
                    name: 'avi',
                    age: 12
                }]).$asReadOnly();
                expect(arr.at(0) instanceof UserType).to.be.true;
            });

            it('Should return a typed item form multiple types if there is _type field', () => {
                var data = [{
                    _type: 'User',
                    name: 'avi',
                    age: 12
                }, {
                    _type: 'Address',
                    name: 'avi',
                    age: 12
                }];
                var arr = Typorama.Array.of([UserType, AddressType]).create(data).$asReadOnly();
                expect(arr.at(0) instanceof UserType).to.be.true;
                expect(arr.at(1) instanceof AddressType).to.be.true;
            });

            it('Should not modify inner complex data', () => {
                var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
                var arrComplexType = Typorama.Array.of(UserWithAddressType).create([{}, {}, {}]).$asReadOnly();

                arrComplexType.at(1).user.name = 'modified user name';

                expect(arrComplexType.at(1).user.name).to.equal(userDefaultName);
            });

            it('Should handle multi level array', () => {
                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([
                    [{}],
                    [{}],
                    [{}]
                ], true);
                expect(arrComplexType.at(0).at(0) instanceof UserWithAddressType).to.be.true;
            });

            it('Should not change type from multi level array', () => {
                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([
                    [{}],
                    [{}],
                    [{}]
                ], true);
                var userWithAddress = arrComplexType.at(0).at(0);

                userWithAddress.user.name = 'you got a new name';

                expect(userWithAddress.user.name).to.equal('');
            });

        });

        describe('push()', () => {
            it('should not modify an array ', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
                var lengthBeforePush = numberList.length;
                var newIndex = numberList.push(5);
                expect(newIndex).to.equal(null);
                expect(numberList.length).to.equal(lengthBeforePush);
                expect(numberList.at(4)).to.equal(undefined);
            })
        });
        describe('splice()', () => {
            it('should not modify an array ', () => {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
                var lengthBeforeSplice = numberList.length;
                var removedItems = numberList.splice(1, 2, 7, 6, 5);
                expect(removedItems).to.equal(null);
                expect(numberList.length).to.equal(lengthBeforeSplice);
                expect(numberList.at(0)).to.equal(1);
                expect(numberList.at(1)).to.equal(2);
                expect(numberList.at(2)).to.equal(3);
                expect(numberList.at(3)).to.equal(4);

            })
        });

        describe('Type Invalidation', () => {
            describe('$isInvalidated()', () => {
                it('Should return false for unmodified data', () => {
                    var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                    expect(numberList.$isInvalidated()).to.equal(false);
                });
                xit('Should return true for modified data', () => {
                    var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                    numberList.push(5);
                    expect(numberList.$isInvalidated()).to.be.true;
                });
                it('Should return true for data when a child value has changed', () => {
                    var arr = Typorama.Array.of(UserType).create([{
                        name: 'avi',
                        age: 12
                    }]);
                    arr.at(0).name = "gaga";
                    expect(arr.$isInvalidated()).to.be.true;
                });
                xit('Should return true for data when a child value has changed after isinvalidates was already called', () => {
                    var arr = Typorama.Array.of(UserType).create([{
                        name: 'avi',
                        age: 12
                    }]);
                    expect(arr.$isInvalidated()).to.equal(false);
                    arr.at(0).name = "gaga";
                    expect(arr.$isInvalidated()).to.be.true;
                });
                it('Should return false for data when only a parent/sibling value has changed', () => {
                    var arr = Typorama.Array.of(UserType).create([{
                        name: 'avi',
                        age: 12
                    }, {
                        name: 'shlomo',
                        age: 15
                    }]);

                    arr.at(0).name = "gaga";
                    expect(arr.at(0).$isInvalidated()).to.be.true;
                    expect(arr.at(1).$isInvalidated()).to.equal(false);
                    expect(arr.$isInvalidated()).to.be.true;
                });
            });

            describe('$revalidate()', () => {
                xit('Should reset data invalidation', () => {
                    var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                    numberList.push(5);
                    expect(numberList.$isInvalidated()).to.be.true;
                    numberList.$revalidate();
                    expect(numberList.$isInvalidated()).to.equal(false);

                });
                it('Should reset deep data invalidation', () => {
                    var arr = Typorama.Array.of(UserType).create([{
                        name: 'avi',
                        age: 12
                    }]);
                    arr.at(0).name = "gaga";
                    expect(arr.$isInvalidated()).to.be.true;
                    expect(arr.at(0).$isInvalidated()).to.be.true;
                    arr.$revalidate();
                    expect(arr.$isInvalidated()).to.equal(false);
                    expect(arr.at(0).$isInvalidated()).to.equal(false);
                });

            });

            describe('$resetValidationCheck()', () => {
                it('it Should allow isInvalidated to return true for data when a child value has changed after isinvalidates was already called', () => {
                    var arr = Typorama.Array.of(UserType).create([{
                        name: 'avi',
                        age: 12
                    }]);
                    expect(arr.$isInvalidated()).to.equal(false);
                    expect(arr.at(0).$isInvalidated()).to.equal(false);
                    arr.at(0).name = "gaga";
                    expect(arr.$isInvalidated()).to.equal(false);
                    arr.$resetValidationCheck();
                    expect(arr.$isInvalidated()).to.be.true;
                    expect(arr.at(0).$isInvalidated()).to.be.true;
                });

            });
        });

    });

});
