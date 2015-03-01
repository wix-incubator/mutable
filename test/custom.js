let expect = require('expect.js');
let Typeorama = require('../');

describe('Custom data', function() {

    var UserType = Typeorama.define('User', {
        spec: function(UserType) {
            return {
                name: Typeorama.String.withDefault('leon'),
                age: Typeorama.Number.withDefault(10)
            };
        }
    });

    var UserWithChildType = Typeorama.define('User', {
        spec: function(UserWithChildType) {
            return {
                name: Typeorama.String.withDefault('leon'),
                age: Typeorama.Number.withDefault(40),
                child: UserType.withDefault({name: 'bobi', age: 13})
            };
        }
    });

    describe('definition', () => {
        it('Should throw error for reserved keys', () => { // ToDo: change to fields that start with $ and __

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

    describe('constructor', () => {
        it('Should have getFieldsSpec()', () => {
            var fieldsDesc = UserType.getFieldsSpec();

            expect(fieldsDesc.name.defaults()).to.equal('leon');
            expect(fieldsDesc.name.type).to.eql(Typeorama.String.type);
            expect(fieldsDesc.age.defaults()).to.equal(10);
            expect(fieldsDesc.age.type).to.eql(Typeorama.Number.type);
        });
    });

    describe('(Mutable) instance', () => {

        it('Should return default value for fields from custom instance when no data is passed', () => {
            var userData = new UserType();

            expect(userData.name).to.equal('leon');
            expect(userData.age).to.equal(10);
        });

        it('Should modify fields', () => {
            var userData = new UserWithChildType();

            userData.name = 'moshe';
            userData.age = 30;
            userData.child = {name: 'chiki', age: 5};

            expect(userData.name).to.equal('moshe');
            expect(userData.age).to.equal(30);
            expect(userData.child.name).to.equal('chiki');
            expect(userData.child.age).to.equal(5);
        });

        it('Should accept value', () => {
            var userData = new UserType({ name:'yoshi', age:50 });

            expect(userData.name).to.equal('yoshi');
            expect(userData.age).to.equal(50);
        });

        it('Should accept partial value', () => {
            var userData = new UserType({ age:53 });

            expect(userData.name).to.equal('leon');
            expect(userData.age).to.equal(53);
        });

        xit('Should ignore type mismatch', () => {
            var userData = new UserType({ age:{} });

            expect(userData.name).to.equal('leon');
            expect(userData.age).to.equal(30);
        });

        it('Should return json value from toJSON()', () => {
            var userData = new UserWithChildType();

            expect(userData.toJSON()).to.eql({
                name:"leon",
                age:40,
                child: { name: 'bobi', age: 13 }
            });

            userData.name = 'moshe';
            userData.age = 30;

            expect(userData.toJSON()).to.eql({
                name:"moshe",
                age:30,
                child: { name: 'bobi', age: 13 }
            });
        });

        it('Should be convertible to JSON ', () => {
            var userData = new UserWithChildType();

            expect(JSON.parse(JSON.stringify(userData))).to.eql({
                name:"leon",
                age:40,
                child: { name: 'bobi', age: 13 }
            });

            userData.name = 'moshe';
            userData.age = 30;

            expect(JSON.parse(JSON.stringify(userData))).to.eql({
                name:"moshe",
                age:30,
                child: { name: 'bobi', age: 13 }
            });
        });

        it('Should return wrapped data for none native immutable fields (like custom data)', () => {
            var userData = new UserWithChildType();

            expect(userData.child instanceof UserType).to.equal(true);
        })

    });

    describe('(Read Only) instance', () => {

        it('Should be created from data instance', () => {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();

            expect(userReadOnly.name).to.equal('leon');
            expect(userReadOnly.age).to.equal(10);
        });

        it('Should be created once for each data instance', () => {
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

            expect(userData.name).to.equal('leon');
            expect(userData.age).to.equal(10);
            expect(userReadOnly.name).to.equal('leon');
            expect(userReadOnly.age).to.equal(10);
        });

        it('Should return wrapped data for none native immutable fields (like custom data)', () => {
            var userData = new UserWithChildType().$asReadOnly();

            var readOnlyChild = userData.child;
            readOnlyChild.name = 'modified name';

            expect(readOnlyChild instanceof UserType).to.equal(true);
            expect(readOnlyChild.name).to.equal('bobi');
        });

    });

    describe('Type invalidation', () => {

    });
});
