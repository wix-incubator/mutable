import {expect} from 'chai';
import {Report} from 'escalate/dist/test-kit/testDrivers';
import {typeCompatibilityTest} from "../type-compatibility.contract";
import * as mu from '../../src';
import {ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR, ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR} from '../../test-kit/test-drivers/reports';
import {either} from '../../src/core/generic-types';


describe("defining", () => {
    describe("a es5map type", () => {
        var UserType, AddressType;
        before('define helper types', () => {
            UserType = mu.define('User', {
                spec: () => ({
                    name: mu.String.withDefault(''),
                    age: mu.Number.withDefault(10)
                })
            });

            AddressType = mu.define('Address', {
                spec: () => ({
                    address: mu.String.withDefault(''),
                    code: mu.Number.withDefault(10)
                })
            });
        });
        describe('as es5map<boolean> field', () => {
            it('should crash if supplied mu type as map default', () => {
                expect(() => mu.define('WithMapUser', {
                    spec: () => ({
                        map: mu.Es5Map.of(mu.Boolean).nullable().withDefault(
                            new mu.Es5Map.of(mu.Boolean)()
                        )
                    })
                })).to.throw();
            });
            it('should not crash if supplied empty object as map default', () => {
                expect(() => mu.define('WithMapUser', {
                    spec: () => ({
                        map: mu.Es5Map.of(mu.Boolean).nullable().withDefault({})
                    })
                })).not.to.throw();
            });
            describe('allowPlainVal', () => {

                it('should accept empty object', () => {
                    var allowPlainVal = mu.Es5Map.of(mu.Boolean).nullable().allowPlainVal({});
                    expect(allowPlainVal).to.be.true;
                });

                it('should accept object with _type', () => {
                    var allowPlainVal = mu.Es5Map.of(mu.Boolean).nullable().allowPlainVal({_type:'string-value'});
                    expect(allowPlainVal).to.be.true;
                });

                it('should accept object with boolean value', () => {
                    var allowPlainVal = mu.Es5Map.of(mu.Boolean).nullable().allowPlainVal({someKey:true});
                    expect(allowPlainVal).to.be.true;
                });

                it('should not accept object with mismatched types', () => {
                    var allowPlainVal = mu.Es5Map.of(mu.Boolean).nullable().allowPlainVal({someKey:'string-value'});
                    expect(allowPlainVal).to.be.false;
                });

            });

        });
        describe('with default value', () => {
            typeCompatibilityTest(() => mu.Es5Map.of(mu.String).withDefault({ lookAtMe: 'im special!' }));
        });
        describe("with missing sub-types", () => {
            it('should report error when instantiating vanilla Map', () => {
                var invalidMapType = mu.Es5Map;
                expect(() => new invalidMapType()).to.report(new Report('error', 'mutable.Es5Map', `Es5Map constructor: "➠Es5Map" Untyped Maps are not supported please state types of key and value in the format core3.Es5Map<SomeType>`));
            });
            it('should report error when defining Map with zero types', () => {
            expect(() => { let map = mu.Es5Map.of(); new map() }).to.report(new Report('error', 'mutable.Es5Map', `Es5Map constructor: "➠Es5Map" Missing types for map. Use Es5Map<SomeType>`));
            });
            it('should report error when defining Map with invalid subtype', () => {
                expect(() => { let map = mu.Es5Map.of(mu.List); new map() }).to.report(new Report('error', 'mutable.Es5Map', 'Es5Map constructor: "Es5Map<➠List>" Untyped Lists are not supported please state type of list item in the format core3.List<string>'));
            });
        });

        describe('with complex value sub-type', () => {
            function typeFactory() {
                return mu.Es5Map.of(AddressType);
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
                expect(() => typeFactory().create([[null, 'gaga']])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Es5Map<Address>', '<string>', 'null', 'Es5Map'));
            });
            it('should report error when null key is added', function() {
                expect(() => typeFactory().create([[5, null]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Es5Map<Address>', '<Address>', 'null', 'Es5Map'));
            });
            it('should report error when unallowed primitive key is added', function() {
                expect(() => typeFactory().create([[5, 'gaga']])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Es5Map<Address>', '<string>', 'number', 'Es5Map'));
            });
            it('should report error when unallowed primitive value is added', function() {
                expect(() => typeFactory().create([['baga', 'gaga']])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Es5Map<Address>', '<Address>', 'string', 'Es5Map'));
            });
            it('should report error when unallowed object key is added', function() {
                expect(() => typeFactory().create([[{}, new AddressType()]])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Es5Map<Address>', '<string>', 'object', 'Es5Map'));
            });
            it('should report error when when json value with unallowed _type is added', function() {
                expect(() => typeFactory().create([['baga', { _type: 'User' }]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Es5Map<Address>', '<Address>', 'object with _type User', 'Es5Map'));
            });
            it('should report error when unallowed mu key is added', function() {
                expect(() => typeFactory().create([[new UserType(), new AddressType()]])).to.report(ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR('Es5Map<Address>', '<string>', 'User', 'Es5Map'));
            });
            it('should report error when unallowed mu value is added', function() {
                expect(() => typeFactory().create([['gaga', new UserType()]])).to.report(ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR('Es5Map<Address>', '<Address>', 'User', 'Es5Map'));
            });
        });

        describe('with union value sub-type', () => {
            function typeFactory() {
                return mu.Es5Map.of(either(UserType, AddressType, mu.String));
            }
            typeCompatibilityTest(typeFactory);
            describe("instantiation", function() {
                let newUser, newUser2, newAddress;
                beforeEach(() => {
                    newUser = new UserType();
                    newUser2 = new UserType();
                    newAddress = new AddressType();
                });
                it('should keep mu objects passed to it that fit its subtypes', function() {
                    var mixedMap = typeFactory().create([['newUser', newUser], ['newUser2', newAddress]]);
                    expect(mixedMap.get('newUser')).to.equal(newUser);
                    expect(mixedMap.get('newUser2')).to.equal(newAddress);
                });
                it('should allow setting data with json and should default to first type, ', function() {
                    var map = typeFactory().create([['newUser', { someKey: 'gaga' }]]);
                    expect(map.get('newUser')).to.be.instanceOf(UserType);
                });
                it('should use _type field to detect which subtype to use when setting data with json, ', function() {
                    var map = typeFactory().create([['newUser', { _type: AddressType.id, address: 'gaga' }]]);
                    expect(map.get('newUser')).to.be.instanceOf(AddressType);
                    expect(map.get('newUser').address).to.equal('gaga');
                });
                it('should NOT validate the _type field on JSON value on create() ', function() {
                    const StringToNumber = mu.Es5Map.of(mu.Number);
                    const json = new StringToNumber({"key1":5}).toJSON(true, true);
                    expect(json._type).to.be.ok;
                    let map;
                    expect(function(){
                        map = StringToNumber.create(json);
                    }).to.not.throw();
                    expect(map.get('key1')).to.equal(5);
                });
                it('should NOT validate the _type field on JSON value on setValue() ', function() {
                    const StringToNumber = mu.Es5Map.of(mu.Number);
                    const json = new StringToNumber({"key1":5}).toJSON(true, true);
                    expect(json._type).to.be.ok;
                    let map = new StringToNumber();
                    expect(function(){
                        map.setValue(json);
                    }).to.not.throw();
                    expect(map.get('key1')).to.equal(5);
                });
                it('should NOT validate the _type field on JSON value on setValueDeep() ', function() {
                    const StringToNumber = mu.Es5Map.of(mu.Number);
                    const json = new StringToNumber({"key1":5}).toJSON(true, true);
                    expect(json._type).to.be.ok;
                    let map = new StringToNumber();
                    expect(function(){
                        map.setValueDeep(json);
                    }).to.not.throw();
                    expect(map.get('key1')).to.equal(5);
                });
                it('should detect primitives', function() {
                    var mixedMap = typeFactory().create([['newUser', 'gaga']]);
                    expect(mixedMap.get('newUser')).to.be.equal('gaga');
                });
            });
        });
        describe('with value type that is a union of maps', () => {
            function typeFactory() {
                return mu.Es5Map.of(either(mu.Es5Map.of(mu.String), mu.Es5Map.of(mu.Number)));
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
