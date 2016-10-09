import {expect} from 'chai';
import {Report} from 'escalate/dist/test-kit/testDrivers';

import {typeCompatibilityTest} from "../type-compatibility.contract";
import * as Mutable from '../../src';
import {ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR, ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR} from '../../test-kit/test-drivers/reports';
import {either} from '../../src/generic-types';


describe("defining", () => {
    describe("a map type", () => {
        var UserType, AddressType;
        before('define helper types', () => {
            UserType = Mutable.define('User', {
                spec: () => ({
                    name: Mutable.String.withDefault(''),
                    age: Mutable.Number.withDefault(10)
                })
            });

            AddressType = Mutable.define('Address', {
                spec: () => ({
                    address: Mutable.String.withDefault(''),
                    code: Mutable.Number.withDefault(10)
                })
            });
        });
        describe('as map<string, boolean> field', () => {
            it('should crash if supplied Mutable type as map default', () => {
                expect(() => Mutable.define('WithMapUser', {
                    spec: () => ({
                        map: Mutable.Map.of(Mutable.String, Mutable.Boolean).nullable().withDefault(
                            new Mutable.Map.of(Mutable.String, Mutable.Boolean)()
                        )
                    })
                })).to.throw();
            });
            it('should not crash if supplied empty object as map default', () => {
                expect(() => Mutable.define('WithMapUser', {
                    spec: () => ({
                        map: Mutable.Map.of(Mutable.String, Mutable.Boolean).nullable().withDefault({})
                    })
                })).not.to.throw();
            });
            it('allowPlainVal', () => {
                var allowPlainVal = Mutable.Map.of(Mutable.String, Mutable.Boolean).nullable().allowPlainVal({});
                expect(allowPlainVal).to.be.true;
            });
        });
        describe('with default value', () => {
            typeCompatibilityTest(() => Mutable.Map.of(Mutable.String, Mutable.String).withDefault({ lookAtMe: 'im special!' }));
        });
        describe('when create Custom Type', () => {
            var CustomType;
            var Map;
            before('define Custom Type and Map which uses Custom Type for values', () => {
                CustomType = Mutable.define('CustomType', {
                    spec: () => ({
                        value   : Mutable.String.withDefault('value'),
                        selector: Mutable.String.withDefault('selector')
                    })
                });
                Map = Mutable.Map.of(Mutable.String, CustomType);
            });
            describe('with valid object', () => {
                it('should not fail', function() {
                    expect(() => {
                        new Map({
                            a: {value: 'new value', selector: 'new selector'},
                            b: {value: 'new value for b', selector: 'new selector for b'},
                        });
                    }).to.not.throw();
                });
            });
            describe('with invalid object', () => {
                it('should fail with type mismatch', function() {
                    expect(() => {
                        new Map({a: {another: 'type', of: 'object'}}); // perhaps also with:  _type:'CustomType'
                    }).to.throw();
                });
            });
        });
        describe("with missing sub-types", () => {
            it('should report error when instantiating vanilla Map', () => {
                var invalidMapType = Mutable.Map;
                expect(() => new invalidMapType()).to.report(new Report('error', 'Mutable.Map', `Map constructor: "➠Map" Untyped Maps are not supported please state types of key and value in the format core3.Map<string, string>`));
            });
            it('should report error when defining Map with zero types', () => {
            expect(() => { let map = Mutable.Map.of(); new map() }).to.report(new Report('error', 'Mutable.Map', `Map constructor: "➠Map" Missing types for map. Use Map<SomeType, SomeType>`));
            });
            it('should report error when defining Map with one type', () => {
                expect(() => { let map = Mutable.Map.of(Mutable.Number); new map() }).to.report('Map constructor: "Map<number,➠value>" Wrong number of types for map. Instead of Map<number> Use Map<string, number>');
            });
            it('should report error when defining Map with invalid subtype', () => {
                expect(() => { let map = Mutable.Map.of(Mutable.String, Mutable.List); new map() }).to.report(new Report('error', 'Mutable.Map', 'Map constructor: "Map<string,➠List>" Untyped Lists are not supported please state type of list item in the format core3.List<string>'));
            });
        });

        describe('with complex value sub-type', () => {
            function typeFactory() {
                return Mutable.Map.of(Mutable.String, AddressType);
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
            it('should report error when unallowed mutable key is added', function() {
                expect(() => typeFactory().create([[new UserType(), new AddressType()]])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Map<string, Address>', '<string>', 'User'));
            });
            it('should report error when unallowed mutable value is added', function() {
                expect(() => typeFactory().create([['gaga', new UserType()]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Map<string, Address>', '<Address>', 'User'));
            });
        });

        describe('with complex key sub-type', () => {
            function typeFactory() {
                return Mutable.Map.of(UserType, Mutable.String);
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
            it('should report error when unallowed mutable key is added', function() {
                expect(() => typeFactory().create([[new AddressType(), 'gaga']])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Map<User, string>', '<User>', 'Address'));
            });
            it('should report error when unallowed mutable value is added', function() {
                expect(() => typeFactory().create([[new UserType(), new AddressType()]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Map<User, string>', '<string>', 'Address'));
            });
        });

        describe('with complex key sub-type and union value sub-type', () => {
            function typeFactory() {
                return Mutable.Map.of(UserType, either(UserType, AddressType, Mutable.String));
            }
            typeCompatibilityTest(typeFactory);
            describe("instantiation", function() {
                let newUser, newUser2, newAddress;
                beforeEach(() => {
                    newUser = new UserType();
                    newUser2 = new UserType();
                    newAddress = new AddressType();
                });
                it('should keep mutable objects passed to it that fit its subtypes', function() {
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
                it('should NOT validate the _type field on JSON value, ', function() {
                    const StringToNumber = Mutable.Map.of(Mutable.String, Mutable.Number);
                    let map;
                    expect(function(){
                         map = StringToNumber.create({_type:'Map', "key1":5});
                    }).to.not.throw();
                    expect(map.get('key1')).to.equal(5);
                });
                it('should detect primitives', function() {
                    var mixedMap = typeFactory().create([[newUser, 'gaga']]);
                    expect(mixedMap.get(newUser)).to.be.equal('gaga');
                });
            });
        });
        describe('with value type that is a union of maps', () => {
            function typeFactory() {
                return Mutable.Map.of(Mutable.String,
                    either(Mutable.Map.of(Mutable.String, Mutable.String),
                        Mutable.Map.of(Mutable.String, Mutable.Number)));
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
