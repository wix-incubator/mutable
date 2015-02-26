let expect = require('expect.js');
let Typeorama = require('../');


//Typeorama.String.type('asdfasdf')

//Typeorama.defineBaseType('email', Typeorama.String, de, te)

describe('Custom data', function() {

    var UserType = Typeorama.define('User', {
        spec: function(UserType) {
            return {
                name: Typeorama.String.withDefault(''),
                age: Typeorama.Number.withDefault(10)
            };
        }
        //,getterFactory: (fieldName) => { return () => { return this.__value__[fieldName]; }},
        //setterFactory: (fieldName) => { return (value) => { return this.__value__[fieldName].setValue(value); }}
    });

    describe('Type constructor', () => {
        it('Should have getFieldsSpec()', () => {
            var fieldsDesc = UserType.getFieldsSpec();

            expect(fieldsDesc.name.defaults()).to.equal('');
            expect(fieldsDesc.name.type).to.eql(Typeorama.String.type);
            expect(fieldsDesc.age.defaults()).to.equal(10);
            expect(fieldsDesc.age.type).to.eql(Typeorama.Number.type);
        });
    });

    describe('Type definition', () => {
        it('Should throw error for reserved keys', () => {

            expect(function(){
                var UserType = Typeorama.define('User', {
                    spec: function(UserType) {
                        return {
                            $asReadOnly: Typeorama.String
                        };
                    }
                });
            }).to.throwException();

        });
    });

    describe('Type instance', () => {

        it('Should return default value for fields from custom instance when no data is passed', () => {
            var userData = new UserType();

            expect(userData.name).to.equal('');
            expect(userData.age).to.equal(10);
        });

        it('Should modify fields', () => {
            var userData = new UserType();

            userData.name = 'moshe';
            userData.age = 30;

            expect(userData.name).to.equal('moshe');
            expect(userData.age).to.equal(30);
        });

        it('Should accept value', () => {
            var userData = new UserType({ name:'yoshi', age:50 });

            expect(userData.name).to.equal('yoshi');
            expect(userData.age).to.equal(50);
        });

        it('Should accept partial value', () => {
            var userData = new UserType({ age:53 });

            expect(userData.name).to.equal('');
            expect(userData.age).to.equal(53);
        });

        it('Should return json value from toJSON()', () => {
            var userData = new UserType();

            expect(userData.toJSON()).to.eql({
                name:"",
                age:10
            });

            userData.name = 'moshe';
            userData.age = 30;

            expect(userData.toJSON()).to.eql({
                name:"moshe",
                age:30
            });
        });

        it('Should be convertible to JSON ', () => {
            var userData = new UserType();

            expect(JSON.parse(JSON.stringify(userData))).to.eql({
                name:"",
                age:10
            });

            userData.name = 'moshe';
            userData.age = 30;

            expect(JSON.parse(JSON.stringify(userData))).to.eql({
                name:"moshe",
                age:30
            });
        });

    });

    describe('Type read only instance', () => {

        it('Should be created from data instance', () => {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();

            expect(userReadOnly.name).to.equal('');
            expect(userReadOnly.age).to.equal(10);
        });

        xit('Should be created once for each data instance', () => {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();
            var userReadOnly2 = userData.$asReadOnly();

            expect(userReadOnly).to.equal(userReadOnly2);
        });

        it('Should be linked to data instance values', () => {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();

            userData.name = 'moshe';
            userData.age = 120;

            expect(userReadOnly.name).to.equal('moshe');
            expect(userReadOnly.age).to.equal(120);
        });

        it('Should not change values', () => {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();

            userReadOnly.name = 'moshe';
            userReadOnly.age = 120;

            expect(userData.name).to.equal('');
            expect(userData.age).to.equal(10);
            expect(userReadOnly.name).to.equal('');
            expect(userReadOnly.age).to.equal(10);
        });

    });

    describe('Type invalidation', () => {

    });
});
