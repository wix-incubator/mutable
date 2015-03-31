import _ from 'lodash';
import Typorama from '../src';
import {aDataTypeWithSpec} from '../test-kit/testDrivers/index';
import {expect, err} from 'chai';

describe('Custom data', function() {

    var UserType = aDataTypeWithSpec({
        name: Typorama.String.withDefault('leon'),
        age: Typorama.Number.withDefault(10)
    }, 'User');

    var UserWithChildType = aDataTypeWithSpec({
        name: Typorama.String.withDefault('leon'),
        child: UserType.withDefault({name: 'bobi', age: 13})
    }, 'UserWithChildType');

    describe('definition', function() {
        it('should throw error for reserved keys', function() { // ToDo: change to fields that start with $ and __
            expect(() => aDataTypeWithSpec({ $asReadOnly: Typorama.String })).to.throw();
        });
    });

    describe('Type Class', function() {
        it('should be able to describe itself', function() {
            expect(UserType).to.have.field('name').with.defaults('leon').of.type(Typorama.String);
            expect(UserType).to.have.field('age').with.defaults(10).of.type(Typorama.Number);
        });
    });

    describe('mutable instance', function() {

        describe('instantiation', function() {

            it('should accept values from json', function() {
                var userData = new UserType({ name:'yoshi', age:50 });

                expect(userData.name).to.equal('yoshi');
                expect(userData.age).to.equal(50);
            });

            it('should provide default values when no initial data is provided', function() {
                var userData = new UserType();

                expect(userData).to.be.a.dataInstance.with.fields((field) => {
                    field.to.be.defaultValue();
                });
            });

            it('should provide default values for missing fields', function() {
                var userData = new UserType({});

                expect(userData).to.be.a.dataInstance.with.fields((field) => {
                    field.to.be.defaultValue();
                });
            });

            it('should not provide default values for provided fields', function() {
                var userData = new UserType({ age: 53 });

                expect(userData.age).to.equal(53);
            });

            xit('should provide default values for mismatching fields', function() {
                var userData = new UserType({ age: {} });

                expect(userData).to.be.a.dataInstance.with.field('age').with.defaultValue();
            });

        });

        describe('setters', function() {

            it('should modify fields (json and primitives)', function() {
                var userData = new UserWithChildType();

                userData.name = 'moshe';
                userData.child = {name: 'chiki', age: 5};

                //expect(userData).to.be.a.dataInstance.with.field('name', 'moshe').and.field('child', (childField) => {
                //    childField.to.be.a.dataInstance.with.field('name', 'chiki').and.field('age', 5);
                //});

                //expect(userData.name).to.equal('moshe');
                //expect(userData.child).to.be.a.dataInstance.with.fields({
                //    'name': (field) => field.to.be.equal('chiki'),
                //    'age': (field) => field.to.be.equal(5)
                //});
                expect(userData.child.name).to.equal('chiki');
                expect(userData.child.age).to.equal(5);
            });

        });

		it('should chain withdefault calls', function() {
		
			var typeWithDefaultBob = UserType.withDefault({name: 'joe'}).withDefault({name: 'bob'});
			
			var a = typeWithDefaultBob.defaults();
			
			expect(a.name).to.equal('bob');
		
		})

        it('should clone complex data objects on set', function() {

            var userData = new UserWithChildType();

            userData.child = new UserType({name: 'yossi', age: 3});

            expect(userData.child.name).to.equal('yossi');
            expect(userData.child.age).to.equal(3);
        });

        it('should return json value from toJSON()', function() {
            var userData = new UserWithChildType();

            expect(userData.toJSON()).to.eql({
                name: 'leon',
                child: { name: 'bobi', age: 13 }
            });

            userData.name = 'moshe';

            expect(userData.toJSON()).to.eql({
                name: 'moshe',
                child: { name: 'bobi', age: 13 }
            });
        });

        it('should be convertible to JSON ', function() {
            var userData = new UserWithChildType();

            expect(JSON.parse(JSON.stringify(userData))).to.eql({
                name: 'leon',
                child: { name: 'bobi', age: 13 }
            });

            userData.name = 'moshe';

            expect(JSON.parse(JSON.stringify(userData))).to.eql({
                name: 'moshe',
                child: { name: 'bobi', age: 13 }
            });
        });

        it('should return wrapped data for none native immutable fields (like custom data)', function() {
            var userData = new UserWithChildType();

            expect(userData.child instanceof UserType).to.equal(true);
        })

    });

    describe('(Read Only) instance', function() {

        it('should be created from data instance', function() {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();

            expect(userReadOnly.name).to.equal('leon');
            expect(userReadOnly.age).to.equal(10);
        });

        it('should be created once for each data instance', function() {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();
            var userReadOnly2 = userData.$asReadOnly();

            expect(userReadOnly).to.equal(userReadOnly2);
        });

        it('should keep the source instance not readOnly', function() {
            // this is beacause the readonly instance used to have a bug in which it changed the original item value while wrapping it
            var userData = new UserWithChildType();

            userData.$asReadOnly();
            userData.child.setValue({name: 'moshe'});

            expect(userData.toJSON()).to.eql({
                name: 'leon',
                child: {
                    name: 'moshe',
                    age: 13
                }
            });
        });

        it('should be linked to data instance values', function() {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();

            userData.name = 'moshe';
            userData.age = 120;

            expect(userReadOnly.name).to.equal('moshe');
            expect(userReadOnly.age).to.equal(120);
        });

        it('should not change values', function() {
            var userData = new UserType();
            var userReadOnly = userData.$asReadOnly();

            userReadOnly.name = 'moshe';
            userReadOnly.age = 120;

            expect(userData.name).to.equal('leon');
            expect(userData.age).to.equal(10);
            expect(userReadOnly.name).to.equal('leon');
            expect(userReadOnly.age).to.equal(10);
        });

        it('should return wrapped data for none native immutable fields (like custom data)', function() {
            var userData = new UserWithChildType().$asReadOnly();

            var readOnlyChild = userData.child;
            readOnlyChild.name = 'modified name';

            expect(readOnlyChild instanceof UserType).to.equal(true);
            expect(readOnlyChild.name).to.equal('bobi');
        });

    });

    describe('Type invalidation', function() {
        describe('$isInvalidated()', function() {
            it('should return false for un modified data', function() {
                var userData = new UserType();
                expect(userData.$isInvalidated()).to.equal(false);
            });

            it('should return true for modified data', function() {
                var userData = new UserType();
                userData.name = 'gaga';
                expect(userData.$isInvalidated()).to.equal(true);
            });

            it('should return true for data when a child value has changed', function() {
                var userWithChildType = new UserWithChildType();
                userWithChildType.child.name = 'gaga';
                expect(userWithChildType.$isInvalidated()).to.equal(true);
            });

            xit('should return true for data when a child value has changed after isinvalidates was already called', function() {
                var userWithChildType = new UserWithChildType();
                expect(userWithChildType.$isInvalidated()).to.equal(false);
                userWithChildType.child.name = 'gaga';
                expect(userWithChildType.$isInvalidated()).to.equal(true);
            });

            it('should return false for data when only a parent/sibling value has changed', function() {
                var UserWith2ChildType = aDataTypeWithSpec({
                    child: UserType.withDefault({name: 'bobi', age: 13}),
                    child2: UserType.withDefault({name: 'chiki', age: 5})
                }, 'UserWith2ChildType');

                var userWith2ChildType = new UserWith2ChildType();

                userWith2ChildType.child.name = 'baga';
                expect(userWith2ChildType.child.$isInvalidated()).to.equal(true);
                expect(userWith2ChildType.child2.$isInvalidated()).to.equal(false);
            });
        });
        describe('$revalidate()', function() {
            it('should reset data invalidation', function() {
                var userData = new UserType();
                userData.name = 'gaga';
                expect(userData.$isInvalidated()).to.equal(true);
                userData.$revalidate();
                expect(userData.$isInvalidated()).to.equal(false);

            });

			xit('should not invalidate if same values are set', function() {
				var userData = new UserType();
                userData.name = 'gaga';
                expect(userData.$isInvalidated()).to.equal(true);
                userData.$revalidate();
			
				userData.name = 'gaga';
				
				expect(userData.$isInvalidated()).to.equal(false);
			});

            it('should reset deep data invalidation', function() {

                var userWithChildType = new UserWithChildType();
                userWithChildType.child.name = 'gaga';
                expect(userWithChildType.$isInvalidated()).to.equal(true);
                expect(userWithChildType.child.$isInvalidated()).to.equal(true);
                userWithChildType.$revalidate();
                expect(userWithChildType.$isInvalidated()).to.equal(false);
                expect(userWithChildType.child.$isInvalidated()).to.equal(false);
            });

        });
        describe('$resetValidationCheck()', function() {
            it('it Should allow isInvalidated to return true for data when a child value has changed after isinvalidates was already called', () => {
                var userWithChildType = new UserWithChildType();
                expect(userWithChildType.$isInvalidated()).to.equal(false);
                userWithChildType.child.name = 'gaga';
                expect(userWithChildType.$isInvalidated()).to.equal(false);
                userWithChildType.$resetValidationCheck();
                expect(userWithChildType.$isInvalidated()).to.equal(true);
            });

        });
    });
});
