import * as sinon from 'sinon';
import {expect} from 'chai';

import * as mu from '../src';
import {aDataTypeWithSpec, getMobxLogOf} from '../test-kit/test-drivers';
import {ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR, ERROR_IN_SET, ERROR_IN_SET_VALUE, ERROR_IN_SET_VALUE_DEEP, ERROR_ATTEMPTING_TO_OVERRIDE_READONLY} from '../test-kit/test-drivers/reports';

describe('Custom data', function() {
    let User, UserWithChild, UserWithNullableChild, CompositeContainer, VeryCompositeContainer, PrimitivesContainer, WithNonSerializable;
    before(() => {
        User = aDataTypeWithSpec({
            name: mu.String.withDefault('leon'),
            age: mu.Number.withDefault(10),
            address: mu.String.withDefault('no address')
        }, 'User');

        UserWithChild = aDataTypeWithSpec({
            name: mu.String.withDefault('leon'),
            child: User.withDefault({ name: 'bobi', age: 13 })
        }, 'UserWithChild');

        UserWithNullableChild = aDataTypeWithSpec({
            name: mu.String.withDefault('leon'),
            child: User.nullable().withDefault(null)
        }, 'UserWithNullableChild');

        CompositeContainer = aDataTypeWithSpec({
            name: mu.String.withDefault('leon'),
            child1: User,
            child2: User
        }, 'CompositeContainer');

        VeryCompositeContainer = aDataTypeWithSpec({
            child1: UserWithChild
        }, 'VeryCompositeContainer');

        PrimitivesContainer = aDataTypeWithSpec({
            name: mu.String.withDefault('leon'),
            child1: mu.String,
            child2: mu.String
        }, 'PrimitivesContainer');

        WithNonSerializable = aDataTypeWithSpec({
            func: mu.Function,
            str: mu.String
        }, 'WithNonSerializable');

    });
    describe('Type MuObject', function() {
        it('should be able to describe itself', function() {
            expect(User).to.have.field('name').with.defaults('leon').of.type(mu.String);
            expect(User).to.have.field('age').with.defaults(10).of.type(mu.Number);
        });
    });

    describe('$setManager', function() {
        let object, manager;
        beforeEach(()=>{
            manager = new mu.LifeCycleManager();
            object = new UserWithChild();
            sinon.spy(object.child, '$setManager');
        });
        it('with existing different manager does not change the manager and reports error', function() {
            object.__lifecycleManager__ = manager;
            expect(() => object.$setManager(new mu.LifeCycleManager())).to.report({ level: /error/ });
            expect(object.__lifecycleManager__, 'container manager').to.equal(manager);
        });
        it('when no existing manager changes the manager field', function() {
            expect(() => object.$setManager(manager)).not.to.report({ level: /error/ });
            expect(object.__lifecycleManager__, 'container manager').to.equal(manager);
        });
        it('when no existing manager changes the manager field of child elements', function() {
            expect(() => object.$setManager(manager)).not.to.report({ level: /error/ });
            expect(object.child.$setManager).to.have.been.calledWithExactly(manager);
        });
        it('in readonly form does not report an error', function() {
            expect(() => object.$asReadOnly().$setManager(manager)).to.not.report({ level: /error/ });
        });
        it('with invalid type reports an error', function() {
            expect(() => object.$setManager({})).to.report({ level: /error/ });
        });
    });

    describe('toJSON', function() {
        it('should take a mutable object, and return a native object', function() {
            var container = new UserWithChild({ child: { age: 11 } });

            expect(container.toJSON(), 'toJSON() called').to.eql(
                { name: new UserWithChild().name, child: new User({ age: 11 }).toJSON() });
            expect(container.toJSON(false), 'toJSON(false) called').to.eql(
                { name: new UserWithChild().name, child: container.__value__.child });
            expect(container.toJSON(true, true), 'toJSON(true, true) called').to.eql(
                { _type: 'UserWithChild', name: new UserWithChild().name, child: new User({ age: 11 }).toJSON(true, true) });
        });

        /** ToDo: change toJSON to output serializable value only */
        it.skip('should allow keeping none serializable values', function(){
            const funcVal = () => {};
            var type = new WithNonSerializable({ str:'val', func:funcVal });

            expect(type.toJSON()).to.eql({ str:type.str, func:'' });
        });
    });

    describe('toJS', function() {

        it('should try get reference non serializable values', function(){
            const funcVal = () => {};
            var data = new WithNonSerializable({ str:'val', func:funcVal });

            const result = data.toJS();

            expect(result.func).to.equal(funcVal);
            expect(result.str).to.equal('val');
        });

        it('should offer type flag output', function(){
            const funcVal = () => {};
            var data = new WithNonSerializable({ str:'val', func:funcVal });

            const result = data.toJS(true);

            expect(result._type).to.equal('WithNonSerializable');
            expect(result.func).to.equal(funcVal);
            expect(result.str).to.equal('val');
        });

    });

    describe('validate', function() {
        it('should allow json with matching fields', function() {
            expect(User.validate({
                name:'yossi',
                age:5,
                address:'homeless'
            })).to.be.equal(true);
        });
        it("should not allow json with wrong fields", function() {
            expect(User.validate({
                name:'yossi',
                age:'5',
                address:'homeless'
            })).to.be.equal(false);
        });

        it("should not allow primitives", function() {
            expect(User.validate(true)).to.be.equal(false);
        });
        it("should not allow undefined", function() {
            expect(User.validate(undefined)).to.be.equal(false);
        });
    });

    describe('default', function() {
        it('should chain', function() {
            var typeWithDefaultBob = User.withDefault({ name: 'joe' }).withDefault({ name: 'bob' });

            var a = typeWithDefaultBob.defaults();

            expect(a.name).to.equal('bob');
        });
    });
    describe('mutable instance', function() {

        describe('instantiation', function() {

            it('should accept values from json', function() {
                var userData = new User({ name: 'yoshi', age: 50 });

                expect(userData.name).to.equal('yoshi');
                expect(userData.age).to.equal(50);
            });

            it("should not modify original json object", function() {
                var CustomType = aDataTypeWithSpec({
                    name: mu.String.withDefault("Gordon Shumway"),
                    planet: mu.String.withDefault("Melmac")
                }, "CustomType");
                var original = { name: "Lilo" };
                var inst = new CustomType(original);
                expect(original).to.deep.equal({ name: "Lilo" });
            });

            it("should not keep references to original json objects", function() {
                var CustomType = aDataTypeWithSpec({
                    name: mu.String.withDefault("Gordon Shumway"),
                    planet: mu.String.withDefault("Melmac")
                }, "CustomType");
                var original = { name: "Lilo" };
                var inst = new CustomType(original);
                original.name = "Alf";
                expect(inst.name).to.be.equal("Lilo");
            });

            it("should not keep references to original json objects, even deep ones", function() {

                var InnerType = aDataTypeWithSpec({
                    name: mu.String.withDefault("Gordon Shumway")
                }, "InnerType");
                var OuterType = aDataTypeWithSpec({
                    name: InnerType
                }, "OuterType");

                var original = { name: { name: "Lilo" } };
                var inst = new OuterType(original);
                original.name.name = "Alf";
                expect(inst.name.name).to.be.equal("Lilo");
            });

            it("should not modify original List", function() {
                var CustomType = aDataTypeWithSpec({
                    names: mu.List.of(mu.String)
                }, "CustomType");

                var original = { names: ["Lilo", "Stitch"] };
                var inst = new CustomType(original);
                expect(original).to.deep.equal({ names: ["Lilo", "Stitch"] });
            });

            it("should not keep references to original List", function() {
                var CustomType = aDataTypeWithSpec({
                    names: mu.List.of(mu.String)
                }, "CustomType");
                var original = { names: ["Lilo", "Stitch"] };
                var inst = new CustomType(original);
                original.names[0] = "Wendell Pleakley";
                expect(inst.names.at(0)).to.be.equal("Lilo");
            });

            it('should provide default values when no initial data is provided', function() {
                var userData = new User();

                expect(userData).to.be.a.dataInstance.with.fields((field) => {
                    field.to.be.defaultValue();
                });
            });

            it('should provide default values for missing fields', function() {
                var userData = new User({});

                expect(userData).to.be.a.dataInstance.with.fields((field) => {
                    field.to.be.defaultValue();
                });
            });

            it('should not provide default values for provided fields', function() {
                var userData = new User({ age: 53 });

                expect(userData.age).to.equal(53);
            });



            it('should not copy fields that do not appear in the schema', function() {
                var instance = new User({ numOfHeads: 2 });

                expect(instance.numOfHeads).to.be.undefined;
            });

            it('should reference matching mutable objects passed as value', function() {
                var instance = new User();

                var container = new CompositeContainer({ child1: instance });
                expect(container.child1).to.be.equal(instance);
            });

            describe('initial value errors', function() {
                it('throw error for non nullable field receiving null', function() {
                    expect(() => new User({ name: null }))
                        .to.report(ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR('User.name', 'string', 'null'))
                });
                it('throw error for field type mismatch', function() {
                    expect(() => new User({ age: 'gaga' }))
                        .to.report(ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR('User.age', 'number', 'string'))
                });
                it("report correct path for field type mismatch in deep field", function() {
                    var container = new VeryCompositeContainer();
                    expect(() => new VeryCompositeContainer({ child1: { child: { age: "666" } } }))
                        .to.report(ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR('VeryCompositeContainer.child1.child.age', 'number', 'string'));
                });
            });

            describe('getRuntimeId():', function() {
                it('should be auto generated and unique', function() {
                    var sourceData = { numOfHeads: 2 };
                    var instance = new User(sourceData);
                    var instance2 = new User(sourceData);
                    expect(instance.getRuntimeId()).to.equal(instance.getRuntimeId());
                    expect(instance.getRuntimeId()).not.to.equal(instance2.getRuntimeId());
                });
            });
        });

        describe('set', function() {
            var ImageType, ProductType, StateType;

            before('setup types', () => {
                ImageType = aDataTypeWithSpec({
                    src: mu.String.withDefault('default.jpg')
                }, 'ImageType');

                ProductType = aDataTypeWithSpec({
                    image: ImageType,
                    title: mu.String.withDefault('default title')
                }, 'ProductType');

                StateType = aDataTypeWithSpec({
                    product: ProductType.withDefault({
                        image: { src: 'original.jpg' },
                        title: 'original title'
                    }),
                    relatedProducts: mu.List.of(ProductType),
                    stringAndNumbers: mu.List.of([mu.String, mu.Number])
                }, 'StateType');
            });

            it('should not set data that does not fit the schema', function() {
                var state = new StateType();
                var image = new ImageType();
                var productPrevRef = state.product;

                expect(() => state.product = image).to.report(ERROR_IN_SET('StateType.product', 'ProductType', 'ImageType'));
                expect(state.product).to.be.equal(productPrevRef);
                expect(state.product.title).to.be.equal('original title');
                expect(state.product.image.src).to.be.equal('original.jpg');
            });

            it('should set data that fit the schema', function() {
                var state = new StateType();
                var newProduct = new ProductType();

                state.product = newProduct;

                expect(state.product).to.be.equal(newProduct);
            });


            //TODO: what to do?
            xit('should not set data that has different options', function() {
                var state = new StateType();
                var booleanList = new (mu.List.of(mu.Boolean))([]);
                var relatedProductsPrevRef = state.relatedProducts;
                var stringAndNumbersPrevRef = state.stringAndNumbers;

                expect(() => state.relatedProducts = booleanList).to.report({ level: /error/ });
                expect(() => state.stringAndNumbers = booleanList).to.report({ level: /error/ });

                expect(state.relatedProducts).to.be.equal(relatedProductsPrevRef);
                expect(state.stringAndNumbers).to.be.equal(stringAndNumbersPrevRef);
            });

            it('should set data that has equivalent options', function() {
                var state = new StateType();
                var productList = new (mu.List.of(ProductType))([]);
                var stringAndNumbersList = new (mu.List.of([mu.String, mu.Number]))([]);
                var relatedProductsPrevRef = state.relatedProducts;
                var stringAndNumbersPrevRef = state.stringAndNumbers;
                state.relatedProducts = productList;
                state.stringAndNumbers = stringAndNumbersList;

                expect(state.relatedProducts).to.be.equal(productList);
                expect(state.stringAndNumbers).to.be.equal(stringAndNumbersList);
            });

            it('should not replace data that does not fit the schema', function() {
                var state = new StateType();
                var titlePrevVal = state.product.title;

                expect(() => state.product.title = {}).to.report(ERROR_IN_SET('ProductType.title', 'string', 'object'));

                expect(state.product.title).to.be.equal(titlePrevVal);
            });

            it('should replace primitive data that fit the schema', function() {
                var state = new StateType();

                state.title = 'new title';

                expect(state.title).to.be.equal('new title');
            });

            describe('complex value', function() {
                let object, manager, child;
                beforeEach(()=>{
                    manager = new mu.LifeCycleManager();
                    object = new UserWithChild();
                    object.$setManager(manager);
                    child = new User();
                    sinon.spy(child, '$setManager');
                });

                it('should use passed data object as field value', function() {
                    object.child = child;
                    expect(object.child).to.equal(child);
                });

                it('sets lifecycle manager in newly added elements', function() {
                    object.child = child;
                    expect(child.$setManager).to.have.been.calledWithExactly(manager);
                });
                it('does not try to set lifecycle manager in read-only newly added elements', function() {
                    object.child = child.$asReadOnly();
                    expect(child.$setManager).to.have.not.been.calledWithExactly(manager);
                });
            });

        });

        function valueSetterSuite(setterName) {
            describe('with json input', function() {
                it('should set all values from an incoming JSON according to schema', function() {
                    var instance = new User({ address: '21 jump street' });

                    instance[setterName]({ name: 'zaphod', age: 42 });

                    expect(instance.name).to.equal('zaphod');
                    expect(instance.age).to.equal(42);
                });

                it('should copy field values rather than the nested value, so that further changes to the new value will not propagate to the instance', function() {
                    var instance = new User();
                    var wrapped = { name: 'zaphod' };
                    instance[setterName](wrapped);

                    wrapped.name = 'ford';

                    expect(instance.name).to.equal('zaphod');
                });

                it('should ignore fields that appear in the passed object but not in the type schema', function() {
                    var instance = new User();

                    instance[setterName]({ numOfHeads: 2 });

                    expect(instance.numOfHeads).to.be.undefined;
                });

                it('should not invalidate if fields haven\'t changed', function() {
                    var instance = new UserWithChild();
                    var instance2 = new User();
                    instance[setterName]({ child: instance2 });
                    var log = getMobxLogOf(()=> instance[setterName]({ child: instance2 }));
                    expect(log).to.be.empty;
                });


                describe('assigning a complex value to field via '+setterName, function() {
                    let object, manager, child;
                    beforeEach(()=>{
                        manager = new mu.LifeCycleManager();
                        object = new UserWithChild();
                        object.$setManager(manager);
                        child = new User();
                        sinon.spy(child, '$setManager');
                    });
                    if (context.dirtyableElements) {
                        it('sets lifecycle manager in newly added elements', function() {
                            object[setterName]({child});
                            expect(child.$setManager).to.have.been.calledWithExactly(manager);
                        });
                        it('does not try to set lifecycle manager in read-only newly added elements', function() {
                            object[setterName]({child:child.$asReadOnly()});
                            expect(child.$setManager).to.have.not.been.calledWithExactly(manager);
                        });
                    }
                });
            });
            describe('with mutable input', function() {
                it('should set replace all values from an incoming object with mutable fields according to schema', function() {
                    var instance = new UserWithChild();
                    var childInstance = new User({ name: 'zaphod', age: 42 });
                    instance[setterName]({ child: childInstance });

                    expect(instance.child).to.equal(childInstance);
                });
                it('should not invalidate if child instance hasnt is the same one', function() {
                    var instance = new UserWithChild();
                    var childInstance = new User({ name: 'zaphod', age: 42 });
                    instance[setterName]({ child: childInstance });
                    var log = getMobxLogOf(()=> instance[setterName]({ child: childInstance }));
                    expect(log).to.be.empty;
                });
            })
        }


        describe('setValue', function() {
            valueSetterSuite('setValue');
            it('should create new data objects for nested complex types', function() {
                var instance = new UserWithChild();
                var childInstance = instance.child;
                instance.setValue({ child: {} });

                expect(childInstance).to.not.be.equal(instance.child);
            });
            it("should not allow values of wrong type", function() {
                var user = new User();
                expect(() => { return user.setValue({ age: "666" }) }).to.report(ERROR_IN_SET_VALUE('User.age', 'number', 'string'));
            });

            it("report correct path if setting values of wrong type", function() {
                var container = new VeryCompositeContainer();
                expect(() => { return container.setValue({ child1: { child: { age: "666" } } }) })
                    .to.report(ERROR_IN_SET_VALUE('VeryCompositeContainer.child1.child.age', 'number', 'string'));
            });
        });

        describe('setValueDeep', function() {
            valueSetterSuite('setValueDeep');
            it('should create new child if child is read only', function() {
                var childInstance = new User({ name: 'zaphod', age: 42 }).$asReadOnly();

                var instance = new UserWithChild({ child: childInstance });

                var log = getMobxLogOf(()=> instance.setValueDeep({ child: { name: 'zagzag' } }), instance);
                expect(log).to.not.be.empty;
                expect(childInstance).to.not.be.equal(instance.child);
            });
            it('should create new child if child is null', function() {

                var instance = new UserWithNullableChild({ child: null });
                var log = getMobxLogOf(()=> instance.setValueDeep({ child: { name: 'zagzag' } }), instance);
                expect(log).to.not.be.empty;
            });
            it('complex children props should be set to default if not specified', function() {
                var instance = new UserWithChild({ child: { name: 'zagzag' } });

                instance.setValueDeep({ child: { age: 1 } });

                expect(instance.child.name).to.be.equal('leon');
            });
            it('should not invalidate item if child has not changed', function() {
                var instance = new UserWithChild({ child: { name: 'zagzag' } });
                var log = getMobxLogOf(()=> instance.setValueDeep({ child: { name: 'zagzag' } }), instance);
                expect(log).to.be.empty;
            });
            it('should not invalidate item if null child was set to null', function() {
                var instance = new UserWithNullableChild({ child: null });
                var log = getMobxLogOf(()=> instance.setValueDeep({ child: null }));
                expect(log).to.be.empty;
            });
            it('should invalidate if child has changed', function() {
                var instance = new UserWithChild({ child: { name: 'zagzag' } });
                var log = getMobxLogOf(()=> instance.setValueDeep({ child: { name: 'not zagzag' } }));
                expect(log.filter(change => change.object === instance)).to.be.empty;
                expect(log.filter(change => change.object === instance.child)).not.to.be.empty;
            });
            describe('setting values of wrong type', () => {
                let StartField, StartData, EndField, EndData;
                let startInstance, endInstance, typedInputValue, untypedInputValue;
                before(() => {
                    StartField = mu.define("StartField", { spec: function() { return {
                        validProp: mu.String,
                        invalidProp: mu.Number
                    }; }});
                    StartData = mu.define("StartData", { spec: function() { return {
                        field: StartField.nullable(true)
                    }; }});
                    EndField = mu.define("EndField", { spec: function() { return {
                        validProp: mu.String,
                        invalidProp: mu.String
                    }; }});
                    EndData = mu.define("EndData", { spec: function() { return {
                        field: EndField.nullable(true)
                    }; }});
                });
                beforeEach(() => {
                    startInstance = new StartData({field:{validProp:'start',invalidProp:5}});
                    endInstance = new EndData({field:null});
                    untypedInputValue = startInstance.toJS();
                    typedInputValue = startInstance.toJS(true);
                });

                it("(by _type annotation) should report correct level, path and context", function() {
                    expect (() => endInstance.setValueDeep(typedInputValue)).to.throw;
                    expect (() => endInstance.setValueDeep(typedInputValue)).to.report(ERROR_IN_SET_VALUE_DEEP('EndData.field', 'EndField', 'object with _type StartField'));
                });

                it("should report correct level, path and context", function() {
                    expect (() => endInstance.setValueDeep(untypedInputValue)).to.throw;
                    expect (() => endInstance.setValueDeep(untypedInputValue)).to.report(ERROR_IN_SET_VALUE_DEEP('EndData.field.invalidProp', 'string', 'number'));
                });

                it("should allow report override", function() {
                    const errorContext = endInstance.constructor.createErrorContext('custom','info');
                    expect (() => endInstance.setValueDeep(untypedInputValue, errorContext)).not.to.throw;
                    expect (() => endInstance.setValueDeep(untypedInputValue, errorContext)).to.report({ level: 'info', params: `custom: "EndData.field.invalidProp" expected type string but got number` });
                });

                it("if not throws, should apply partial fitting value from sub-field", function() {
                    const errorContext = endInstance.constructor.createErrorContext('custom','info');
                    endInstance.setValueDeep(untypedInputValue, errorContext);
                    expect(endInstance.toJSON(true)).to.eql({
                        field:{
                            validProp:'start',
                            invalidProp:''
                        }});
                });
            });

        });

        it('should return json value from toJSON()', function() {
            var userData = new UserWithChild();

            expect(userData.toJSON()).to.eql({
                name: 'leon',
                child: { name: 'bobi', age: 13, address: "no address" }
            });

            userData.name = 'moshe';

            expect(userData.toJSON()).to.eql({
                name: 'moshe',
                child: { name: 'bobi', age: 13, address: "no address" }
            });
        });

        it('should be convertible to JSON ', function() {
            var userData = new UserWithChild();

            expect(JSON.parse(JSON.stringify(userData))).to.eql({
                name: 'leon',
                child: { name: 'bobi', age: 13, address: "no address" }
            });

            userData.name = 'moshe';

            expect(JSON.parse(JSON.stringify(userData))).to.eql({
                name: 'moshe',
                child: { name: 'bobi', age: 13, address: "no address" }
            });
        });

        it('should warn when attempting to override readOnly values', function() {
            var userData = new User();
            var userReadOnly = userData.$asReadOnly();

            expect(()=>{
                userReadOnly.name = 'zorg';
            }).to.report(ERROR_ATTEMPTING_TO_OVERRIDE_READONLY(userReadOnly.name, 'User', 'name', 'zorg'));
        });

        it('should return wrapped data for none native immutable fields (like custom data)', function() {
            var userData = new UserWithChild();

            expect(userData.child instanceof User).to.equal(true);
        })
    });

    describe('(Read Only) instance', function() {

        it('should be created from data instance', function() {
            var userData = new User();
            var userReadOnly = userData.$asReadOnly();

            expect(userReadOnly.name).to.equal('leon');
            expect(userReadOnly.age).to.equal(10);
        });

        it('should be prototype of the same type class', function() {
            var userData = new User();
            var userReadOnly = userData.$asReadOnly();

            expect(userData).to.be.instanceOf(User);
            expect(userReadOnly).to.be.instanceOf(User);
        });

        it('should be created once for each data instance', function() {
            var userData = new User();
            var userReadOnly = userData.$asReadOnly();
            var userReadOnly2 = userData.$asReadOnly();

            expect(userReadOnly).to.equal(userReadOnly2);
        });

        it('should keep the source instance not readOnly', function() {
            // this is beacause the readonly instance used to have a bug in which it changed the original item value while wrapping it
            var userData = new UserWithChild();

            userData.$asReadOnly();
            userData.child.setValue({ name: 'moshe' });

            expect(userData.toJSON()).to.eql({
                name: 'leon',
                child: {
                    name: 'moshe',
                    age: 13,
                    address: "no address"
                }
            });
        });

        it('should be linked to data instance values', function() {
            var userData = new User();
            var userReadOnly = userData.$asReadOnly();

            userData.name = 'moshe';
            userData.age = 120;

            expect(userReadOnly.name).to.equal('moshe');
            expect(userReadOnly.age).to.equal(120);
        });

        it('should not change values', function() {
            var userData = new User();
            var userReadOnly = userData.$asReadOnly();

            userReadOnly.name = 'moshe';
            userReadOnly.age = 120;

            expect(userData.name).to.equal('leon');
            expect(userData.age).to.equal(10);
            expect(userReadOnly.name).to.equal('leon');
            expect(userReadOnly.age).to.equal(10);
        });

        it('should return wrapped data for none native immutable fields (like custom data)', function() {
            var userData = new UserWithChild().$asReadOnly();

            var readOnlyChild = userData.child;
            readOnlyChild.name = 'modified name';

            expect(readOnlyChild instanceof User).to.equal(true);
            expect(readOnlyChild.name).to.equal('bobi');
        });



        describe('getRuntimeId():', function() {
            it('should be the same for instance and readonly ver', function() {
                var sourceData = { numOfHeads: 2 };
                var instance = new User(sourceData);
                var readOnly = instance.$asReadOnly();
                expect(instance.getRuntimeId()).to.equal(readOnly.getRuntimeId());
            });
            it('no matter the reading order', function() {
                var sourceData = { numOfHeads: 2 };
                var instance = new User(sourceData);
                var readOnly = instance.$asReadOnly();
                expect(readOnly.getRuntimeId()).to.equal(instance.getRuntimeId());
            });
        });
    });
});
