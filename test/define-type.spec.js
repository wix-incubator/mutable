import {expect} from 'chai';
import {Report} from 'escalate/dist/test-kit/testDrivers';
import {aDataTypeWithSpec, getMobxLogOf} from '../test-kit/test-drivers';

import * as mutable from '../src';
import {either} from '../src/core/generic-types';
import {ERROR_BAD_TYPE, ERROR_OVERRIDE_FIELD, ERROR_FIELD_MISMATCH_IN_LIST_CONSTRUCTOR, ERROR_IN_DEFAULT_VALUES, ERROR_IN_FIELD_TYPE, ERROR_MISSING_GENERICS, ERROR_RESERVED_FIELD, arrow} from '../test-kit/test-drivers/reports';
import {typeCompatibilityTest} from "./type-compatibility.contract";

describe('defining', () => {
    let Type1, Type2;
    before('define types', () => {
        Type1 = aDataTypeWithSpec({ foo: mutable.String }, 'Type1');
        Type2 = aDataTypeWithSpec({ type: Type1 }, 'Type2');
    });
    describe('String with default value', () => {
        typeCompatibilityTest(() => mutable.String.withDefault('im special!'), true);
    });

    describe('Number with default value', () => {
        typeCompatibilityTest(() => mutable.Number.withDefault(6), true);
    });

    describe('Boolean with default value', () => {
        typeCompatibilityTest(() => mutable.Boolean.withDefault(true), true);
    });

    it('a subclass without propper mutable definition', function() {
        class MyType extends mutable.Object{}
        expect(() => {
            new MyType();
        }).to.report(ERROR_BAD_TYPE('Object', 'MyType'));
    });

    it('a defined subclass that uses Any as a polymorphic field', function() {
        const Type = aDataTypeWithSpec({ wrapped: mutable.Any }, 'Type');
        expect(new Type().toJS()).to.eql({wrapped:{}});
    });

    it('a defined subclass that uses MuBase as a polymorphic field', function() {
        const Type = aDataTypeWithSpec({ wrapped: mutable.Base }, 'Type');
        expect(new Type().toJS()).to.eql({wrapped:{}});
    });

    it('a defined subclass that uses MuObject as a polymorphic field', function() {
        const Type = aDataTypeWithSpec({ wrapped: mutable.Object }, 'Type');
        expect(new Type().toJS()).to.eql({wrapped:{}});
    });

    describe('a defined subclass that declares overriding methods', function() {
        let Parent, Child;
        beforeEach(() => {
           class Foo extends mutable.Object{
                static wrapValue(){return 'foo';}
                toJS(...args){return 'bar';}
            }
            Parent = mutable.define('Parent', {
                staticTransitiveOverrides:['wrapValue'],
                transitiveOverrides:['toJS'],
                spec: ()=>({})
            }, undefined, Foo);
            Child = mutable.define('Child', {
                spec: ()=>({ wrapped: mutable.Number })
            }, Parent);
        });
        it('prevents mutable from from overriding a static method.', function() {
            expect(Parent.wrapValue()).to.eql('foo');
        });
        it('prevents mutable from from overriding an instance method.', function() {
            expect(new Parent().toJS()).to.eql('bar');
        });
        it('prevents mutable from from overriding a static method for sub classes', function() {
            expect(Child.wrapValue()).to.eql('foo');
        });
        it('prevents mutable from from overriding an instance method for sub classes', function() {
            expect(new Child().toJS()).to.eql('bar');
        });
    });

    describe('a basic type', () => {

        typeCompatibilityTest(() => Type2);

        describe('that is isomorphic to another type', () => {
            it('should result in two compatible types', () => {
                new Type2(new Type1({ foo: "bar" }));
                expect(() => new Type2(new Type1({ foo: "bar" }))).not.to.report({ level: /warn|error|fatal/ });
            })
        });

        it('should allow defining types with primitive fields', function() {
            var primitives = mutable.define('primitives', {
                spec: () => ({
                    name: mutable.String.withDefault('leon'),
                    child1: mutable.String,
                    child2: mutable.String
                })
            });
            expect(new primitives().name).to.equal('leon');
        });

        it('should allow defining types with custom fields', function() {
            var primitives = mutable.define('primitives', {
                spec: () => ({
                    name: mutable.String.withDefault('leon'),
                    child1: mutable.String,
                    child2: mutable.String
                })
            });
            var composite = mutable.define('composite', {
                spec: () => ({
                    child: primitives
                })
            });
            expect(new composite().child.name).to.equal('leon');
        });

        it('should report error if field type is not valid', function() {
            expect(function() {
                mutable.define('invalid', {
                    spec: () => ({
                        zagzag: {}
                    })
                });
            }).to.report(ERROR_IN_FIELD_TYPE('invalid.zagzag'));
        });

        it('should report error if field type is missing', function() {
            expect(function() {
                mutable.define('invalid', {
                    spec: () => ({
                        zagzag: null
                    })
                });
            }).to.report(ERROR_IN_FIELD_TYPE('invalid.zagzag'));
        });

        it('should report error for reserved keys', function() { // ToDo: change to fields that start with $ and __
            expect(() => {
                mutable.define('invalid', {
                    spec: () => ({
                        $asReadOnly: mutable.String
                    })
                });
            }).to.report(ERROR_RESERVED_FIELD('invalid.$asReadOnly'));
        });

        describe('type with inheritance', function() {
            const StringList = mutable.List.of(mutable.String);
            var TypeWithTitles;
            var TypeWithInheritance;

            before('define types', function() {
                TypeWithTitles = mutable.define('TypeWithTitles', {
                    spec: () => ({
                        titles: StringList
                    })
                });
                TypeWithInheritance = mutable.define('TypeWithInheritance', {
                    spec: () => ({
                        subTitles: StringList
                    })
                },TypeWithTitles);
            });

            it('should throw error if fields intersect', function() {
                expect(()=>{mutable.define('TypeWithBrokenInheritance', {
                    spec: () => ({
                        titles: StringList
                    })
                },TypeWithTitles)}).to.throw(ERROR_OVERRIDE_FIELD('TypeWithBrokenInheritance.titles','TypeWithTitles'));
            });

            it('spec should include all fields', function() {
                expect(TypeWithInheritance._spec).to.eql({
                    titles: StringList,
                    subTitles: StringList
                })
            });

            it('should include default values for all fields', function() {
                expect(TypeWithInheritance.defaults()).to.eql({
                    titles: [],
                    subTitles: []
                });
            });

            it('should include getters setters for all fields', function() {
                const dataItem = new TypeWithInheritance();

                expect(dataItem.titles.length).to.equal(0);
                dataItem.titles.push('cell0');
                expect(dataItem.titles.at(0)).to.equal('cell0');
                expect(dataItem.subTitles.length).to.equal(0);
                dataItem.subTitles.push('cell0');
                expect(dataItem.subTitles.at(0)).to.equal('cell0');
            });

            it('should be dirtified when any field from super type is changed', function() {
                const dataItem = new TypeWithInheritance();
                var log = getMobxLogOf(()=> dataItem.titles.push('something'), dataItem.titles.__value__);
                expect(log).not.to.be.empty;
            });

            it('should be dirtified when any field from type definition is changed', function() {
                const dataItem = new TypeWithInheritance();
                var log = getMobxLogOf(()=> dataItem.subTitles.push('something'), dataItem.subTitles.__value__);
                expect(log).not.to.be.empty;
            });

        });

        describe('type with generic field', function() {
            it('should throw error if field doesnt include generics info', function() {
                expect(() => {
                    mutable.define('invalid', {
                        spec: () => ({
                            zagzag: mutable.List
                        })
                    });
                }).to.report(ERROR_MISSING_GENERICS(`invalid.zagzag`));
            });
            it('should throw error if field subtypes are invalid', function() {
                expect(() => {
                    mutable.define('invalid', {
                        spec: () => ({
                            zagzag: mutable.List.of(mutable.String, function() { })
                        })
                    });
                }).to.report(ERROR_IN_FIELD_TYPE(`invalid.zagzag<string|${arrow}subtype>`));
            });
            it('should throw error if field subtypes dont include generics info', function() {
                expect(() => {
                    mutable.define('invalid', {
                        spec: () => ({
                            zagzag: mutable.List.of(mutable.List)
                        })
                    });
                }).to.report(ERROR_MISSING_GENERICS(`invalid.zagzag<${arrow}List>`));
            });

            it('should throw error if field subtypes have invalid generics info', function() {
                expect(() => {
                    mutable.define('invalid', {
                        spec: () => ({
                            zagzag: mutable.List.of(mutable.List.of(function() { }))
                        })
                    });
                }).to.report(ERROR_IN_FIELD_TYPE(`invalid.zagzag<${arrow}List>`));
            });

            it('should allow fields of the same type', function() {
                const NodeType = mutable.define('Node', {
                    spec: (Node) => ({
                        children: mutable.List.of(Node),
                        parent: Node.nullable()
                    })
                });
                const node = new NodeType();
                expect(node.toJSON()).to.eql({ children: [], parent: null });
                node.parent = new NodeType();
                expect(node.toJSON()).to.eql({ children: [], parent: { children: [], parent: null } });
                node.children.push(new NodeType());
                expect(node.toJSON()).to.eql({ children: [{ children: [], parent: null }], parent: { children: [], parent: null } });
            });

            it.skip('report circular default data', function() {/* ToDo */ });

        });

    });//Type definition error: "invalid.zagzag:List<string|⚠subtype⚠>" must be a primitive type or extend core3.Type

    describe('type with default value', function() {
        typeCompatibilityTest(() => Type1.withDefault({ foo: 'im special!' }));

        it('should clone the previous type definition', function() {
            var originalType = mutable.String;
            originalType.options = {};

            var customDefaultType = originalType.withDefault('im special!');

            expect(customDefaultType).not.to.equal(originalType);
            expect(customDefaultType.options).not.to.equal(originalType.options);
        });
    });

    describe('nullable type', function() {

        it('should clone the previous type definition and options', function() {
            var originalType = mutable.String;
            originalType.options = { randomConfig: { someOption: true } };

            var customDefaultType = originalType.nullable();

            expect(customDefaultType).not.to.equal(originalType);
            expect(customDefaultType.options).not.to.equal(originalType.options);
            expect(customDefaultType.options).to.eql({
                randomConfig: { someOption: true },
                nullable: true
            });
        });

    });

    describe("collection", () => {
        var UserType, AddressType;
        before('define helper types', () => {
            UserType = mutable.define('User', {
                spec: () => ({
                    name: mutable.String.withDefault(''),
                    age: mutable.Number.withDefault(10)
                })
            });
            AddressType = mutable.define('Address', {
                spec: () => ({
                    address: mutable.String.withDefault(''),
                    code: mutable.Number.withDefault(10)
                })
            });
        });

        describe("a List type", () => {
            it('as a nullable field should not crash if supplied null as default', () => {
                expect(() =>
                    mutable.define('WithList', {
                        spec: () => ({
                            nullList: mutable.List.of(mutable.String).nullable().withDefault(null)
                        })
                    })).not.to.throw();
            });
            describe("with no sub-types", () => {
                it('should report error when instantiating', () => {
                    var inValidArrType = mutable.List;
                    expect(() => new inValidArrType()).to.report(new Report('error', 'mutable.List', 'List constructor: Untyped Lists are not supported please state type of list item in the format core3.List<string>'));
                });
            });
            describe('with complex element sub-type', () => {
                typeCompatibilityTest(function typeFactory() {
                    return mutable.List.of(UserType);
                });
                describe("instantiation", function() {
                    it('should keep mu objects passed to it that fit its subtypes', function() {
                        var newUser = new UserType();
                        var newAddress = new AddressType();

                        var mixedList = mutable.List.of(either(UserType, AddressType)).create([newUser, newAddress]);

                        expect(mixedList.at(0)).to.eql(newUser);
                        expect(mixedList.at(1)).to.eql(newAddress);
                    });
                    it('single subtype List should allow setting data with json, ', function() {
                        var mixedList = mutable.List.of(AddressType).create([{ address: 'gaga' }]);
                        expect(mixedList.at(0)).to.be.instanceOf(AddressType);
                        expect(mixedList.at(0).code).to.be.eql(10);
                        expect(mixedList.at(0).address).to.be.eql('gaga');

                    });

                    it('a multi subtype List should default to first object based types for json', function() {
                        var mixedList = mutable.List.of(either(AddressType, UserType)).create([{}]);

                        expect(mixedList.at(0)).to.be.instanceOf(AddressType);

                    });
                    it('a multi subtype List should detect primitives', function() {
                        var mixedList = mutable.List.of(either(AddressType, UserType, mutable.String)).create(['gaga']);

                        expect(mixedList.at(0)).to.be.eql('gaga');
                    });
                    it('a multi subtype List should use _type field to detect which subtype to use', function() {
                        var mixedList = mutable.List.of(either(AddressType, UserType, mutable.String)).create([{ _type: 'User' }]);

                        expect(mixedList.at(0)).to.be.instanceOf(UserType);
                    });
                    it('should report error when unallowed primitive is added', function() {
                        var ListCls = mutable.List.of(AddressType);
                        expect(function() { ListCls.create(['gaga']) }).to.report(ERROR_FIELD_MISMATCH_IN_LIST_CONSTRUCTOR('List<Address>[0]', '<Address>', 'string'));

                        ListCls = mutable.List.of(mutable.Number);
                        expect(function() { ListCls.create(['gaga']) }).to.report(ERROR_FIELD_MISMATCH_IN_LIST_CONSTRUCTOR('List<number>[0]', '<number>', 'string'));
                    });

                    it('should report error when object is added an no object types allowed', function() {
                        var ListCls = mutable.List.of(mutable.String);
                        expect(function() { ListCls.create([{}]) }).to.report(ERROR_FIELD_MISMATCH_IN_LIST_CONSTRUCTOR('List<string>[0]', '<string>', 'object'));
                    });

                    it('should report error when unallowed mu is added', function() {
                        var ListCls = mutable.List.of(UserType);
                        expect(function() { ListCls.create([new AddressType()]) }).to.report(ERROR_FIELD_MISMATCH_IN_LIST_CONSTRUCTOR('List<User>[0]', '<User>', 'Address'));
                    });

                    it('should report error when json with unallowed _type added', function() {
                        var ListCls = mutable.List.of(UserType);
                        expect(function() { ListCls.create([{ _type: 'Address' }]) }).to.report(ERROR_FIELD_MISMATCH_IN_LIST_CONSTRUCTOR('List<User>[0]', '<User>', 'object with _type Address'));
                    });

                });

            });
            describe('with union element sub-type', () => {
                typeCompatibilityTest(function typeFactory() {
                    return mutable.List.of(either(UserType, AddressType));
                });
            });
            describe("with default values", function() {

                typeCompatibilityTest(() => mutable.List.of(mutable.String).withDefault(['im special!']));

                var list, TestType, testType, GroupType;
                before(() => {
                    GroupType = mutable.define('GroupType', {
                        spec: function() {
                            return {
                                title: mutable.String,
                                users: mutable.List.of(UserType)
                            };
                        }
                    });
                });

                before("instantiate with create", function() {
                    list = mutable.List.of(mutable.String).create(["Beyonce", "Rihanna", "Britney", "Christina"]);
                });

                before("define a List type with default", function() {
                    TestType = mutable.define('TestType', {
                        spec: () => ({
                            names: mutable.List.of(mutable.String).withDefault(["Beyonce", "Rihanna", "Britney", "Christina"])
                        })
                    });
                });

                before("instantiate a type with default List", function() {
                    testType = new TestType();
                });

                it("should have correct initial values in instances", function() {
                    expect(list.length).to.equal(4);
                    expect(list.at(0)).to.equal("Beyonce");
                    expect(list.at(1)).to.equal("Rihanna");
                    expect(list.at(2)).to.equal("Britney");
                    expect(list.at(3)).to.equal("Christina");
                });

                it("should have correct initial values in withDefaults", function() {
                    expect(testType.names.length).to.equal(4);
                    expect(testType.names.at(0)).to.equal("Beyonce");
                    expect(testType.names.at(1)).to.equal("Rihanna");
                    expect(testType.names.at(2)).to.equal("Britney");
                    expect(testType.names.at(3)).to.equal("Christina");
                });

                it('Should accept mu.Object as default value', function() {
                    var defaultGroupData = new GroupType({
                        title: 'Title',
                        users: [
                            {'name':'tom', 'age':25},
                            {'name':'omri', 'age':35}
                        ]
                    });
                    var NewType = GroupType.withDefault(defaultGroupData);
                    var groupData = new NewType();
                    expect(groupData.users.at(0).name).to.equal('tom');
                    expect(groupData.users.at(0).age).to.equal(25);
                    expect(groupData.users.at(1).name).to.equal('omri');
                    expect(groupData.users.at(1).age).to.equal(35);
                });

            });
        });
    });
});
