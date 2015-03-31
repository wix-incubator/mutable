import Typorama from '../src';
import {aDataTypeWithSpec} from '../test-kit/testDrivers/index';
import {expect} from 'chai';

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

describe('Array data', function() {
    describe('(Mutable) instance', function() {

        it('Should have default length', function() {
            var numberList = new Typorama.Array([1, 2, 3, 4], false, {subTypes: Typorama.Number});
            expect(numberList.length).to.equal(4);
        });

        it('Should be created once for each data instance', function() {
            var numberList = new Typorama.Array([1, 2, 3, 4], false, {subTypes: Typorama.Number});
            var numberListReadOnly = numberList.$asReadOnly();
            var numberListReadOnly2 = numberList.$asReadOnly();

            expect(numberListReadOnly).to.equal(numberListReadOnly2);
        });

        describe('setValue()', function() {

            it('should replace the value of the array', function() {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);

                numberList.setValue([5, 6, 7, 8]);

                expect(numberList.toJSON()).to.eql([5, 6, 7, 8]);
            });

        });

        describe('at()', function() {

            it('Should return a number for native immutable Typorama.Number', function() {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                expect(numberList.at(0)).to.equal(1);
            });

            it('Should return a string for native immutable Typorama.String', function() {
                var arr = Typorama.Array.of(Typorama.String).create(['123', 'abcd']);
                expect(arr.at(0)).to.equal('123');
            });

            it('Should return wrapped item that passes the test() of their type', function() {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                expect(numberList.__options__.subTypes.test(numberList.at(0))).to.equal(true);
            });

            it('Should return a typed item for none immutable data (like custom types)', function() {
                var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12}]);
                expect(arr.at(0) instanceof UserType).to.equal(true);
            });

            it('Should always return a the same reference for wrapper', function() {
                var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12}]);
                expect(arr.at(0)).to.equal(arr.at(0));
            });

            it('Should return a typed item form multiple types if there is _type field', function() {
                var data = [
                    {_type:'User',  name: 'avi', age: 12},
                    {_type:'Address', name: 'avi', age: 12}
                ];
                var arr = Typorama.Array.of([UserType,  AddressType]).create(data);
                expect(arr.at(0) instanceof UserType).to.equal(true, 'first item');
                expect(arr.at(1) instanceof AddressType).to.equal(true, 'second item');
            });

            it('Should modify inner complex data', function() {
                var arrComplexType = Typorama.Array.of(UserWithAddressType).create([{}, {}, {}]);

                arrComplexType.at(1).user.name = 'modified user name';

                expect(arrComplexType.at(1).user.name).to.equal('modified user name');
            });

            it('Should handle multi level array', function() {
                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]]);

                expect(arrComplexType.at(0).at(0) instanceof UserWithAddressType).to.equal(true);
            });

            it('Should change type form multi level array', function() {
                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]]);
                var userWithAddress = arrComplexType.at(0).at(0);

                userWithAddress.user.name = 'you got a new name';

                expect(userWithAddress.user.name).to.equal('you got a new name');
            });

            it('Should keep read only item as read only', function() {
                var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
                var readOnlyData = new UserWithAddressType().$asReadOnly();
                var arrComplexType = Typorama.Array.of(UserWithAddressType).create([readOnlyData]);

                var readOnlyItemData = arrComplexType.at(0);

                readOnlyItemData.user.name = 'you got a new name';

                expect(readOnlyItemData.user.name).to.equal(userDefaultName);
                expect(readOnlyItemData).to.equal(readOnlyData);
            });

        });

        describe('push()',function() {
            it('it should add a number to an array ', function() {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                var lengthBeforePush = numberList.length;
                var newIndex = numberList.push(5);
                expect(newIndex).to.equal(5);
                expect(numberList.length).to.equal(lengthBeforePush+1);
                expect(numberList.at(4)).to.equal(5);
                expect(numberList.$isInvalidated()).to.equal(true);
            });

            it('Should add a typed item for none immutable data (like custom types)', function() {
                var arr = Typorama.Array.of(UserType).create([]);
                arr.push({name: 'zag'});
                expect(arr.at(0) instanceof UserType).to.equal(true);
            });

            it('Should add a typed item form multiple types if there is _type field', function() {
                var arr = Typorama.Array.of([UserType, AddressType]).create([]);
                arr.push({_type: 'User'});
                arr.push({_type: 'Address'});
                expect(arr.at(0) instanceof UserType).to.equal(true);
                expect(arr.at(1) instanceof AddressType).to.equal(true);
            });

            it('Should support multiple push items', function() {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                numberList.push(5, 6);

                expect(numberList.length).to.equal(6);
                expect(numberList.at(4)).to.equal(5);
                expect(numberList.at(5)).to.equal(6);
            })
        });

        describe('forEach()',function() {
            it('should call the method passed with item, index, arr', function() {
                var sourceArr = [1,2,3];
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

        describe('concat()',function() { // ToDo: make them work
            it('should be able to concat N arrays of the same type', function() {
                var firstNumberList = Typorama.Array.of(Typorama.Number).create([1, 2]);
                var secondNumberList = Typorama.Array.of(Typorama.Number).create([3, 4]);
                var thirdNumberList = [5,6];
                var concatResult = firstNumberList.concat(secondNumberList, thirdNumberList);

                expect(concatResult.length).to.equal(6, 'Length check');
                expect(concatResult.__value__).to.eql([1, 2, 3, 4, 5, 6], 'Equality test'); //TODO: create matcher.
            });

            it('should be able to concat N arrays of the different types', function() {
                var mixedArray = Typorama.Array.of([Typorama.Number, Typorama.String]).create([1, '2']);
                var strings = Typorama.Array.of(Typorama.String).create(['3', '4']);
                var numbers = [5, 6];
                var concatResult = mixedArray.concat(strings, numbers);
                expect(concatResult.length).to.equal(6, 'Length check');
                expect(concatResult.__value__).to.eql([1, '2', '3', '4', 5, 6], 'Equality test'); //TODO: create matcher.
            });

            it('should allow subtypes allowed by all the different arrays',function() {
                var mixedInstance = Typorama.Array.of([UserType, AddressType]).create([
                    { _type: UserType.displayName },
                    { _type: AddressType.displayName },
                    {}
                ]);
                var addressList = Typorama.Array.of(AddressType).create([{}]);
                var mixedList = [{_type: UserType.displayName}, {_type: AddressType.displayName}];
                var concatResult = mixedInstance.concat(addressList, mixedList);

                expect(concatResult.length).to.equal(6);
                expect(concatResult.at(0) instanceof UserType    ).to.equal(true, 'Type test expected:UserType');
                expect(concatResult.at(1) instanceof AddressType ).to.equal(true, 'Type test expected:AddressType');
                expect(concatResult.at(2) instanceof UserType    ).to.equal(true, 'Type test expected:UserType');
                expect(concatResult.at(3) instanceof AddressType ).to.equal(true, 'Type test expected:AddressType');
                expect(concatResult.at(4) instanceof UserType    ).to.equal(true, 'Type test expected:UserType');
                expect(concatResult.at(5) instanceof AddressType ).to.equal(true, 'Type test expected:AddressType');

            });
        });

        describe('splice()',function() {
            it('changes the content of an array by removing existing elements and/or adding new elements', function() {
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
                expect(numberList.$isInvalidated()).to.equal(true);
            });

            it('Should wrap items for none immutable data (like custom types)', function() {
                var arr = Typorama.Array.of(UserType).create([{name: 'aag'}, {name: 'dag'}]);
                arr.splice(0, 1, {name: 'zag'});
                expect(arr.at(1) instanceof UserType).to.equal(true);
                expect(arr.at(0).name).to.equal('zag');
                expect(arr.at(1).name).to.equal('dag');
            });
        });

        describe('every',function() {
            it('should return true if all elements pass the test provided by the callback', function() {
                var arr = Typorama.Array.of(Typorama.String).create(['a', 'a']);
                var areAll = arr.every(function (element) {
                    return element === 'a';
                });
                expect(areAll).to.equal(true);
            });
            it('should return false if at least one element in the array returns false from the callback', function() {
                var arr = Typorama.Array.of(Typorama.String).create(['a', 'b']);
                var areAll = arr.every(function (element) {
                    return element === 'a';
                });
                expect(areAll).to.equal(false);
            })
        });

        describe('some', function() {
            it('should return true if any elements pass the test provided by the callback', function() {
                var arr = Typorama.Array.of(Typorama.String).create(['a', 'b']);
                var areAll = arr.some(function (element) {
                    return element === 'a';
                });
                expect(areAll).to.equal(true);
            });
            it('should return false if all elements fail to pass the test provided by the callback', function() {
                var arr = Typorama.Array.of(Typorama.String).create(['b', 'b']);
                var areAll = arr.some(function (element) {
                    return element === 'a';
                });
                expect(areAll).to.equal(false);
            })
        });

        describe('find',function() {
            it('should return the first element that passes the callback test', function() {
                var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
                var itemFound = arr.find(function(element) {
                    return element.name === 'mollari'
                });
                expect(itemFound).to.equal(arr.at(1));
            });
            xit('should return the first element that matches the passed object', function() {
                var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
                var itemFound = arr.find({name: 'mollari'});
                expect(itemFound).to.equal(arr.at(1));
            });
            it('should return undefined if no elements that pass the callback test', function() {
                var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
                var itemFound = arr.find((element) => element.name === `G'Kar`);
                expect(itemFound).to.equal(undefined);
            })

        });

        describe('findIndex',function() {
            it('should return the index of the first element that passes the callback test', function() {
                var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
                var itemIndex = arr.findIndex(function(element) {
                    return element.name === 'mollari'
                });
                expect(itemIndex).to.equal(1);
            });
            xit('should return the index of the first element that matches the passed object', function() {
                var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
                var itemIndex = arr.findIndex({name: 'mollari'});
                expect(itemIndex).to.equal(1);
            });
            it('should return -1 if no elements pass the callback test', function() {
                var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
                var itemIndex = arr.findIndex((element) => `G'Kar` === element.name);
                expect(itemIndex).to.equal(-1);
            })

        });

        describe('filter',function() {
            xit('should return a new array with all elements that pass the callback test', function() {
                var arr = Typorama.Array.of(Typorama.Number).create([42, 3, 15, 4, 7]);
                var filterArray = arr.filter(function(element) {
                    return element > 5;
                });
                expect(filterArray.length).to.equal(3);
                expect(filterArray.valueOf()).to.equal([42, 15, 7]);
            });
            it('should return an empty array if no elements pass the callback test', function() {
                var arr = Typorama.Array.of(Typorama.Numbers).create([42, 3, 15, 4, 7]);
                var filterArray = arr.filter(function(element) {
                    return element > 50;
                });
                expect(filterArray.length).to.equal(0);
            });
        });


        describe('as field on data object', function() {

            var GroupType = Typorama.define('GroupType', {
                spec: function(GroupType) {
                    return {
                        title: Typorama.String,
                        users: Typorama.Array.of(UserType)
                    };
                }
            });

            it('Should be modified from json ', function() {
                var groupData = new GroupType();

                groupData.users = [
                    {'name':'tom', 'age':25},
                    {'name':'omri', 'age':35}
                ];

                expect(groupData.users.at(0).name).to.equal('tom');
                expect(groupData.users.at(0).age).to.equal(25);
                expect(groupData.users.at(1).name).to.equal('omri');
                expect(groupData.users.at(1).age).to.equal(35);
            });
        });

    });

    describe('(Read Only) instance', function() {

        it('Should have default length', function() {
            var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
            expect(numberList.length).to.equal(4);
        });

        it('Should keep the source instance not readOnly', function() {
            // this is beacause the readonly instance used to have a bug in which it changed the original item value while wrapping it
            var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);

            numberList.$asReadOnly();
            numberList.setValue([5,6]);

            expect(numberList.toJSON()).to.eql([5,6]);
        });

        describe('at()', function() {

            it('Should return a number for native immutable Typorama.Number', function() {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
                expect(numberList.at(0)).to.equal(1);
            });

            it('Should return a string for native immutable Typorama.String', function() {
                var arr = Typorama.Array.of(Typorama.String).create(['123', 'abcd']).$asReadOnly();
                expect(arr.at(0)).to.equal('123');
            });

            it('Should return wrapped item that passes the test() of their type', function() {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
                expect(numberList.__options__.subTypes.test(numberList.at(0))).to.equal(true);
            });

            it('Should return a typed item for none immutable data (like custom types)', function() {
                var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12}]).$asReadOnly();
                expect(arr.at(0) instanceof UserType).to.equal(true);
            });

            it('Should return a typed item form multiple types if there is _type field', function() {
                var data = [
                    {_type:'User',  name: 'avi', age: 12},
                    {_type:'Address', name: 'avi', age: 12}
                ];
                var arr = Typorama.Array.of([UserType, AddressType]).create(data).$asReadOnly();
                expect(arr.at(0) instanceof UserType).to.equal(true);
                expect(arr.at(1) instanceof AddressType).to.equal(true);
            });

            it('Should not modify inner complex data', function() {
                var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
                var arrComplexType = Typorama.Array.of(UserWithAddressType).create([{}, {}, {}]).$asReadOnly();

                arrComplexType.at(1).user.name = 'modified user name';

                expect(arrComplexType.at(1).user.name).to.equal(userDefaultName);
            });

            it('Should handle multi level array', function() {
                //var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]], true);
                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]]);

                var arrComplexTypeReadOnly = arrComplexType.$asReadOnly();

                expect(arrComplexTypeReadOnly.at(0).at(0) instanceof UserWithAddressType).to.equal(true);
            });

            it('Should not change type from multi level array', function() {
                //var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]], true);
                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]]).$asReadOnly();
                var userWithAddress = arrComplexType.at(0).at(0);

                userWithAddress.user.name = 'you got a new name';

                expect(userWithAddress.user.name).to.equal('');
            });

        });

        describe('push()',function() {
            it('should not modify an array ', function() {
                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
                var lengthBeforePush = numberList.length;
                var newIndex = numberList.push(5);
                expect(newIndex).to.equal(null);
                expect(numberList.length).to.equal(lengthBeforePush);
                expect(numberList.at(4)).to.equal(undefined);

            })
        });

        describe('splice()',function() {
            it('should not modify an array ', function() {
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

        describe('Type Invalidation',function() {
            describe('$isInvalidated()',function() {
                it('Should return false for unmodified data', function() {
                    var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                    expect(numberList.$isInvalidated()).to.equal(false);
                });
                xit('Should return true for modified data', function() {
                    var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                    numberList.push(5);
                    expect(numberList.$isInvalidated()).to.equal(true);
                });
                it('Should return true for data when a child value has changed', function() {
                    var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12}]);
                    arr.at(0).name = 'gaga';
                    expect(arr.$isInvalidated()).to.equal(true);
                });
                xit('Should return true for data when a child value has changed after isinvalidates was already called', function() {
                    var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12}]);
                    expect(arr.$isInvalidated()).to.equal(false);
                    arr.at(0).name = 'gaga';
                    expect(arr.$isInvalidated()).to.equal(true);
                });
                it('Should return false for data when only a parent/sibling value has changed', function() {
                    var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12},{name: 'shlomo', age: 15}]);

                    arr.at(0).name = 'gaga';
                    expect(arr.at(0).$isInvalidated()).to.equal(true);
                    expect(arr.at(1).$isInvalidated()).to.equal(false);
                    expect(arr.$isInvalidated()).to.equal(true);
                });
            });

            describe('$revalidate()',function() {
                xit('Should reset data invalidation', function() {
                    var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
                    numberList.push(5);
                    expect(numberList.$isInvalidated()).to.equal(true);
                    numberList.$revalidate();
                    expect(numberList.$isInvalidated()).to.equal(false);

                });
                it('Should reset deep data invalidation', function() {
                    var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12}]);
                    arr.at(0).name = 'gaga';
                    expect(arr.$isInvalidated()).to.equal(true);
                    expect(arr.at(0).$isInvalidated()).to.equal(true);
                    arr.$revalidate();
                    expect(arr.$isInvalidated()).to.equal(false);
                    expect(arr.at(0).$isInvalidated()).to.equal(false);
                });

            });

            describe('$resetValidationCheck()',function() {
                it('it Should allow isInvalidated to return true for data when a child value has changed after isinvalidates was already called', function() {
                    var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12}]);
                    expect(arr.$isInvalidated()).to.equal(false);
                    expect(arr.at(0).$isInvalidated()).to.equal(false);
                    arr.at(0).name = 'gaga';
                    expect(arr.$isInvalidated()).to.equal(false);
                    arr.$resetValidationCheck();
                    expect(arr.$isInvalidated()).to.equal(true);
                    expect(arr.at(0).$isInvalidated()).to.equal(true);
                });
            });
        });
    });
});
