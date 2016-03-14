import Typorama from '../src';
import {aDataTypeWithSpec} from '../test-kit/testDrivers/index';
import {expect, err} from 'chai';
import {revision} from '../src/lifecycle';
import {lifecycleContract} from './lifecycle.contract.spec.js';
import sinon from 'sinon';
import {ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR,ERROR_IN_SET,ERROR_IN_SET_VALUE} from '../test-kit/testDrivers/reports'


var UserType = aDataTypeWithSpec({
	name: Typorama.String.withDefault('leon'),
	age: Typorama.Number.withDefault(10),
	address: Typorama.String.withDefault('no address')
}, 'User');

var UserWithChildType = aDataTypeWithSpec({
	name: Typorama.String.withDefault('leon'),
	child: UserType.withDefault({name: 'bobi', age: 13})
}, 'UserWithChildType');

var UserWithNullableChildType = aDataTypeWithSpec({
	name: Typorama.String.withDefault('leon'),
	child: UserType.nullable().withDefault(null)
}, 'UserWithChildType');

var CompositeContainer = aDataTypeWithSpec({
	name: Typorama.String.withDefault('leon'),
	child1: UserType,
	child2: UserType
}, 'UserWith2ChildType');

var VeryCompositeContainer = aDataTypeWithSpec({
	child1: UserWithChildType
}, 'UserWithDeepChildType');

var PrimitivesContainer = aDataTypeWithSpec({
	name: Typorama.String.withDefault('leon'),
	child1: Typorama.String,
	child2: Typorama.String
}, 'User');

var lifeCycleAsserter = lifecycleContract();
(()=>{
	lifeCycleAsserter.addFixture(
		(u1, u2) => {
			var result = new CompositeContainer();
			result.child1 = u1;
			result.child2 = u2;
			return result;
		},
		() => new UserType(),
		'object with mutable elements');
	var counter = 0;
	lifeCycleAsserter.addFixture(
		(u1, u2) => new PrimitivesContainer({child1:u1, child2:u2}),
		() => 'foobar' + (counter++),
		'object with primitive elements'
	);
})();

describe('Custom data', function() {

	describe('Type Class', function() {
		it('should be able to describe itself', function() {
			expect(UserType).to.have.field('name').with.defaults('leon').of.type(Typorama.String);
			expect(UserType).to.have.field('age').with.defaults(10).of.type(Typorama.Number);
		});
	});

	describe('lifecycle:',function() {
		lifeCycleAsserter.assertDirtyContract();
	});

	describe('toJSON', function() {
		it('should take a typorama object, and return a native object', function() {
			var container = new UserWithChildType({child : {age : 11}});

			expect(container.toJSON(), 'toJSON() called').to.eql({name : new UserWithChildType().name, child : new UserType({age : 11}).toJSON()});
			expect(container.toJSON(false), 'toJSON(false) called').to.eql({name : new UserWithChildType().name, child : container.__value__.child});
		});
	});

	describe('mutable instance', function() {

		describe('instantiation', function() {

			it('should accept values from json', function() {
				var userData = new UserType({name: 'yoshi', age: 50});

				expect(userData.name).to.equal('yoshi');
				expect(userData.age).to.equal(50);
			});

			it("should not modify original json object", function() {
				var CustomType = aDataTypeWithSpec({
					name: Typorama.String.withDefault("Gordon Shumway"),
					planet: Typorama.String.withDefault("Melmac")
				}, "CustomType");
				var original = { name: "Lilo" };
				var inst = new CustomType(original);
				expect(original).to.deep.equal({ name: "Lilo" });
			});

			it("should not keep references to original json objects", function() {
				var CustomType = aDataTypeWithSpec({
					name: Typorama.String.withDefault("Gordon Shumway"),
					planet: Typorama.String.withDefault("Melmac")
				}, "CustomType");
				var original = { name: "Lilo" };
				var inst = new CustomType(original);
				original.name = "Alf";
				expect(inst.name).to.be.equal("Lilo");
			});

			it("should not keep references to original json objects, even deep ones", function() {

				var InnerType = aDataTypeWithSpec({
					name: Typorama.String.withDefault("Gordon Shumway")
				}, "InnerType");
				var OuterType = aDataTypeWithSpec({
					name: InnerType
				}, "OuterType");

				var original = { name: { name: "Lilo" } };
				var inst = new OuterType(original);
				original.name.name = "Alf";
				expect(inst.name.name).to.be.equal("Lilo");
			});

			it("should not modify original array", function() {
				var CustomType = aDataTypeWithSpec({
					names: Typorama.Array.of(Typorama.String)
				}, "CustomType");

				var original = { names: [ "Lilo", "Stitch" ] };
				var inst = new CustomType(original);
				expect(original).to.deep.equal({ names: [ "Lilo", "Stitch" ] });
			});

			it("should not keep references to original array", function() {
				var CustomType = aDataTypeWithSpec({
					names: Typorama.Array.of(Typorama.String)
				}, "CustomType");
				var original = { names: [ "Lilo", "Stitch" ] };
				var inst = new CustomType(original);
				original.names[0] = "Wendell Pleakley";
				expect(inst.names.at(0)).to.be.equal("Lilo");
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
				var userData = new UserType({age: 53});

				expect(userData.age).to.equal(53);
			});



			it('should not copy fields that do not appear in the schema', function() {
				var instance = new UserType({numOfHeads: 2});

				expect(instance.numOfHeads).to.be.undefined;
			});

			it('should reference matching typorama objects passed as value', function() {
				var instance = new UserType();

				var container = new CompositeContainer({child1:instance});
				expect(container.child1).to.be.equal(instance);
			});

			describe('initial value errors',function(){
				it('throw error for non nullable field recieving null', function() {
					expect(()=>new UserType({name: null}))
						.to.report(ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR('User.name','string','null'))
				});
				it('throw error for field type mismatch', function() {
					expect(()=>new UserType({age: 'gaga'}))
						.to.report(ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR('User.age','number','string'))
				});
				it("report correct path for field type mismatch in deep field", function() {
					var container = new VeryCompositeContainer();
					expect(() => new VeryCompositeContainer({child1: {child: { age: "666" }}}))
						.to.report(ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR('UserWithDeepChildType.child1.child.age','number','string'));
				});
			});

			describe('getRuntimeId():',function() {
				it('should be auto generated and unique', function() {
					var sourceData = {numOfHeads: 2};
					var instance = new UserType(sourceData);
					var instance2 = new UserType(sourceData);
					expect(instance.getRuntimeId()).to.equal(instance.getRuntimeId());
					expect(instance.getRuntimeId()).not.to.equal(instance2.getRuntimeId());
				});
			});
		});

		describe('set', function() {
			var ImageType, ProductType, StateType;

			before('setup types', () =>{
				ImageType = aDataTypeWithSpec({
					src: Typorama.String.withDefault('default.jpg')
				}, 'ImageType');

				ProductType = aDataTypeWithSpec({
					image: ImageType,
					title: Typorama.String.withDefault('default title')
				}, 'ProductType');

				StateType = aDataTypeWithSpec({
					product: ProductType.withDefault({
						image:{ src:'original.jpg' },
						title:'original title'
					}),
					relatedProducts: Typorama.Array.of(ProductType),
					stringAndNumbers: Typorama.Array.of([Typorama.String, Typorama.Number])
				}, 'StateType');
			});

			it('should not set data that does not fit the schema', function(){
				var state = new StateType();
				var image = new ImageType();
				var productPrevRef = state.product;

				expect(() => state.product = image).to.report(ERROR_IN_SET('StateType.product','ProductType','ImageType'));
				expect(state.product).to.be.equal(productPrevRef);
				expect(state.product.title).to.be.equal('original title');
				expect(state.product.image.src).to.be.equal('original.jpg');
			});

			it('should set data that fit the schema', function(){
				var state = new StateType();
				var newProduct = new ProductType();

				state.product = newProduct;

				expect(state.product).to.be.equal(newProduct);
			});


			//TODO: what to do?
			xit('should not set data that has different options', function(){
				var state = new StateType();
				var booleanList = new (Typorama.Array.of(Typorama.Boolean))([]);
				var relatedProductsPrevRef = state.relatedProducts;
				var stringAndNumbersPrevRef = state.stringAndNumbers;

				expect(() => state.relatedProducts = booleanList).to.report({level : /error/});
				expect(() => state.stringAndNumbers = booleanList).to.report({level : /error/});

				expect(state.relatedProducts).to.be.equal(relatedProductsPrevRef);
				expect(state.stringAndNumbers).to.be.equal(stringAndNumbersPrevRef);
			});

			it('should set data that has equivalent options', function(){
				var state = new StateType();
				var productList = new (Typorama.Array.of(ProductType))([]);
				var stringAndNumbersList = new (Typorama.Array.of([Typorama.String, Typorama.Number]))([]);
				var relatedProductsPrevRef = state.relatedProducts;
				var stringAndNumbersPrevRef = state.stringAndNumbers;
				state.relatedProducts = productList;
				state.stringAndNumbers = stringAndNumbersList;

				expect(state.relatedProducts).to.be.equal(productList);
				expect(state.stringAndNumbers).to.be.equal(stringAndNumbersList);
			});

			describe('primitive', function(){

				it('should not replace data that does not fit the schema', function(){
					var state = new StateType();
					var titlePrevVal = state.product.title;

					expect(() => state.product.title = {}).to.report(ERROR_IN_SET('ProductType.title','string','object'));

					expect(state.product.title).to.be.equal(titlePrevVal);
				});

				it('should replace data that fit the schema', function(){
					var state = new StateType();

					state.title = 'new title';

					expect(state.title).to.be.equal('new title');
				});
				lifeCycleAsserter.assertMutatorContract((obj) => obj.name = 'johnny', 'assignment on primitive field');
			});
			lifeCycleAsserter.assertMutatorContract((obj, elemFactory) => obj.child1 = elemFactory(), 'assignment to element field');
		});

		function valueSetterSuite (setterName){
			describe('with json input',function(){
				it('should set all values from an incoming JSON according to schema', function() {
					var instance = new UserType({address: '21 jump street'});

					instance[setterName]({name: 'zaphod', age: 42});

					expect(instance.name).to.equal('zaphod');
					expect(instance.age).to.equal(42);
				});

				it('should copy field values rather than the nested value, so that further changes to the new value will not propagate to the instance', function() {
					var instance = new UserType();
					var wrapped = {name: 'zaphod'};
					instance[setterName](wrapped);

					wrapped.name = 'ford';

					expect(instance.name).to.equal('zaphod');
				});

				it('should ignore fields that appear in the passed object but not in the type schema', function() {
					var instance = new UserType();

					instance[setterName]({numOfHeads: 2});

					expect(instance.numOfHeads).to.be.undefined;
				});

				it('should not invalidate if fields havnt changed', function() {
					var instance = new UserWithChildType();
					var instance2 = new UserType();
					instance[setterName]({child:instance2});
					revision.advance();
					var rev = revision.read();
					instance[setterName]({child:instance2});
					expect(instance.$isDirty(rev)).to.be.equal(false);
				});



				lifeCycleAsserter.assertMutatorContract((obj, elemFactory) => obj[setterName]({child: elemFactory()}), setterName+' which assigns to element field');
			});
			describe('with typorama input',function(){
				it('should set replace all values from an incoming object with typorama fields according to schema', function() {
					var instance = new UserWithChildType();
					var childInstance = new UserType({name: 'zaphod', age: 42});
					instance[setterName]({child: childInstance});

					expect(instance.child).to.equal(childInstance);
				});
				it('should not invalidate if child instance hasnt is the same one', function() {
					var instance = new UserWithChildType();
					var childInstance = new UserType({name: 'zaphod', age: 42});
					instance[setterName]({child: childInstance});
					revision.advance();
					var rev = revision.read();
					instance[setterName]({child: childInstance});
					expect(instance.$isDirty(rev)).to.equal(false);
				});
			})
		}
		describe('setValue', function() {
			valueSetterSuite('setValue');
			it('should create new data objects for nested complex types', function() {
				var instance = new UserWithChildType();
				var childInstance = instance.child;
				instance.setValue({child:{}});

				expect(childInstance).to.not.be.equal(instance.child);
			});
			it("should not allow values of wrong type", function() {
				var user = new UserType();
				expect(() => {return user.setValue({ age: "666" })}).to.report(ERROR_IN_SET_VALUE('User.age','number','string'));
			});

			it("report correct path if setting values of wrong type", function() {
				var container = new VeryCompositeContainer();
				expect(() => {return container.setValue({child1: {child: { age: "666" }}})})
					.to.report(ERROR_IN_SET_VALUE('UserWithDeepChildType.child1.child.age','number','string'));
			});
		});

		describe('setValueDeep', function(){
			valueSetterSuite('setValueDeep');
			it('should create new child if child is read only', function() {
				var childInstance = new UserType({name: 'zaphod', age: 42}).$asReadOnly();

				var instance = new UserWithChildType({child:childInstance});
				revision.advance();
				var rev = revision.read();

				instance.setValueDeep({child:{name:'zagzag'}});

				expect(childInstance).to.not.be.equal(instance.child);
				expect(instance.$isDirty(rev)).to.equal(true);
			});
			it('should create new child if child is null', function() {

				var instance = new UserWithNullableChildType({child:null});
				revision.advance();
				var rev = revision.read();

				instance.setValueDeep({child:{name:'zagzag'}});

				expect(instance.$isDirty(rev)).to.equal(true);
			});
			it('complex children props should be set to default if not specified', function() {
				var instance = new UserWithChildType({child:{name:'zagzag'}});

				instance.setValueDeep({child:{age:1}});

				expect(instance.child.name).to.be.equal('leon');
			});
			it('should not invalidate item if child has not changed', function() {
				var instance = new UserWithChildType({child:{name:'zagzag'}});
				revision.advance();
				var rev = revision.read();

				instance.setValueDeep({child:{name:'zagzag'}});

				expect(instance.$isDirty(rev)).to.equal(false);
			});
			it('should invalidate if child has changed', function() {
				var instance = new UserWithChildType({child:{name:'zagzag'}});
				revision.advance();
				var rev = revision.read();

				instance.setValueDeep({child:{name:'not zagzag'}});

				expect(instance.$isDirty(rev)).to.equal(true);
			});
		})
		describe("with global freeze config", function(){

			before("set global freeze configuration", function(){
				Typorama.config.freezeInstance = true;
			});

			after("clear global freeze configuration", function(){
				Typorama.config.freezeInstance = false;
			});

			it("should throw error on unknown field setter", function(){
				var ImageType = aDataTypeWithSpec({
					src: Typorama.String.withDefault('default.jpg')
				}, 'ImageType');
				var image = new ImageType();

				expect(function(){
					image.notAField = "there is no notAField";
				}).to.throw();
			});

		});

		it('should chain with default calls', function() {
			var typeWithDefaultBob = UserType.withDefault({name: 'joe'}).withDefault({name: 'bob'});

			var a = typeWithDefaultBob.defaults();

			expect(a.name).to.equal('bob');
		});

		it('should clone complex data objects on set', function() {

			var userData = new UserWithChildType();

			userData.child = new UserType({name: 'yossi', age: 3});

			expect(userData.child.name).to.equal('yossi');
			expect(userData.child.age).to.equal(3);
			expect(userData.child.address).to.equal("no address");
		});

		it('should return json value from toJSON()', function() {
			var userData = new UserWithChildType();

			expect(userData.toJSON()).to.eql({
				name: 'leon',
				child: {name: 'bobi', age: 13, address: "no address"}
			});

			userData.name = 'moshe';

			expect(userData.toJSON()).to.eql({
				name: 'moshe',
				child: {name: 'bobi', age: 13, address: "no address"}
			});
		});

		it('should be convertible to JSON ', function() {
			var userData = new UserWithChildType();

			expect(JSON.parse(JSON.stringify(userData))).to.eql({
				name: 'leon',
				child: {name: 'bobi', age: 13, address: "no address"}
			});

			userData.name = 'moshe';

			expect(JSON.parse(JSON.stringify(userData))).to.eql({
				name: 'moshe',
				child: {name: 'bobi', age: 13, address: "no address"}
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

		it('should be prototype of the same type class', function() {
			var userData = new UserType();
			var userReadOnly = userData.$asReadOnly();

			expect(userData).to.be.instanceOf(UserType);
			expect(userReadOnly).to.be.instanceOf(UserType);
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
					age: 13,
					address: "no address"
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

		describe('getRuntimeId():',function() {
			it('should be the same for instance and readonly ver', function() {
				var sourceData = {numOfHeads: 2};
				var instance = new UserType(sourceData);
				var readOnly = instance.$asReadOnly();
				expect(instance.getRuntimeId()).to.equal(readOnly.getRuntimeId());
			});
			it('no matter the reading order', function() {
				var sourceData = {numOfHeads: 2};
				var instance = new UserType(sourceData);
				var readOnly = instance.$asReadOnly();
				expect(readOnly.getRuntimeId()).to.equal(instance.getRuntimeId());
			});
		});
		describe("with global freeze config", function(){

			before("set global freeze configuration", function(){
				Typorama.config.freezeInstance = true;
			});

			after("clear global freeze configuration", function(){
				Typorama.config.freezeInstance = false;
			});

			it("should throw error on unknown field setter", function(){
				var ImageType = aDataTypeWithSpec({
					src: Typorama.String.withDefault('default.jpg')
				}, 'ImageType');
				var image = new ImageType().$asReadOnly();

				expect(function(){
					image.notAField = "there is no notAField";
				}).to.throw();
			});

		});
	});
});
