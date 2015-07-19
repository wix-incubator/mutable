import _ from 'lodash';
import Typorama from '../src';
import {aDataTypeWithSpec} from '../test-kit/testDrivers/index';
import {expect, err} from 'chai';
import {revision} from '../src/lifecycle';
import {lifecycleContract} from './lifecycle.contract.spec.js';
import sinon from 'sinon';


describe('Nullable custom type', function() {

	var defaultUser = {
		name: 'leon', age: 10, address: 'no address'
	};

	var UserType = aDataTypeWithSpec({
		name: Typorama.String.withDefault(defaultUser.name),
		age: Typorama.Number.withDefault(defaultUser.age),
		address: Typorama.String.withDefault(defaultUser.address)
	}, 'User');

	var LoginType = {
		withNullableUser: defaultValue =>
			aDataTypeWithSpec({
				user: defaultValue === undefined
				? UserType.nullable()
				: UserType.nullable().withDefault(defaultValue)
			}),

		withUser: defaultValue =>
			aDataTypeWithSpec({
				user: defaultValue === undefined
					? UserType
					: UserType.withDefault(defaultValue)
			})
	};



    describe('type definition', function() {
		it('is able to describe itself (no defaults override)', function() {
			expect(LoginType.withNullableUser()).to.have.field('user')
				//.with.defaults(defaultUser)
				.of.type(UserType);
		});

		it('is able to describe itself (null defaults override)', function() {
			expect(LoginType.withNullableUser(null)).to.have.field('user')
				.with.defaults(null)
				.of.type(UserType);
		});

		it('throws error if trying to initialize non-nullable with a null', function () {
			expect(() => LoginType.withUser(null))
			.to.throw('Cannot assign null value to a type which is not defined as nullable.');
		});



    });

	describe('toJSON', function() {
		it('produces correct value for nullable field', function() {
			var login = new (LoginType.withNullableUser(null));
			expect(login.toJSON()).to.deep.equal({ user: null });
		});
	});

	describe('mutable instance', function() {

		describe('instantiation', function() {

			it('creates instance (no defaults override)',function(){
				var login = new (LoginType.withNullableUser())();
				expect(login.user.toJSON()).to.deep.equal(defaultUser);
			});


			it('creates instance (null defaults override)',function(){
				var login = new (LoginType.withNullableUser(null))();
				expect(login.user).to.be.null;
			});

			it('creates instance (null value from JSON)', function() {
				var login = new (LoginType.withNullableUser(null))({ user: null });
				expect(login.user).to.be.null;
			});

			it('throws error if trying to instantiate a non-nullable with a null value', function () {
				expect(() => new (LoginType.withUser(null))({ user: null }))
				.to.throw('Cannot assign null value to a type which is not defined as nullable.');
			})

		});

		describe('set', function() {
			it('nullable field to null', function(){
				var login = new (LoginType.withNullableUser())();
				login.user = null;
				expect(login.user).to.be.null;
				expect(login).to.be.dirty;
			});

			it('throws error while setting non-nullable field to null', function () {
				var login = new (LoginType.withUser())();
				expect(() => { login.user = null })
					.to.throw('Cannot assign null value to a type which is not defined as nullable.');
				expect(login.user).not.to.be.null;
			});
		});

		describe('setValue', function() {
            describe('with json input',function(){
                it('sets null value from an incoming JSON', function() {
					var login = new (LoginType.withNullableUser())();
					login.setValue({ user: null });
					expect(login.user).to.be.null;
					expect(login).to.be.dirty;
                });

				it('fails to set null value from an incoming JSON to a non-nullable field', function() {
					var login = new (LoginType.withUser())();
					expect(() => login.setValue({ user: null }))
						.to.throw('Cannot assign null value to a type which is not defined as nullable.');
					expect(login.user).not.to.be.null;
				});


            });
            describe.skip('with typorama input',function(){
				// This is weird, the input is typorama objects in a plain object - wtf?
                it('sets null value from a typorama object', function() {
					var source = new (LoginType.withNullableUser({ user: null }))();
					var login = new (LoginType.withNullableUser())();
					login.setValue(source);
					expect(login.user).to.be.null;
					exoect(login).to.be.dirty;
                });
                it('fails to set null value to non-nullable field from a (nullable) typorama object', function() {
					var source = new (LoginType.withNullableUser())({ user: null });
					var login = new (LoginType.withUser())();
					expect(() => login.setValue(source))
						.to.throw('Cannot assign null value to a type which is not defined as nullable.');
					expect(login.user).not.to.be.null;
                });
            })
		});
	});

});

describe('Nullable primitive type', function() {

	function unfoldFieldType(Type, fieldName, defaultValues) {
		return _.has(defaultValues, fieldName)
			? Type.withDefault(defaultValues[fieldName])
			: Type;
	}

	function pickDefValue() {
		return _.find(arguments, arg => !_.isUndefined(arg));
	}

	var defaultUser = {
		name: 'Mr. Monkey',
		age: 18,
		loggedIn: false,
		onLogIn: function () {}
	};

	var nullUser = {
		name: null,
		age: null,
		loggedIn: null,
		onLogIn: null
	};

	var build = {
		UserType: {
			withNullableFields: defaultValue =>
				aDataTypeWithSpec({
					name: Typorama.String.nullable().withDefault(pickDefValue(defaultValue, defaultUser.name)),
					age: Typorama.Number.nullable().withDefault(pickDefValue(defaultValue, defaultUser.age)),
					loggedIn: Typorama.Boolean.nullable().withDefault(pickDefValue(defaultValue, defaultUser.loggedIn)),
					onLogIn: Typorama.Function.nullable().withDefault(pickDefValue(defaultValue, defaultUser.onLogIn))
				}),
			withFields: defaultValue =>
				aDataTypeWithSpec({
					name: Typorama.String.withDefault(pickDefValue(defaultValue, defaultUser.name)),
					age: Typorama.Number.withDefault(pickDefValue(defaultValue, defaultUser.age)),
					loggedIn: Typorama.Boolean.withDefault(pickDefValue(defaultValue, defaultUser.loggedIn)),
					onLogIn: Typorama.Function.withDefault(pickDefValue(defaultValue, defaultUser.onLogIn))
				})
		},
		user: {
			withNullableFields: defaultValue => new (build.UserType.withNullableFields(defaultValue)),
			withFields: defaultValue => new (build.UserType.withFields(defaultValue))
		}
	};





	describe('type definition', function() {
		it('is able to describe itself (no defaults override)', function() {
			expect(build.UserType.withNullableFields()).to.have.field('name').of.type(Typorama.String);
			expect(build.UserType.withNullableFields()).to.have.field('age').of.type(Typorama.Number);
			expect(build.UserType.withNullableFields()).to.have.field('loggedIn').of.type(Typorama.Boolean);
			expect(build.UserType.withNullableFields()).to.have.field('onLogIn').of.type(Typorama.Function);
		});

		it('is able to describe itself (null defaults override)', function() {
			expect(build.UserType.withNullableFields(null)).to.have.field('name').of.type(Typorama.String);
			expect(build.UserType.withNullableFields(null)).to.have.field('age').of.type(Typorama.Number);
			expect(build.UserType.withNullableFields(null)).to.have.field('loggedIn').of.type(Typorama.Boolean);
			expect(build.UserType.withNullableFields(null)).to.have.field('onLogIn').of.type(Typorama.Function);
		});

		it('throws error if trying to initialize non-nullable with a null', function () {
			expect(() => build.UserType.withFields(null))
				.to.throw('Cannot assign null value to a type which is not defined as nullable.');
		});



	});

	describe('toJSON', function() {
		it('produces correct value for nullable field', function() {
			var user = build.user.withNullableFields(null);
			expect(user.toJSON()).to.deep.equal(nullUser);
		});
	});

	describe('mutable instance', function() {

		describe('instantiation', function() {

			it('creates instance (no defaults override)',function(){
				var user = build.user.withNullableFields();
				expect(user.toJSON()).to.deep.equal(defaultUser);
			});


			it('creates instance (null defaults override)',function(){
				var user = build.user.withNullableFields(null);
				expect(user.toJSON()).to.deep.equal(nullUser);
			});

			it('creates instance (null value from JSON)', function() {
				var user = new (build.UserType.withNullableFields(null))(nullUser);
				expect(user.toJSON()).to.deep.equal(nullUser);
			});

			it('throws error if trying to instantiate a non-nullable with a null value', function () {
				expect(() => new (build.UserType.withFields())(nullUser))
					.to.throw('Cannot assign null value to a type which is not defined as nullable.');
			})

		});

		describe('set', function() {
			it('nullable field to null', function(){
				var user = build.user.withNullableFields();
				user.name = null;
				user.age = null;
				user.loggedIn = null;
				user.onLogIn = null;
				expect(user.name).to.be.null;
				expect(user.age).to.be.null;
				expect(user.loggedIn).to.be.null;
				expect(user.onLogIn).to.be.null;
				expect(user).to.be.dirty;
			});

			// This test-case is skipped, because currently invalid assignment to primitive field doesn't throw
			// an exception. It should be un-skipped when the validation infrastracture is refactored
			it.skip('throws error while setting non-nullable field to null', function () {
				var user = build.user.withFields();

				expect(() => { user.name = null }).to.throw('Cannot assign null value to a type which is not defined as nullable.');
				expect(() => { user.age = null }).to.throw('Cannot assign null value to a type which is not defined as nullable.');
				expect(() => { user.loggedIn = null }).to.throw('Cannot assign null value to a type which is not defined as nullable.');
				expect(() => { user.onLogIn = null }).to.throw('Cannot assign null value to a type which is not defined as nullable.');

				expect(user).not.to.deep.equal(nullUser);
				expect(user).to.be.dirty;
			});

			it('ignores setting non-nullable field to null', function () {
				var user = build.user.withFields();
				user.name = null;
				user.age = null;
				user.loggedIn = null;
				user.onLogIn = null;
				expect(user).not.to.deep.equal(nullUser);
				expect(user).to.be.dirty;
			});
		});

		describe('setValue', function() {
			describe('with json input',function(){
				it('sets null value from an incoming JSON', function() {
					var user = build.user.withNullableFields();
					user.setValue(nullUser);
					expect(user.name).to.be.null;
					expect(user.age).to.be.null;
					expect(user.loggedIn).to.be.null;
					expect(user.onLogIn).to.be.null;
					expect(user).to.be.dirty;
				});

				it('fails to set null value from an incoming JSON to a non-nullable field', function() {
					var user = build.user.withFields();
					expect(() => user.setValue(nullUser))
						.to.throw('Cannot assign null value to a type which is not defined as nullable.');
					expect(user).not.to.deep.equal(nullUser);
					expect(user).not.to.be.dirty;
				});


			});
			describe.skip('with typorama input',function(){
				// This is weird, the input is typorama objects in a plain object - wtf?
				it('sets null value from a typorama object', function() {
					var source = build.user.withNullableFields(null);
					var user = build.user.withNullableFields();
					user.setValue(source);
					expect(user).to.deep.equal(nullUser);
					expect(user).to.be.dirty;
				});
				it('fails to set null value to non-nullable field from a (nullable) typorama object', function() {
					var source = new (LoginType.withNullableUser())({ user: null });
					var login = new (LoginType.withUser())();
					expect(() => login.setValue(source))
						.to.throw('Cannot assign null value to a type which is not defined as nullable.');
					expect(login.user).not.to.be.null;

					var source = build.user.withNullableFields(null);
					var user = build.user.withFields();
					expect(() => user.setValue(source))
						.to.throw('Cannot assign null value to a type which is not defined as nullable.');
					expect(user).not.to.deep.equal(nullUser);
					expect(user).not.to.be.dirty;
				});
			})
		});
	});

});
