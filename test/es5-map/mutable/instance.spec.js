import {expect} from 'chai';
import * as sinon from 'sinon';

import * as mu from '../../../src';
import {getMobxLogOf} from '../../../test-kit/test-drivers';

import * as builders from '../builders';

var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

function mapEntries(map) {
    let entries = [];
    map.forEach((v, k) => entries.push([k, v]));
    return entries;
}
function objEntries(obj) {
    return  Object.keys(obj).map((key) => [key, obj[key]]);
}
function testReadFunctionality(builders, isReadonly) {
    describe(typeOfObj(isReadonly) + ' instance', () => {
        var userA, userB, usersMap, usersMapInitialState;
        beforeEach('init example data', () => {
            userA = new builders.UserType({ age: 1000 });
            userB = new builders.UserType({ age: 1001 });
            usersMapInitialState = [['userA', userA], ['userB', userB]];
            usersMap = builders.aUserTypeMap(usersMapInitialState);
        });

        describe('as field on data object', () => {
            var GroupType;
            before(() => {
                GroupType = mu.define('GroupType', {
                    spec: function() {
                        return {
                            title: mu.String,
                            users: mu.Es5Map.of(builders.UserType)
                        };
                    }
                });
            });
            it('Should be instantiatable ', () => {
                expect(() => new GroupType()).not.to.throw();
            });
            it('Should be modified from json ', () => {
                var groupData = new GroupType();
                groupData.users = mu.Es5Map.of(builders.UserType).create({
                    tom: { 'name': 'tom', 'age': 25 },
                    omri: { 'name': 'omri', 'age': 35 }
                });
                expect(groupData.users.get('tom').name).to.equal('tom');
                expect(groupData.users.get('tom').age).to.equal(25);
                expect(groupData.users.get('omri').name).to.equal('omri');
                expect(groupData.users.get('omri').age).to.equal(35);
            });
        });

        describe('size', function() {
            it('should reflect number of entries in map', function() {
                var numbers = builders.aNumberMap({ 1: 1, 2: 2, 3: 3 });
                expect(numbers.size).to.equal(3);
            });
        });

        describe('toJSON', () => {
            it('should return entries json object by default', () => {
                expect(usersMap.toJSON()).to.eql({'userA': userA.toJSON(), 'userB': userB.toJSON()});
            });
            it('should return typed entries json object if set to typed', () => {
                expect(usersMap.toJSON(true, true)).to.eql({'userA': userA.toJSON(true, true), 'userB': userB.toJSON(true, true), _type: "Es5Map"});
            });
            it('should return entries object if not recursive', () => {
                expect(usersMap.toJSON(false).userA).to.equal(userA);
                expect(usersMap.toJSON(false).userB).to.equal(userB);
            });
            it('should expose ' + typeOfObj(isReadonly) + ' entries', () => {
                expect(usersMap.toJSON(false).userA.$isReadOnly(), 'value is readonly').to.equal(isReadonly);
            });
            it('should return empty object if empty', () => {
                const jsonModel = {};
                var numbersMap = builders.aNumberMap(jsonModel);
                expect(numbersMap.toJSON()).to.eql(jsonModel);
            });
        });

        describe('toJS', function(){

            it('should call toJS on values that implement it', function(){
                const serializableType = builders.UserType;
                const Es5Map = mu.Es5Map.of(serializableType);

                const serializableItem = new serializableType();
                serializableItem.toJS = () => 'called';

                const map = new Es5Map({'foo' : serializableItem});
                const res = map.toJS();
                expect(res.foo).to.eql('called');
            });

        });

        describe('clear', () => {
            if (isReadonly) {
                it('should not change map', () => {
                    const jsonModel = { a: 1 };
                    var numbers = builders.aNumberMap(jsonModel);
                    numbers.clear();
                    expect(numbers.toJSON()).to.eql(jsonModel);
                });
            } else {
                it('should remove all elements', () => {
                    var numbers = builders.aNumberMap({ a: 1 });
                    numbers.clear();
                    expect(numbers.toJSON()).to.eql({});
                });
            }
        });

        describe('delete', () => {
            describe('when called with non-existing key', () => {
                it('should not change map ', () => {
                    const jsonModel = { a: 1 };
                    var numbers = builders.aNumberMap(jsonModel);
                    numbers.delete('b');
                    expect(numbers.toJSON()).to.eql(jsonModel);
                });
                it('should return false', () => {
                    var numbers = builders.aNumberMap({ a: 1 });
                    expect(numbers.delete('b')).to.eql(false);
                });
            });
            describe('when called with existing key', () => {
                if (isReadonly) {
                    it('should not change map', () => {
                        const jsonModel = { a: 1 };
                        var numbers = builders.aNumberMap(jsonModel);
                        numbers.delete('a');
                        expect(numbers.toJSON()).to.eql(jsonModel);
                    });
                    it('should return false', () => {
                        var numbers = builders.aNumberMap({ a: 5 });
                        expect(numbers.delete('a')).to.equal(false);
                    });
                } else {
                    it('should remove matching element', () => {
                        var numbers = builders.aNumberMap({ a: 1 });
                        numbers.delete('a');
                        expect(numbers.toJSON()).to.eql({});
                    });
                    it('should support a mu object as an argument', () => {
                        usersMap.delete('userA');
                        expect(usersMap.toJSON(false)).to.eql({userB});
                    });
                    it('should return true', () => {
                        var numbers = builders.aNumberMap({ a: 5 });
                        expect(numbers.delete('a')).to.equal(true);
                    });
                }
            });
        });
        describe('entries', () => {
            it('should return an array of the map elements', () => {
                var array = mapEntries(builders.aNumberMap({ a: 1, b: 2 }));
                expect(array).to.eql([['a', 1], ['b', 2]]);
            });

            it('should expose ' + typeOfObj(isReadonly) + ' entries', () => {
                var element = usersMap.entries()[0];

                expect(element[1].$isReadOnly(), 'value is readonly').to.equal(isReadonly);
            });
        });

        describe('forEach', () => {
            it('should iterate over the map elements', () => {
                var ctx = { count: 0 };
                var map = builders.aNumberMap({ a: 1 });
                map.forEach(function(val, key, collection) {
                    this.count++;
                    expect(val, 'value').to.equal(1);
                    expect(key, 'key').to.equal('a');
                    expect(collection, 'collection itself passed as 3rd argument').to.equal(map);
                    expect(this, 'context argument').to.equal(ctx);
                }, ctx);
                expect(ctx.count, 'how many iterations').to.eql(1);
            });

            it('should expose ' + typeOfObj(isReadonly) + ' entries', () => {
                usersMap.forEach((val, key) => {
                    expect(val.$isReadOnly(), 'value is readonly').to.equal(isReadonly);
                });
            });
        });
        describe('get', () => {
            it('should return stored value', () => {
                expect(usersMap.get('userA'), 'get1').to.equal(userA);
                expect(usersMap.get('userB'), 'get2').to.equal(userB);
            });
            it('should return undefined if no stored value', () => {
                expect(usersMap.get('foo')).to.equal(undefined);
            });
            it('should return ' + typeOfObj(isReadonly) + ' entries', () => {
                expect(usersMap.get('userA').$isReadOnly()).to.equal(isReadonly);
            });
        });

        describe('has', () => {
            it('should return true if a value exists for supplied key', () => {
                expect(usersMap.has('userB')).to.equal(true);
                expect(usersMap.has('userA')).to.equal(true);
            });
            it('should return false if no stored value', () => {
                expect(usersMap.has('foo')).to.equal(false);
            });
        });

        describe('keys', () => {
            it('should return an array of the map keys', () => {
                var array = builders.aNumberMap({ a: 1, b: 2 }).keys();
                expect(array).to.eql(['a', 'b']);
            });
        });

        describe('set', () => {
            if (isReadonly) {
                it('should not change map', () => {
                    const jsonModel = { a: 1 };
                    var numbers = builders.aNumberMap(jsonModel);
                    numbers.set('a', 5);
                    numbers.set('b', 5);
                    expect(numbers.toJSON()).to.eql(jsonModel);
                });
            } else {
                it('should replace an existing element', () => {
                    var numbers = builders.aNumberMap({ a: 1 });
                    numbers.set('a', 5);
                    expect(numbers.toJSON()).to.eql({ a: 5 });
                });
                it('should add an element if none exists', () => {
                    var numbers = builders.aNumberMap();
                    numbers.set('a', 42);
                    expect(numbers.toJSON()).to.eql({ a: 42 });
                });
                it('should support a mu object as an argument', () => {
                    usersMap.set('userA', userB).set('userB', userB).set('userA', userA);
                    expect(usersMap.toJSON(false)).to.eql({userB, userA});
                });
                describe('lifecycleManager', function() {
                    let map, manager, child;
                    beforeEach(()=>{
                        manager = new LifeCycleManager();
                        map = new mu.Es5Map.of(builders.UserType)({child});
                        map.$setManager(manager);
                        child = new builders.UserType();
                        sinon.spy(child, '$setManager');
                    });
                    if (context.dirtyableElements) {
                        it('sets lifecycle manager in newly added elements', function() {
                            map.set('foo', child);
                            expect(child.$setManager).to.have.been.calledWithExactly(manager);
                        });
                        it('does not try to set lifecycle manager in read-only newly added elements', function() {
                            map.set('foo', child.$asReadOnly());
                            expect(child.$setManager).to.have.not.been.calledWithExactly(manager);
                        });
                    }
                });
            }
            it('should return the map', () => {
                var numbers = builders.aNumberMap({ a: 5 });
                expect(numbers.set('a', 42)).to.equal(numbers);
            });
        });

        describe('values', () => {
            it('should return an array of the map values', () => {
                var array = builders.aNumberMap({ a: 1, b: 2 }).values();
                expect(array).to.eql([1, 2]);
            });

            it('should expose ' + typeOfObj(isReadonly) + ' values', () => {
                var element = usersMap.values()[0];

                expect(element.$isReadOnly(), 'value is readOnly').to.equal(isReadonly);
            });
        });

        describe('setValue', () => {

            it('with same state should not change or get dirty if values are not changed', function() {
                var log = getMobxLogOf(()=> usersMap.setValue(usersMapInitialState), usersMap.__value__);
                expect(log).to.be.empty;
            });
            describe('with a new state', () => {
                let newValue, log;
                beforeEach('change value', () => {
                    newValue = [['userA', userB], ['userB', userB]];
                    log = getMobxLogOf(()=> usersMap.setValue(newValue), usersMap.__value__);
                });
                if (isReadonly) {
                    it('should not change', function() {
                        expect(objEntries(usersMap.__value__.toJS()), 'entries array').to.eql(usersMapInitialState);
                    });
                    it('should not set map as dirty', function() {
                        expect(log).to.be.empty;
                    });
                } else {
                    it('should only leave the new state', function() {
                        expect(usersMap.entries()).to.eql(newValue);
                    });
                    it('should set map as dirty', function() {
                        expect(log).not.to.be.empty;
                    });
                    describe('lifecycleManager', function() {
                        let map, manager, child;
                        beforeEach(()=>{
                            manager = new LifeCycleManager();
                            map = new mu.Es5Map.of(builders.UserType)({child});
                            map.$setManager(manager);
                            child = new builders.UserType();
                            sinon.spy(child, '$setManager');
                        });
                        if (context.dirtyableElements) {
                            it('sets lifecycle manager in newly added elements', function() {
                                map.setValue([['foo', child]]);
                                expect(child.$setManager).to.have.been.calledWithExactly(manager);
                            });
                            it('does not try to set lifecycle manager in read-only newly added elements', function() {
                                map.setValue([['foo', child.$asReadOnly()]]);
                                expect(child.$setManager).to.have.not.been.calledWithExactly(manager);
                            });
                        }
                    });
                }
            });

        });
        describe('setValueDeep', () => {

            it('with same state should not change or get dirty if values are not changed', function() {
                var log = getMobxLogOf(()=> usersMap.setValue(usersMapInitialState), usersMap.__value__);
                expect(log).to.be.empty;
                expect(objEntries(usersMap.__value__.toJS()), 'entries array').to.eql(usersMapInitialState);
            });
            describe('with a new state', () => {
                let userC, newValue, log;
                beforeEach('change value', () => {
                    userC = new builders.UserType({ name: 'katanka' });
                    newValue = [['userA', userA], ['userB', userC], ['userC', userA]];
                    log = getMobxLogOf(()=> usersMap.setValue(newValue), usersMap.__value__);
                });
                if (isReadonly) {
                    it('should not change', function() {
                        expect(objEntries(usersMap.__value__.toJS()), 'entries array').to.eql(usersMapInitialState);
                    });
                    it('should not set map as dirty', function() {
                        expect(log).to.be.empty;
                    });
                } else {
                    it('should change data of map to new state', function() {
                        expect(usersMap.size).to.eql(3);
                        expect(usersMap.toJSON(), 'data in map').to.eql(builders.aUserTypeMap(newValue).toJSON());
                    });
                    it('should not replace instances of existing mappings', function() {
                        expect(usersMap.get('userA')).to.equal(userA);
                        expect(usersMap.get('userB')).to.equal(userC);
                    });
                    it('should add new mappings if missing', function() {
                        expect(usersMap.get('userC')).to.equal(userA);
                    });
                    it('should set map as dirty', function() {
                        expect(log).not.to.be.empty;
                    });
                    describe('lifecycleManager', function() {
                        let map, manager, child;
                        beforeEach(()=>{
                            manager = new LifeCycleManager();
                            map = new mu.Es5Map.of(builders.UserType)({child});
                            map.$setManager(manager);
                            child = new builders.UserType();
                            sinon.spy(child, '$setManager');
                        });
                        if (context.dirtyableElements) {
                            it('sets lifecycle manager in newly added elements', function() {
                                map.setValueDeep([['foo', child]]);
                                expect(child.$setManager).to.have.been.calledWithExactly(manager);
                            });
                            it('does not try to set lifecycle manager in read-only newly added elements', function() {
                                map.setValueDeep([['foo', child.$asReadOnly()]]);
                                expect(child.$setManager).to.have.not.been.calledWithExactly(manager);
                            });
                        }
                    });
                }
            });
            if (!isReadonly) {
                describe('on a map with union type value', () => {
                    let map, cheese, oldValue, newValue;
                    beforeEach('change value', () => {
                        cheese = new builders.CheeseType({ name: 'brie' });

                        oldValue = [['a', userA], ['b', userB], ['c', userB]];
                        newValue = [['a', userA], ['b', cheese]];
                        map = builders.aUnionTypeMap(oldValue);
                    });
                    it('should change data of map to new state', function() {
                        map.setValueDeep(newValue);
                        expect(map.size, 'map.size').to.eql(2);
                        expect(map.toJSON(), 'data of map').to.eql(builders.aUnionTypeMap(newValue).toJSON());
                        expect(map.keys(), 'data of keys of map').to.eql(['a', 'b']);
                    });
                    it('should not replace instances of existing mappings', function() {
                        map.setValueDeep(newValue);
                        expect(map.get('a')).to.equal(userA);
                        expect(map.get('b')).to.equal(cheese);
                    });
                    it('should remove new mappings if missing from new value', function() {
                        map.setValueDeep(newValue);
                        expect(map.get('c')).to.be.undefined;
                    });
                    it('should set map as dirty', function() {
                        var log = getMobxLogOf(()=> map.setValueDeep(newValue), map.__value__);
                        expect(log).not.to.be.empty;
                    });
                });
                it('should create new value if value is read only', function() {
                    userA = new builders.UserType({ name: 'zaphod', age: 42 }).$asReadOnly();
                    let map = builders.aUnionTypeMap([['a', userA]]);

                    var log = getMobxLogOf(()=> map.setValueDeep([['a', { child: { name: 'zagzag' } }]]), map.__value__);
                    expect(log).not.to.be.empty;
                    expect(userA).to.not.equal(map.get('a'));
                });
                it('complex children props should be set to default if not specified', function() {
                    let map = builders.aUnionTypeMap([['a', { name: 'zagzag' }]]);

                    map.setValueDeep([['a', { age: 1 }]]);

                    expect(map.get('a').name).to.equal(new builders.UserType().name);
                });
            }
        });
    });
}

function typeOfObj(isReadonly) {
    return isReadonly ? 'read only' : 'mutable';
}

describe('Es5 Map', function() {
    testReadFunctionality(builders, false);
    testReadFunctionality(builders.asReadOnly(), true);
});
