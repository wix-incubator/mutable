import * as _ from 'lodash';
import {expect} from 'chai';

import * as mu from '../src';
import {aDataTypeWithSpec} from '../test-kit/test-drivers';
import {lifecycleContract} from './lifecycle.contract.spec';
import {ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR, ERROR_IN_SET, ERROR_IN_SET_VALUE, ERROR_IN_DEFAULT_VALUES} from '../test-kit/test-drivers/reports';

describe('Nullable custom type initialize', function() {

    it('should create primitive types with null', function() {

        var UserType = aDataTypeWithSpec({
            name: mu.String.nullable().withDefault(null)
        }, 'User');

        var user = new UserType();

        expect(user.name === null).to.equal(true);
        user.name = "Hi";
        expect(user.name === "Hi").to.equal(true);
        user.name = null;
        expect(user.name === null).to.equal(true);
    });

    it('should create complex types with null (readOnly)', function() {

        var Friend = aDataTypeWithSpec({
            name: mu.String.nullable().withDefault(null)
        }, 'User');

        var UserType = aDataTypeWithSpec({
            name: mu.String.nullable().withDefault(null),
            friend: Friend.nullable().withDefault(null)
        }, 'User');

        var user = new UserType();

        var readOnlyUser = user.$asReadOnly();

        expect(readOnlyUser.name === null).to.equal(true);
        expect(readOnlyUser.friend === null).to.equal(true);

    });

});

describe('Nullable custom type', function() {

    var defaultUser = {
        name: 'leon', age: 10, address: 'no address'
    };

    var UserType = aDataTypeWithSpec({
        name: mu.String.withDefault(defaultUser.name),
        age: mu.Number.withDefault(defaultUser.age),
        address: mu.String.withDefault(defaultUser.address)
    }, 'User');

    var build = {
        LoginType: {
            withNullableUser: defaultValue =>
                aDataTypeWithSpec({
                    user: defaultValue === undefined
                        ? UserType.nullable()
                        : UserType.nullable().withDefault(defaultValue)
                }, 'LoginType'),

            withStrictUser: defaultValue =>
                aDataTypeWithSpec({
                    user: defaultValue === undefined
                        ? UserType
                        : UserType.withDefault(defaultValue)
                }, 'LoginType')
        },

        login: {
            withNullableUser: defaultValue => new (build.LoginType.withNullableUser(defaultValue)),
            withStrictUser: defaultValue => new (build.LoginType.withStrictUser(defaultValue))
        }
    };



    describe('definition', function() {
        it('is able to describe itself (no defaults override)', function() {
            expect(build.LoginType.withNullableUser()).to.have.field('user')
                //.with.defaults(defaultUser)
                .of.type(UserType);
        });

        it('is able to describe itself (null defaults override)', function() {
            expect(build.LoginType.withNullableUser(null)).to.have.field('user')
                .with.defaults(null)
                .of.type(UserType);
        });

        it('reports error if trying to initialize non-nullable with a null', function() {
            expect(() => build.LoginType.withStrictUser(null))
                .to.report(ERROR_IN_DEFAULT_VALUES('LoginType.user', 'User', 'null'));
        });
    });

    describe('toJSON', function() {
        it('produces correct value for nullable field', function() {
            var login = build.login.withNullableUser(null);
            expect(login.toJSON()).to.deep.equal({ user: null });
        });
    });

    describe('toJS', function() {
        it('produces correct value for nullable field', function() {
            var NullFieldWithNoSerialization = aDataTypeWithSpec({
                func: mu.Function.nullable().withDefault(null)
            }, 'NullFieldWithNoSerialization');
            var data = new NullFieldWithNoSerialization({func:null});

            expect(data.toJSON()).to.deep.equal({ func: null });
        });
    });

    describe('mu instance', function() {

        describe('instantiation', function() {

            it('creates instance (no defaults override)', function() {
                var login = build.login.withNullableUser();
                expect(login.user.toJSON()).to.deep.equal(defaultUser);
            });


            it('creates instance (null defaults override)', function() {
                var login = build.login.withNullableUser(null);
                expect(login.user).to.be.null;
            });

            it('creates instance (null value from JSON)', function() {
                var login = new (build.LoginType.withNullableUser(null))({ user: null });
                expect(login.user).to.be.null;
            });

            it('reports error if trying to instantiate a non-nullable with a null value', function() {
                expect(() => new build.login.withStrictUser(null))
                    .to.report(ERROR_IN_DEFAULT_VALUES('LoginType.user', 'User', 'null'));
            })

        });

        describe('set', function() {
            it('nullable field to null', function() {
                var login = build.login.withNullableUser();
                login.user = null;
                expect(login.user).to.be.null;
                expect(login).to.be.dirty;
            });

            it('reports error while setting non-nullable field to null', function() {
                var login = build.login.withStrictUser();
                expect(() => { login.user = null }).to.report(ERROR_IN_SET('LoginType.user', 'User', 'null'));
                expect(login.user).not.to.be.null;
            });
        });

        describe('setValue', function() {
            describe('with json input', function() {
                it('sets null value from an incoming JSON', function() {
                    var login = build.login.withNullableUser();
                    login.setValue({ user: null });
                    expect(login.user).to.be.null;
                    expect(login).to.be.dirty;
                });

                it('fails to set null value from an incoming JSON to a non-nullable field and reports', function() {
                    var login = build.login.withStrictUser();
                    expect(() => login.setValue({ user: null }))
                        .to.report(ERROR_IN_SET_VALUE('LoginType.user', 'User', 'null'));
                    expect(login.user).not.to.be.null;
                });


            });
        });
    });

});

describe('Nullable primitive type', function() {
    function pickDefValue() {
        return _.find(arguments, arg => !_.isUndefined(arg));
    }

    var defaultUser = {
        name: 'Mr. Monkey',
        age: 18,
        loggedIn: false,
        onLogIn: function() { }
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
                    name: mu.String.nullable().withDefault(pickDefValue(defaultValue, defaultUser.name)),
                    age: mu.Number.nullable().withDefault(pickDefValue(defaultValue, defaultUser.age)),
                    loggedIn: mu.Boolean.nullable().withDefault(pickDefValue(defaultValue, defaultUser.loggedIn)),
                    onLogIn: mu.Function.nullable().withDefault(pickDefValue(defaultValue, defaultUser.onLogIn))
                }, 'User'),
            withStrictFields: defaultValue =>
                aDataTypeWithSpec({
                    name: mu.String.withDefault(pickDefValue(defaultValue, defaultUser.name)),
                    age: mu.Number.withDefault(pickDefValue(defaultValue, defaultUser.age)),
                    loggedIn: mu.Boolean.withDefault(pickDefValue(defaultValue, defaultUser.loggedIn)),
                    onLogIn: mu.Function.withDefault(pickDefValue(defaultValue, defaultUser.onLogIn))
                }, 'User'),
            withStrictName: defaultValue =>
                aDataTypeWithSpec({
                    name: mu.String.withDefault(pickDefValue(defaultValue, defaultUser.name)),
                    age: mu.Number.nullable().withDefault(defaultUser.age),
                    loggedIn: mu.Boolean.nullable().withDefault(defaultUser.loggedIn),
                    onLogIn: mu.Function.nullable().withDefault(defaultUser.onLogIn)
                }, 'User')
        },
        user: {
            withNullableFields: defaultValue => new (build.UserType.withNullableFields(defaultValue)),
            withStrictFields: defaultValue => new (build.UserType.withStrictFields(defaultValue))
        }
    };



    describe('type definition', function() {
        it('is able to describe itself (no defaults override)', function() {
            expect(build.UserType.withNullableFields()).to.have.field('name').of.type(mu.String);
            expect(build.UserType.withNullableFields()).to.have.field('age').of.type(mu.Number);
            expect(build.UserType.withNullableFields()).to.have.field('loggedIn').of.type(mu.Boolean);
            expect(build.UserType.withNullableFields()).to.have.field('onLogIn').of.type(mu.Function);
        });

        it('is able to describe itself (null defaults override)', function() {
            expect(build.UserType.withNullableFields(null)).to.have.field('name').of.type(mu.String);
            expect(build.UserType.withNullableFields(null)).to.have.field('age').of.type(mu.Number);
            expect(build.UserType.withNullableFields(null)).to.have.field('loggedIn').of.type(mu.Boolean);
            expect(build.UserType.withNullableFields(null)).to.have.field('onLogIn').of.type(mu.Function);
        });

        it('reports error if trying to initialize non-nullable with a null', function() {
            expect(() => build.UserType.withStrictName(null))
                .to.report(ERROR_IN_DEFAULT_VALUES('User.name', 'string', 'null'));
        });



    });

    describe('toJSON', function() {
        it('produces correct value for nullable field', function() {
            var user = build.user.withNullableFields(null);
            expect(user.toJSON()).to.deep.equal(nullUser);
        });
    });

    describe('mu instance', function() {

        describe('instantiation', function() {

            it('creates instance (no defaults override)', function() {
                var user = build.user.withNullableFields();
                expect(user.toJSON()).to.deep.equal(defaultUser);
            });


            it('creates instance (null defaults override)', function() {
                var user = build.user.withNullableFields(null);
                expect(user.toJSON()).to.deep.equal(nullUser);
            });

            it('creates instance (null value from JSON)', function() {
                var user = new (build.UserType.withNullableFields(null))(nullUser);
                expect(user.toJSON()).to.deep.equal(nullUser);
            });

            it('reports error if trying to instantiate a non-nullable with a null value', function() {
                expect(() => new (build.UserType.withStrictFields())({ name: null }))
                    .to.report(ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR("User.name", "string", "null"));
            })

        });

        describe('set', function() {
            it('nullable field to null', function() {
                var user = build.user.withNullableFields();
                user.name = null;
                user.age = null;
                user.loggedIn = null; ``
                user.onLogIn = null;
                expect(user.name).to.be.null;
                expect(user.age).to.be.null;
                expect(user.loggedIn).to.be.null;
                expect(user.onLogIn).to.be.null;
                expect(user).to.be.dirty;
            });

            // This test-case is skipped, because currently invalid assignment to primitive field doesn't throw
            // an exception. It should be un-skipped when the validation infrastracture is refactored
            it('reports error while setting non-nullable field to null', function() {
                var user = build.user.withStrictFields();

                expect(() => { user.name = null }).to.report(ERROR_IN_SET('User.name', 'string', 'null'));
                expect(() => { user.age = null }).to.report(ERROR_IN_SET('User.age', 'number', 'null'));
                expect(() => { user.loggedIn = null }).to.report(ERROR_IN_SET('User.loggedIn', 'boolean', 'null'));
                expect(() => { user.onLogIn = null }).to.report(ERROR_IN_SET('User.onLogIn', 'function', 'null'));

                expect(user).not.to.deep.equal(nullUser);
                expect(user).to.be.dirty;
            });
        });

        describe('setValue', function() {
            describe('with json input', function() {
                it('sets null value from an incoming JSON', function() {
                    var user = build.user.withNullableFields();
                    user.setValue(nullUser);
                    expect(user.name).to.be.null;
                    expect(user.age).to.be.null;
                    expect(user.loggedIn).to.be.null;
                    expect(user.onLogIn).to.be.null;
                    expect(user).to.be.dirty;
                });

                it('fails to set null value from an incoming JSON to a non-nullable field and reports', function() {
                    var user = build.user.withStrictFields();
                    expect(() => user.setValue(nullUser))
                        .to.report(ERROR_IN_SET_VALUE('User.age', 'number', 'null'));
                    expect(() => user.setValue(nullUser))
                        .to.report(ERROR_IN_SET_VALUE('User.name', 'string', 'null'));
                    expect(() => user.setValue(nullUser))
                        .to.report(ERROR_IN_SET_VALUE('User.loggedIn', 'boolean', 'null'));
                    expect(() => user.setValue(nullUser))
                        .to.report(ERROR_IN_SET_VALUE('User.onLogIn', 'function', 'null'));

                    expect(user).not.to.deep.equal(nullUser);
                    expect(user).not.to.be.dirty;
                });


            });
            describe('with mu input', function() {
                // This is weird, the input is mu objects in a plain object - wtf?
                it('sets null value from a mu object', function() {
                    var source = build.user.withNullableFields(null);
                    var user = build.user.withNullableFields();
                    user.setValue(source.toJSON());
                    expect(user.toJSON()).to.deep.equal(nullUser);
                });
                it('fails to set null value to non-nullable field from a (nullable) mu object and reports', function() {
                    var source = new (build.UserType.withNullableFields())({ name: null });
                    var user = new (build.UserType.withStrictFields())();
                    expect(() => user.setValue(source.toJSON()))
                        .to.report(ERROR_IN_SET_VALUE('User.name', 'string', 'null'));
                    expect(user.name).not.to.be.null;
                });
                it('fails to set null value to non-nullable field from a (nullable) mu object and reports', function() {
                    var source = build.user.withNullableFields(null);
                    var user = build.user.withStrictFields();
                    expect(() => user.setValue(source.toJSON()))
                        .to.report(ERROR_IN_SET_VALUE('User.name', 'string', 'null'));
                    expect(user).not.to.deep.equal(nullUser);
                });
            })
        });
    });
});
