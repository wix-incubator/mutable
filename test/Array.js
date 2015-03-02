let expect = require('expect.js');
let Typeorama = require('../');

describe('Array data', function() {

    var UserType = Typeorama.define('User', {
        spec: function(UserType) {
            return {
                name: Typeorama.String.withDefault(''),
                age: Typeorama.Number.withDefault(10)
            };
        }
    });

    var AdderssType = Typeorama.define('Address', {
        spec: function(UserType) {
            return {
                address: Typeorama.String.withDefault(''),
                code: Typeorama.Number.withDefault(10)
            };
        }
    });

    var UserWithAddressType = Typeorama.define('UserWithAddress', {
        spec: function(UserWithAddressType) {
            return {
                user: UserType,
                address: AdderssType
            };
        }
    });

    describe('(Mutable) instance', () => {

        it('Should have default length', () => {
            var numberList = Typeorama.Array([1,2,3,4], false, Typeorama.Number);
            expect(numberList.length).to.equal(4);
        });

        it('Should be created once for each data instance', () => {
            var numberList = Typeorama.Array([1,2,3,4], false, Typeorama.Number);
            var numberListReadOnly = numberList.$asReadOnly();
            var numberListReadOnly2 = numberList.$asReadOnly();

            expect(numberListReadOnly).to.equal(numberListReadOnly2);
        });

        describe('at()', () => {

            it('Should return a number for native immutable Typeorama.Number', () => {
                var numberList = Typeorama.Array.create([1,2,3,4], Typeorama.Number);
                expect(numberList.at(0)).to.equal(1);
            });

            it('Should return a string for native immutable Typeorama.String', () => {
                var arr = Typeorama.Array.create(['123','sdfs'], Typeorama.String);
                expect(arr.at(0)).to.equal('123');
            });

            it('Should return wrapped item that passes the test() of their type', () => {
                var numberList = Typeorama.Array.create([1,2,3,4], Typeorama.Number);
                expect(numberList.__options__.subTypes.test(numberList.at(0))).to.equal(true);
            });

            it('Should return a typed item for none immutable data (like custom types)', () => {
                var arr = Typeorama.Array.create([{name: 'avi', age: 12}], UserType);
                expect(arr.at(0) instanceof UserType).to.equal(true);
            });

            it('Should always return a the same reference for wrapper', () => {
                var arr = Typeorama.Array.create([{name: 'avi', age: 12}], UserType);
                expect(arr.at(0)).to.equal(arr.at(0));
            });

            it('Should return a typed item form multiple types if there is _type field', () => {
                var data = [
                    {_type:'UserType',  name: 'avi', age: 12},
                    {_type:'AdderssType', name: 'avi', age: 12}
                ];
                var arr = Typeorama.Array.create(data, {UserType: UserType, AdderssType: AdderssType});
                expect(arr.at(0) instanceof UserType).to.equal(true);
                expect(arr.at(1) instanceof AdderssType).to.equal(true);
            });

            it('Should modify inner complex data', () => {
                var arrComplexType = Typeorama.Array.create([{}, {}, {}], UserWithAddressType);

                arrComplexType.at(1).user.name = 'modified user name';

                expect(arrComplexType.at(1).user.name).to.be('modified user name');
            });

            it('Should handle multi level array', () => {
                var arrComplexType = Typeorama.Array.create([[{}], [{}], [{}]], Typeorama.Array.of(UserWithAddressType));
                expect(arrComplexType.at(0).at(0) instanceof UserWithAddressType).to.be.equal(true);
            });

            it('Should change type form multi level array', () => {
                var arrComplexType = Typeorama.Array.create([[{}], [{}], [{}]], Typeorama.Array.of(UserWithAddressType));
                var userWithAddress = arrComplexType.at(0).at(0);

                userWithAddress.user.name = 'you got a new name';

                expect(userWithAddress.user.name).to.be.equal('you got a new name');
            });

            it('Should keep read only item as read only', () => {
                var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
                var readOnlyData = new UserWithAddressType().$asReadOnly();
                var arrComplexType = Typeorama.Array.create([readOnlyData], UserWithAddressType);

                var readOnlyItemData = arrComplexType.at(0);

                readOnlyItemData.user.name = 'you got a new name';

                expect(readOnlyItemData.user.name).to.be.equal(userDefaultName);
                expect(readOnlyItemData).to.be.equal(readOnlyData);
            });

        });

        describe('as field on data object', () => {

            var GroupType = Typeorama.define('GroupType', {
                spec: function(GroupType) {
                    return {
                        title: Typeorama.String,
                        users: Typeorama.Array.of(UserType)
                    };
                }
            });

            it('Should be modified from json ', () => {
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

    describe('(Read Only) instance', () => {

        it('Should have default length', () => {
            var numberList = Typeorama.Array.create([1,2,3,4], Typeorama.Number).$asReadOnly();
            expect(numberList.length).to.equal(4);
        });

        describe('at()', () => {

            it('Should return a number for native immutable Typeorama.Number', () => {
                var numberList = Typeorama.Array.create([1,2,3,4], Typeorama.Number).$asReadOnly();
                expect(numberList.at(0)).to.equal(1);
            });

            it('Should return a string for native immutable Typeorama.String', () => {
                var arr = Typeorama.Array.create(['123','sdfs'], Typeorama.String).$asReadOnly();
                expect(arr.at(0)).to.equal('123');
            });

            it('Should return wrapped item that passes the test() of their type', () => {
                var numberList = Typeorama.Array.create([1,2,3,4], Typeorama.Number).$asReadOnly();
                expect(numberList.__options__.subTypes.test(numberList.at(0))).to.equal(true);
            });

            it('Should return a typed item for none immutable data (like custom types)', () => {
                var arr = Typeorama.Array.create([{name: 'avi', age: 12}], UserType).$asReadOnly();
                expect(arr.at(0) instanceof UserType).to.equal(true);
            });

            it('Should return a typed item form multiple types if there is _type field', () => {
                var data = [
                    {_type:'UserType',  name: 'avi', age: 12},
                    {_type:'AdderssType', name: 'avi', age: 12}
                ];
                var arr = Typeorama.Array.create(data, {UserType: UserType, AdderssType: AdderssType}).$asReadOnly();
                expect(arr.at(0) instanceof UserType).to.equal(true);
                expect(arr.at(1) instanceof AdderssType).to.equal(true);
            });

            it('Should not modify inner complex data', () => {
                var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
                var arrComplexType = Typeorama.Array.create([{}, {}, {}], UserWithAddressType).$asReadOnly();

                arrComplexType.at(1).user.name = 'modified user name';

                expect(arrComplexType.at(1).user.name).to.be(userDefaultName);

            });

            it('Should handle multi level array', () => {
                var arrComplexType = Typeorama.Array.create([[{}], [{}], [{}]], Typeorama.Array.of(UserWithAddressType), true);
                expect(arrComplexType.at(0).at(0) instanceof UserWithAddressType).to.be.equal(true);
            });

            it('Should not change type from multi level array', () => {
                var arrComplexType = Typeorama.Array.create([[{}], [{}], [{}]], Typeorama.Array.of(UserWithAddressType), true);
                var userWithAddress = arrComplexType.at(0).at(0);

                userWithAddress.user.name = 'you got a new name';

                expect(userWithAddress.user.name).to.be.equal('');
            });

        });

    });

});
