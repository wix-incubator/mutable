import _ from "lodash";
import Typorama from "../src";
import {aDataTypeWithSpec} from "./testDrivers/index";
import {expect, err} from "chai";

describe('Custom data', function() {

    var UserType = aDataTypeWithSpec({
        name: Typorama.String.withDefault('leon'),
        age: Typorama.Number.withDefault(10)
    }, 'User');

    var UserWithChildType = aDataTypeWithSpec({
        name: Typorama.String.withDefault('leon'),
        child: UserType.withDefault({name: 'bobi', age: 13})
    }, 'UserWithChildType');

    describe('definition', () => {
        it('should throw error for reserved keys', () => { // ToDo: change to fields that start with $ and __
            expect(function(){
                aDataTypeWithSpec({ $asReadOnly:Typorama.String });
            }).to.throw();
        });
    });

    describe('Type Class', () => {
        it('should be able to describe itself', () => {
            expect(UserType).to.have.field('name').with.defaults('leon').of.type(Typorama.String);
            expect(UserType).to.have.field('age').with.defaults(10).of.type(Typorama.Number);
        });
    });

    describe('mutable instance', () => {

        describe('instantiation', () => {

            it('should accept values from json', () => {
                var userData = new UserType({ name:'yoshi', age:50 });

                expect(userData.name).to.equal('yoshi');
                expect(userData.age).to.equal(50);
            });

            it('should provide default values when no initial data is provided', () => {
                var userData = new UserType();

                expect(userData).to.be.a.dataInstance.with.fields((field) => {
                    field.to.be.defaultValue();
                });
            });

            it('should provide default values for missing fields', () => {
                var userData = new UserType({});

                expect(userData).to.be.a.dataInstance.with.fields((field) => {
                    field.to.be.defaultValue();
                });
            });

            it('should not provide default values for provided fields', () => {
                var userData = new UserType({ age:53 });

                expect(userData.age).to.equal(53);
            });

            xit('should provide default values for mismatching fields', () => {
                var userData = new UserType({ age:{} });

                expect(userData).to.be.a.dataInstance.with.field('age').with.defaultValue();
            });

        });

        describe('setters', () => {

            it('should modify fields (json and primitives)', () => {
                var userData = new UserWithChildType();

                userData.name = 'moshe';
                userData.child = {name: 'chiki', age: 5};

                //expect(userData).to.be.a.dataInstance.with.field('name', 'moshe').and.field('child', (childField) => {
                //    childField.to.be.a.dataInstance.with.field('name', 'chiki').and.field('age', 5);
                //});

                //expect(userData.name).to.equal('moshe');
                //expect(userData.child).to.be.a.dataInstance.with.fields({
                //    "name": (field) => field.to.be.equal('chiki'),
                //    "age": (field) => field.to.be.equal(5)
                //});
                expect(userData.child.name).to.equal('chiki');
                expect(userData.child.age).to.equal(5);
            });

        });



        it('should clone complex data objects on set', () => {
            var userData = new UserWithChildType();

            userData.child = new UserType({name: 'yossi', age: 3});

            expect(userData.child.name).to.equal('yossi');
            expect(userData.child.age).to.equal(3);
        });

        it('should return json value from toJSON()', () => {
            var userData = new UserWithChildType();

            expect(userData.toJSON()).to.eql({
                name:"leon",
                child: { name: 'bobi', age: 13 }
            });

            userData.name = 'moshe';

            expect(userData.toJSON()).to.eql({
                name:"moshe",
                child: { name: 'bobi', age: 13 }
            });
        });

        it('should be convertible to JSON ', () => {
            var userData = new UserWithChildType();

            expect(JSON.parse(JSON.stringify(userData))).to.eql({
                name:"leon",
                child: { name: 'bobi', age: 13 }
            });

            userData.name = 'moshe';

            expect(JSON.parse(JSON.stringify(userData))).to.eql({
                name:"moshe",
                child: { name: 'bobi', age: 13 }
            });
        });

        it('should return wrapped data for none native immutable fields (like custom data)', () => {
            var userData = new UserWithChildType();

            expect(userData.child instanceof UserType).to.equal(true);
        })

    });

    describe('(Read Only) instance', () => {

        it('should be created from data instance', () => {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();

            expect(userReadOnly.name).to.equal('leon');
            expect(userReadOnly.age).to.equal(10);
        });

        it('should be created once for each data instance', () => {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();
            var userReadOnly2 = userData.$asReadOnly();

            expect(userReadOnly).to.equal(userReadOnly2);
        });

        it('should be linked to data instance values', () => {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();

            userData.name = 'moshe';
            userData.age = 120;

            expect(userReadOnly.name).to.equal('moshe');
            expect(userReadOnly.age).to.equal(120);
        });

        it('should not change values', () => {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();

            userReadOnly.name = 'moshe';
            userReadOnly.age = 120;

            expect(userData.name).to.equal('leon');
            expect(userData.age).to.equal(10);
            expect(userReadOnly.name).to.equal('leon');
            expect(userReadOnly.age).to.equal(10);
        });

        it('should return wrapped data for none native immutable fields (like custom data)', () => {
            var userData = new UserWithChildType().$asReadOnly();

            var readOnlyChild = userData.child;
            readOnlyChild.name = 'modified name';

            expect(readOnlyChild instanceof UserType).to.equal(true);
            expect(readOnlyChild.name).to.equal('bobi');
        });

    });

    describe('Type invalidation', () => {
        describe('$isInvalidated()',() =>{
            it('should return false for un modified data', () => {
                var userData = new UserType();
                expect(userData.$isInvalidated()).to.equal(false);
            });
            it('should return true for modified data', () => {
                var userData = new UserType();
                userData.name = "gaga";
                expect(userData.$isInvalidated()).to.equal(true);
            });
            it('should return true for data when a child value has changed', () => {
                var userWithChildType = new UserWithChildType();
                userWithChildType.child.name = "gaga";
                expect(userWithChildType.$isInvalidated()).to.equal(true);
            });
            xit('should return true for data when a child value has changed after isinvalidates was already called', () => {
                var userWithChildType = new UserWithChildType();
                expect(userWithChildType.$isInvalidated()).to.equal(false);
                userWithChildType.child.name = "gaga";
                expect(userWithChildType.$isInvalidated()).to.equal(true);
            });
            it('should return false for data when only a parent/sibling value has changed', () => {
                var UserWith2ChildType = aDataTypeWithSpec({
                    child: UserType.withDefault({name: 'bobi', age: 13}),
                    child2: UserType.withDefault({name: 'chiki', age: 5})
                }, 'UserWith2ChildType');

                var userWith2ChildType = new UserWith2ChildType();

                userWith2ChildType.child.name = "baga";
                expect(userWith2ChildType.child.$isInvalidated()).to.equal(true);
                expect(userWith2ChildType.child2.$isInvalidated()).to.equal(false);
            });
        });
        describe('$revalidate()',() =>{
            it('should reset data invalidation', () => {
                var userData = new UserType();
                userData.name = 'gaga';
                expect(userData.$isInvalidated()).to.equal(true);
                userData.$revalidate();
                expect(userData.$isInvalidated()).to.equal(false);

            });
            it('should reset deep data invalidation', () => {
                var userWithChildType = new UserWithChildType();
                userWithChildType.child.name = "gaga";
                expect(userWithChildType.$isInvalidated()).to.equal(true);
                expect(userWithChildType.child.$isInvalidated()).to.equal(true);
                userWithChildType.$revalidate();
                expect(userWithChildType.$isInvalidated()).to.equal(false);
                expect(userWithChildType.child.$isInvalidated()).to.equal(false);
            });

        });
        describe('$resetValidationCheck()',() =>{
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
