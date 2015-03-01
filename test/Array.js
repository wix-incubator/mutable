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

    //var SampleArray = Typeorama.ArrayOf(SampleType).withDefault([SampleType(), SampleType()]);

    describe('(Mutable) instance', () => {

        it('Should have default length', () => {
            var numberList = Typeorama.Array([1,2,3,4], false, Typeorama.Number);
            expect(numberList.length).to.equal(4);
        });

        describe('at()', () => {

            it('Should return a number for native immutable Typeorama.Number', () => {
                var numberList = Typeorama.Array([1,2,3,4], false, Typeorama.Number);
                expect(numberList.at(0)).to.equal(1);
            });

            it('Should return a string for native immutable Typeorama.String', () => {
                var arr = Typeorama.Array(['123','sdfs'], false, Typeorama.String);
                expect(arr.at(0)).to.equal('123');
            });

            it('Should return wrapped item that passes the test() of their type', () => {
                var numberList = Typeorama.Array([1,2,3,4], false, Typeorama.Number);
                expect(numberList.__subtypes__.test(numberList.at(0))).to.equal(true);
            });

            it('Should return a typed item for none immutable data (like custom types)', () => {
                var arr = Typeorama.Array([{name: 'avi', age: 12}], false, UserType);
                expect(arr.at(0) instanceof UserType).to.equal(true);
            });

            it('Should return a typed item form multiple types if there is _type field', () => {
                var data = [
                    {_type:'UserType',  name: 'avi', age: 12},
                    {_type:'AdderssType', name: 'avi', age: 12}
                ];
                var arr = Typeorama.Array(data, false, {UserType: UserType, AdderssType: AdderssType});
                expect(arr.at(0) instanceof UserType).to.equal(true);
                expect(arr.at(1) instanceof AdderssType).to.equal(true);
            });

            it('Should modify inner complex data', () => {
                var arrComplexType = Typeorama.Array([{}, {}, {}], false, UserWithAddressType);

                arrComplexType.at(1).user.name = 'modified user name';

                expect(arrComplexType.at(1).user.name).to.be('modified user name');
            });

            it('Should handle multi level array', () => {

                var arrComplexType = Typeorama.Array([[{}], [{}], [{}]], false, Typeorama.Array.of(UserWithAddressType));
                expect(arrComplexType.at(0).at(0) instanceof UserWithAddressType).to.be.equal(true);

            });


            it('Should change type form multi level array', () => {

                var arrComplexType = Typeorama.Array([[{}], [{}], [{}]], false, Typeorama.Array.of(UserWithAddressType));
                var userWithAddress = arrComplexType.at(0).at(0);

                userWithAddress.user.name = 'you got a new name';

                expect(userWithAddress.user.name).to.be.equal('you got a new name');

            });

        });

    });

    describe('(Read Only) instance', () => {

        it('Should have default length', () => {
            var numberList = Typeorama.Array([1,2,3,4], true, Typeorama.Number).$asReadOnly();
            expect(numberList.length).to.equal(4);
        });

        describe('at()', () => {

            it('Should return a number for native immutable Typeorama.Number', () => {

                var numberList = Typeorama.Array([1,2,3,4], true, Typeorama.Number).$asReadOnly();
                expect(numberList.at(0)).to.equal(1);
            });

            it('Should return a string for native immutable Typeorama.String', () => {
                var arr = Typeorama.Array(['123','sdfs'], true, Typeorama.String).$asReadOnly();
                expect(arr.at(0)).to.equal('123');
            });

            it('Should return wrapped item that passes the test() of their type', () => {
                var numberList = Typeorama.Array([1,2,3,4], true, Typeorama.Number).$asReadOnly();
                expect(numberList.__subtypes__.test(numberList.at(0))).to.equal(true);
            });

            it('Should return a typed item for none immutable data (like custom types)', () => {
                var arr = Typeorama.Array([{name: 'avi', age: 12}], true, UserType).$asReadOnly();
                expect(arr.at(0) instanceof UserType).to.equal(true);
            });

            it('Should return a typed item form multiple types if there is _type field', () => {
                var data = [
                    {_type:'UserType',  name: 'avi', age: 12},
                    {_type:'AdderssType', name: 'avi', age: 12}
                ];
                var arr = Typeorama.Array(data, true, {UserType: UserType, AdderssType: AdderssType}).$asReadOnly();
                expect(arr.at(0) instanceof UserType).to.equal(true);
                expect(arr.at(1) instanceof AdderssType).to.equal(true);
            });

            it('Should not modify inner complex data', () => {
                var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
                var arrComplexType = Typeorama.Array([{}, {}, {}], true, UserWithAddressType).$asReadOnly();

                arrComplexType.at(1).user.name = 'modified user name';

                expect(arrComplexType.at(1).user.name).to.be(userDefaultName);

            });

            it('Should handle multi level array', () => {

                var arrComplexType = Typeorama.Array([[{}], [{}], [{}]], true, Typeorama.Array.of(UserWithAddressType));
                expect(arrComplexType.at(0).at(0) instanceof UserWithAddressType).to.be.equal(true);

            });


            it('Should not change type from multi level array', () => {

                var arrComplexType = Typeorama.Array([[{}], [{}], [{}]], true, Typeorama.Array.of(UserWithAddressType));
                var userWithAddress = arrComplexType.at(0).at(0);

                userWithAddress.user.name = 'you got a new name';

                expect(userWithAddress.user.name).to.be.equal('');

            });


        });

    });

});
