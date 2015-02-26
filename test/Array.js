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

    var SampleType2 = Typeorama.define('Sample2', {
        spec: function(UserType) {
            return {
                address: Typeorama.String.withDefault(''),
                code: Typeorama.Number.withDefault(10)
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
            expect(arr.at(0) instanceof SampleType).to.equal(true);
            expect(arr.at(0) instanceof arr.__subtypes__.type).to.equal(true);
        });


        it('Should have at() that returns a typed item form multiple types if there is _type field', () => {
            var data = [
                {_type:'SampleType',  name: 'avi', age: 12},
                {_type:'SampleType2', name: 'avi', age: 12}
            ];
            var arr = Typeorama.Array(data, {SampleType: SampleType, SampleType2: SampleType2});
            expect(arr.at(0) instanceof SampleType).to.equal(true);
            expect(arr.at(1) instanceof SampleType2).to.equal(true);
        });

    });

});
