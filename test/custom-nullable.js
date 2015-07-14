import _ from 'lodash';
import Typorama from '../src';
import {aDataTypeWithSpec} from '../test-kit/testDrivers/index';
import {expect, err} from 'chai';
import {revision} from '../src/lifecycle';
import {lifecycleContract} from './lifecycle.contract.spec.js';
import sinon from 'sinon';


describe('Custom data (nullable)', function() {

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
					debugger;
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
