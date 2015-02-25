let expect = require('expect.js');
let path = require('path');
let Typeorama = require('../');

describe('Custom data', function() {

    var UserType = Typeorama.define({
        id: 'User',
        constructor: function() {
            Typeorama.BaseType.apply(this, arguments);
        },
        fields: {
            name: {value:"", type:Typeorama.string},
            age: {value:10, type:Typeorama.number}
        },
        getterFactory: (fieldName) => { return () => { return this.__value__[fieldName]; }},
        setterFactory: (fieldName) => { return (value) => { return this.__value__[fieldName].setValue(value); }}
    });

    describe('Type constructor', () => {
        it('Should have getFieldsDesc()', () => {
            expect(UserType.getFieldsDesc).to.be.an(Function);
            expect(UserType.getFieldsDesc().name).to.eql({value:"", type:Typeorama.string});
            expect(UserType.getFieldsDesc().age).to.eql({value:10, type:Typeorama.number});
        });
    });

    describe('Type instance', () => {

        it('Should return default value for fields from custom instance', (done) => {
            var userData = new UserType();
            expect(UserType.name).to.equal('');
            expect(UserType.age).to.equal(10);
        });

        it('Should modify fields', (done) => {
            var userData = new UserType();

            userData.name = 'moshe';
            userData.age = 30;

            expect(UserType.name).to.equal('moshe');
            expect(UserType.age).to.equal(30);
        });

        it('Should return json value from val()', (done) => {
            var userData = new UserType();

            expect(userData.val()).to.eql({
                name:"",
                age:10
            });

            userData.name = 'moshe';
            userData.age = 30;

            expect(userData.val()).to.eql({
                name:"moshe",
                age:30
            });
        });

    });

    describe('Type read only instance', () => {

        it('Should be created from data instance', (done) => {
            var userData = new UserType();
            var userReadOnly = userData.getReadOnly();

            expect(userReadOnly.name).to.equal('');
            expect(userReadOnly.name).to.equal(10);
        });

        it('Should be created once for each data instance', (done) => {
            var userData = new UserType();
            var userReadOnly = userData.getReadOnly();
            var userReadOnly2 = userData.getReadOnly();

            expect(userReadOnly).to.equal(userReadOnly2);
        });

        it('Should be linked to data instance values', (done) => {
            var userData = new UserType();
            var userReadOnly = userData.getReadOnly();

            userData.name = 'moshe';
            userData.age = 120;

            expect(userReadOnly.name).to.equal('moshe');
            expect(userReadOnly.name).to.equal(120);
        });

        it('Should not change values', (done) => {
            var userData = new UserType();
            var userReadOnly = userData.getReadOnly();

            userReadOnly.name = 'moshe';
            userReadOnly.age = 120;

            expect(userData.name).to.equal('');
            expect(userData.name).to.equal(10);
            expect(userData.name).to.equal('');
            expect(userData.name).to.equal(10);
        });

    });

    describe('Type invalidation', () => {

    });
});
