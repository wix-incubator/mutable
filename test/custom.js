import Typorama from "../";
import {aDataTypeWithSpec} from "./testDrivers/index";
import {expect} from "chai";

describe('Custom data', function() {

    var UserType = aDataTypeWithSpec({
        name: Typorama.String.withDefault('leon'),
        age: Typorama.Number.withDefault(10)
    }, 'User');

    var UserWithChildType = aDataTypeWithSpec({
        name: Typorama.String.withDefault('leon'),
        age: Typorama.Number.withDefault(40),
        child: UserType.withDefault({name: 'bobi', age: 13})
    }, 'UserWithChildType');

    var UserWith2ChildType = aDataTypeWithSpec({
        name: Typorama.String.withDefault('leon'),
        age: Typorama.Number.withDefault(40),
        child: UserType.withDefault({name: 'bobi', age: 13}),
        child2: UserType.withDefault({name: 'chiki', age: 5})
    }, 'UserWith2ChildType');

    describe('definition', () => {
        it('Should throw error for reserved keys', () => { // ToDo: change to fields that start with $ and __
            expect(function(){
                aDataTypeWithSpec({ $asReadOnly:Typorama.String });
            }).to.throw();
        });
    });

    describe('constructor', () => {
        it('Should have getFieldsSpec()', () => {
            var fieldsDesc = UserType.getFieldsSpec();

            //expect(fieldDesc).toHaveFields([
            //    aField("name").withDefaults('leon').withType(Typorama.String.type),
            //    aField("age")....])

            expect(fieldsDesc.name.defaults()).to.equal('leon');
            expect(fieldsDesc.name.type).to.eql(Typorama.String.type);
            expect(fieldsDesc.age.defaults()).to.equal(10);
            expect(fieldsDesc.age.type).to.eql(Typorama.Number.type);
        });
    });

    describe('(Mutable) instance', () => {

        it('Should return default value for fields from custom instance when no data is passed', () => {
            var userData = new UserType();

            expect(userData.name).to.equal('leon');
            expect(userData.age).to.equal(10);
        });

        it('Should modify fields (json and primitives)', () => {
            var userData = new UserWithChildType();

            userData.name = 'moshe';
            userData.age = 30;
            userData.child = {name: 'chiki', age: 5};

            expect(userData.name).to.equal('moshe');
            expect(userData.age).to.equal(30);
            expect(userData.child.name).to.equal('chiki');
            expect(userData.child.age).to.equal(5);
        });

        it('Should modify fields (typorama data)', () => {
            var userData = new UserWithChildType();

            userData.child = new UserType({name: 'yossi', age: 3});

            expect(userData.child.name).to.equal('yossi');
            expect(userData.child.age).to.equal(3);
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
        describe('$isInvalidated',() =>{
            it('Should return false for un modified data', () => {
                var userData = new UserType();
                expect(userData.$isInvalidated()).to.equal(false);
            });
            it('Should return true for modified data', () => {
                var userData = new UserType();
                userData.name = "gaga";
                expect(userData.$isInvalidated()).to.equal(true);
            });
            it('Should return true for data when a child value has changed', () => {
                var userWithChildType = new UserWithChildType();
                userWithChildType.child.name = "gaga";
                expect(userWithChildType.$isInvalidated()).to.equal(true);
            });
            xit('Should return true for data when a child value has changed after isinvalidates was already called', () => {
                var userWithChildType = new UserWithChildType();
                expect(userWithChildType.$isInvalidated()).to.equal(false);
                userWithChildType.child.name = "gaga";
                expect(userWithChildType.$isInvalidated()).to.equal(true);
            });
            it('Should return false for data when only a parent/sibling value has changed', () => {
                var userWith2ChildType = new UserWith2ChildType();

                userWith2ChildType.name = "gaga";
                userWith2ChildType.child.name = "baga";
                expect(userWith2ChildType.child.$isInvalidated()).to.equal(true);
                expect(userWith2ChildType.child2.$isInvalidated()).to.equal(false);
            });
        });
        describe('$revalidate',() =>{
            it('Should reset data invalidation', () => {
                var userData = new UserType();
                userData.name = 'gaga';
                expect(userData.$isInvalidated()).to.equal(true);
                userData.$revalidate();
                expect(userData.$isInvalidated()).to.equal(false);

            });
            it('Should reset deep data invalidation', () => {
                var userWithChildType = new UserWithChildType();
                userWithChildType.child.name = "gaga";
                expect(userWithChildType.$isInvalidated()).to.equal(true);
                expect(userWithChildType.child.$isInvalidated()).to.equal(true);
                userWithChildType.$revalidate();
                expect(userWithChildType.$isInvalidated()).to.equal(false);
                expect(userWithChildType.child.$isInvalidated()).to.equal(false);
            });

        });
        describe('$resetValidationCheck',() =>{
            it('it Should allow isInvalidated to return true for data when a child value has changed after isinvalidates was already called', () => {
                var userWithChildType = new UserWithChildType();
                expect(userWithChildType.$isInvalidated()).to.equal(false);
                userWithChildType.child.name = "gaga";
                expect(userWithChildType.$isInvalidated()).to.equal(false);
                userWithChildType.$resetValidationCheck();
                expect(userWithChildType.$isInvalidated()).to.equal(true);
            });

        });
    });
});
