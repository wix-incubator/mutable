import {expect} from 'chai';
import {Report} from 'escalate/dist/test-kit/testDrivers';

import {typeCompatibilityTest} from "../type-compatibility.contract";
import * as Typorama from '../../src';
import {ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR, ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR} from '../../test-kit/test-drivers/reports';
import {either} from '../../src/generic-types';


describe("defining", () => {
    describe("a map type", () => {
        var UserType, AddressType;
        before('define helper types', () => {
            UserType = Typorama.define('User', {
                spec: () => ({
                    name: Typorama.String.withDefault(''),
                    age: Typorama.Number.withDefault(10)
                })
            });

            AddressType = Typorama.define('Address', {
                spec: () => ({
                    address: Typorama.String.withDefault(''),
                    code: Typorama.Number.withDefault(10)
                })
            });
        });
        describe('as map<string, boolean> field', () => {
            it('should crash if supplied Typorama type as map default', () => {
                expect(() => Typorama.define('WithMapUser', {
                    spec: () => ({
                        map: Typorama.Map.of(Typorama.String, Typorama.Boolean).nullable().withDefault(
                            new Typorama.Map.of(Typorama.String, Typorama.Boolean)()
                        )
                    })
                })).to.throw();
            });
            it('should not crash if supplied empty object as map default', () => {
                expect(() => Typorama.define('WithMapUser', {
                    spec: () => ({
                        map: Typorama.Map.of(Typorama.String, Typorama.Boolean).nullable().withDefault({})
                    })
                })).not.to.throw();
            });
            it('allowPlainVal', () => {
                var allowPlainVal = Typorama.Map.of(Typorama.String, Typorama.Boolean).nullable().allowPlainVal({});
                expect(allowPlainVal).to.be.true;
            });
        });
        describe('with default value', () => {
            typeCompatibilityTest(() => Typorama.Map.of(Typorama.String, Typorama.String).withDefault({ lookAtMe: 'im special!' }));
        });
        describe("with missing sub-types", () => {
            it('should report error when instantiating vanilla Map', () => {
                var invalidMapType = Typorama.Map;
                expect(() => new invalidMapType()).to.report(new Report('error', 'Typorama.Map', `Map constructor: "➠Map" Untyped Maps are not supported please state types of key and value in the format core3.Map<string, string>`));
            });
            it('should report error when defining Map with zero types', () => {
            expect(() => { let map = Typorama.Map.of(); new map() }).to.report(new Report('error', 'Typorama.Map', `Map constructor: "➠Map" Missing types for map. Use Map<SomeType, SomeType>`));
            });
            it('should report error when defining Map with one type', () => {
                expect(() => { let map = Typorama.Map.of(Typorama.Number); new map() }).to.report('Map constructor: "Map<number,➠value>" Wrong number of types for map. Instead of Map<number> Use Map<string, number>');
            });
            it('should report error when defining Map with invalid subtype', () => {
                expect(() => { let map = Typorama.Map.of(Typorama.String, Typorama.List); new map() }).to.report(new Report('error', 'Typorama.Map', 'Map constructor: "Map<string,➠List>" Untyped Lists are not supported please state type of list item in the format core3.List<string>'));
            });
        });

        describe('with complex value sub-type', () => {
            function typeFactory() {
                return Typorama.Map.of(Typorama.String, AddressType);
            }

            typeCompatibilityTest(typeFactory);
            describe("instantiation", function() {
                it('should allow setting data with json, ', function() {

                    var map = typeFactory().create({ 'foo': { address: 'gaga' } });

                    expect(map.get('foo')).to.be.instanceOf(AddressType);
                    expect(map.get('foo').code).to.equal(10);
                    expect(map.get('foo').address).to.equal('gaga');
                });
            });
            it('should report error when null key is added', function() {
                expect(() => typeFactory().create([[null, 'gaga']])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Map<string, Address>', '<string>', 'null'));
            });
            it('should report error when null key is added', function() {
                expect(() => typeFactory().create([[5, null]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Map<string, Address>', '<Address>', 'null'));
            });
            it('should report error when unallowed primitive key is added', function() {
                expect(() => typeFactory().create([[5, 'gaga']])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Map<string, Address>', '<string>', 'number'));
            });
            it('should report error when unallowed primitive value is added', function() {
                expect(() => typeFactory().create([['baga', 'gaga']])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Map<string, Address>', '<Address>', 'string'));
            });
            it('should report error when unallowed object key is added', function() {
                expect(() => typeFactory().create([[{}, new AddressType()]])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Map<string, Address>', '<string>', 'object'));
            });
            it('should report error when when json value with unallowed _type is added', function() {
                expect(() => typeFactory().create([['baga', { _type: 'User' }]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Map<string, Address>', '<Address>', 'object with _type User'));
            });
            it('should report error when unallowed typorama key is added', function() {
                expect(() => typeFactory().create([[new UserType(), new AddressType()]])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Map<string, Address>', '<string>', 'User'));
            });
            it('should report error when unallowed typorama value is added', function() {
                expect(() => typeFactory().create([['gaga', new UserType()]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Map<string, Address>', '<Address>', 'User'));
            });
        });

        describe('with complex key sub-type', () => {
            function typeFactory() {
                return Typorama.Map.of(UserType, Typorama.String);
            }
            typeCompatibilityTest(typeFactory);
            it('should report error when null key is added', function() {
                expect(() => typeFactory().create([[null, 'gaga']])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Map<User, string>', '<User>', 'null'));
            });
            it('should report error when null value is added', function() {
                expect(() => typeFactory().create([[new UserType(), null]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Map<User, string>', '<string>', 'null'));
            });
            it('should report error when unallowed primitive key is added', function() {
                expect(() => typeFactory().create([['baga', 'gaga']])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Map<User, string>', '<User>', 'string'));
            });
            it('should report error when unallowed primitive value is added', function() {
                expect(() => typeFactory().create([[new UserType(), 5]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Map<User, string>', '<string>', 'number'));
            });
            it('should report error unallowed object value is added', function() {
                expect(() => typeFactory().create([[new UserType(), new UserType()]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Map<User, string>', '<string>', 'User'));
            });
            it('should report error when when json key with unallowed _type is added', function() {
                expect(() => typeFactory().create([[{ _type: 'Address' }, 'gaga']])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Map<User, string>', '<User>', 'object with _type Address'));
            });
            it('should report error when unallowed typorama key is added', function() {
                expect(() => typeFactory().create([[new AddressType(), 'gaga']])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Map<User, string>', '<User>', 'Address'));
            });
            it('should report error when unallowed typorama value is added', function() {
                expect(() => typeFactory().create([[new UserType(), new AddressType()]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Map<User, string>', '<string>', 'Address'));
            });
        });

        describe('with complex key sub-type and union value sub-type', () => {
            function typeFactory() {
                return Typorama.Map.of(UserType, either(UserType, AddressType, Typorama.String));
            }
            typeCompatibilityTest(typeFactory);
            describe("instantiation", function() {
                let newUser, newUser2, newAddress;
                beforeEach(() => {
                    newUser = new UserType();
                    newUser2 = new UserType();
                    newAddress = new AddressType();
                });
                it('should keep typorama objects passed to it that fit its subtypes', function() {
                    var mixedMap = typeFactory().create([[newUser, newUser], [newUser2, newAddress]]);
                    expect(mixedMap.get(newUser)).to.equal(newUser);
                    expect(mixedMap.get(newUser2)).to.equal(newAddress);
                });
                it('should allow setting data with json and should default to first type, ', function() {
                    var map = typeFactory().create([[newUser, { someKey: 'gaga' }]]);
                    expect(map.get(newUser)).to.be.instanceOf(UserType);
                });
                it('should use _type field to detect which subtype to use when setting data with json, ', function() {
                    var map = typeFactory().create([[newUser, { _type: AddressType.id, address: 'gaga' }]]);
                    expect(map.get(newUser)).to.be.instanceOf(AddressType);
                    expect(map.get(newUser).address).to.equal('gaga');
                });
                it('should detect primitives', function() {
                    var mixedMap = typeFactory().create([[newUser, 'gaga']]);
                    expect(mixedMap.get(newUser)).to.be.equal('gaga');
                });
            });
        });
        describe('with value type that is a union of maps', () => {
            function typeFactory() {
                return Typorama.Map.of(Typorama.String,
                    either(Typorama.Map.of(Typorama.String, Typorama.String),
                        Typorama.Map.of(Typorama.String, Typorama.Number)));
            }
            typeCompatibilityTest(typeFactory);
            describe("instantiation", function() {
                it('should allow setting data with array', function() {
                    var mixedMap = typeFactory().create([['foo', [['bar', 'baz']]], ['foo2', [['bar2', 2]]]]);
                    expect(mixedMap.get('foo').get('bar')).to.equal('baz');
                    expect(mixedMap.get('foo2').get('bar2')).to.equal(2);
                });
                it('should allow setting data with json', function() {
                    var mixedMap = typeFactory().create({ foo: { bar: 'baz' }, foo2: { bar2: 2 } });
                    expect(mixedMap.get('foo').get('bar')).to.equal('baz');
                    expect(mixedMap.get('foo2').get('bar2')).to.equal(2);
                });
            });
        });
    });
});
