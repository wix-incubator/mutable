let expect = require('expect.js');
let Typeorama = require('../');

describe('Array data', function() {

    var SampleType = Typeorama.define('Sample', {
        spec: function(UserType) {
            return {
                name: Typeorama.String.withDefault(''),
                age: Typeorama.Number.withDefault(10)
            };
        }
    });

    //var SampleArray = Typeorama.ArrayOf(SampleType).withDefault([SampleType(), SampleType()]);

    describe('Type instance', () => {

        it('Should have default length', () => {
            var numberList = Typeorama.Array([1,2,3,4], Typeorama.Number);
            expect(numberList.length).to.equal(4);
        });

        it('Should have at function that returns a typed item', () => {
            var numberList = Typeorama.Array([1,2,3,4], Typeorama.Number);
            expect(numberList.at(0)).to.equal(1);
            expect(numberList.__subtypes__.test(numberList.at(0))).to.equal(true);
        });

        it('Should have at function that returns a typed item', () => {
            var arr = Typeorama.Array(['123','sdfs'], Typeorama.String);
            expect(arr.at(0)).to.equal('123');
        });


        it('wrapped item must pass the test function of their type', () => {
            var numberList = Typeorama.Array([1,2,3,4], Typeorama.Number);
            expect(numberList.__subtypes__.test(numberList.at(0))).to.equal(true);
        });

        it('Should have at() that returns a typed item', () => {
            var arr = Typeorama.Array([{name: 'avi', age: 12}], SampleType);
            expect(arr.at(0) instanceof arr.__subtypes__.type).to.equal(true);
        });

    });

    xdescribe('Type read only instance', () => {

        it('Should be created from data instance', () => {
            var userData = new UserType();
            var userReadOnly = userData.asReadOnly();

            expect(userReadOnly.name).to.equal('');
            expect(userReadOnly.age).to.equal(10);
        });

        xit('Should be created once for each data instance', () => {
            var userData = new UserType();
            var userReadOnly = userData.asReadOnly();
            var userReadOnly2 = userData.asReadOnly();

            expect(userReadOnly).to.equal(userReadOnly2);
        });

        it('Should be linked to data instance values', () => {
            var userData = new UserType();
            var userReadOnly = userData.asReadOnly();

            userData.name = 'moshe';
            userData.age = 120;

            expect(userReadOnly.name).to.equal('moshe');
            expect(userReadOnly.age).to.equal(120);
        });

        it('Should not change values', () => {
            var userData = new UserType();
            var userReadOnly = userData.asReadOnly();

            userReadOnly.name = 'moshe';
            userReadOnly.age = 120;

            expect(userData.name).to.equal('');
            expect(userData.age).to.equal(10);
            expect(userReadOnly.name).to.equal('');
            expect(userReadOnly.age).to.equal(10);
        });

    });

    xdescribe('Type invalidation', () => {

    });
});
