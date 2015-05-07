import _ from 'lodash';
import Typorama from '../src';
import {aDataTypeWithSpec} from '../test-kit/testDrivers/index';
import {expect, err} from 'chai';
import {lifecycleContract} from './lifecycle.contract.spec.js';
import sinon from 'sinon';

describe('Custom data', function() {

	var UserType = aDataTypeWithSpec({
		name: Typorama.String.withDefault('leon'),
		age: Typorama.Number.withDefault(10),
		address: Typorama.String.withDefault('no address')
	}, 'User');

	var UserWithChildType = aDataTypeWithSpec({
		name: Typorama.String.withDefault('leon'),
		child: UserType.withDefault({name: 'bobi', age: 13})
	}, 'UserWithChildType');

	describe('definition', function() {
		it('should throw error for reserved keys', function() { // ToDo: change to fields that start with $ and __
			expect(() => aDataTypeWithSpec({$asReadOnly: Typorama.String})).to.throw();
		});
	});

	describe('Type Class', function() {
		it('should be able to describe itself', function() {
			expect(UserType).to.have.field('name').with.defaults('leon').of.type(Typorama.String);
			expect(UserType).to.have.field('age').with.defaults(10).of.type(Typorama.Number);
		});
	});

	var CompositeContainer = aDataTypeWithSpec({
		name: Typorama.String.withDefault('leon'),
		child1: UserType,
		child2: UserType
	}, 'UserWith2ChildType');

	var PrimitivesContainer = aDataTypeWithSpec({
		name: Typorama.String.withDefault('leon'),
		child1: Typorama.String,
		child2: Typorama.String
	}, 'User');


	var lifeCycleAsserter = lifecycleContract();
	lifeCycleAsserter.addFixture(
		(u1, u2) => {
			var result = CompositeContainer.create();
			result.child1 = u1;
			result.child2 = u2;
			return result;
		},
		() => UserType.create(),
		'object with mutable elements');
	var counter = 0;
	lifeCycleAsserter.addFixture(
		(u1, u2) => PrimitivesContainer.create({child1:u1, child2:u2}),
		() => 'foobar' + (counter++),
		'object with primitive elements'
	);

	describe('lifecycle:',function() {
		lifeCycleAsserter.assertDirtyContract();
	});

	describe('mutable instance', function() {

		describe('instantiation', function() {

			it('should accept values from json', function() {
				var userData = new UserType({name: 'yoshi', age: 50});

				expect(userData.name).to.equal('yoshi');
				expect(userData.age).to.equal(50);
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

			xit('should provide default values for mismatching fields', function() {
				var userData = new UserType({age: {}});

				expect(userData).to.be.a.dataInstance.with.field('age').with.defaultValue();
			});

			it('should not copy fields that do not appear in the schema', function() {
				var instance = new UserType({numOfHeads: 2});

				expect(instance.numOfHeads).to.be.undefined;
			});

		});

		describe('set', function() {

			var ImageType = aDataTypeWithSpec({
				src: Typorama.String.withDefault('default.jpg')
			}, 'ImageType');

			var ProductType = aDataTypeWithSpec({
				image: ImageType,
				title: Typorama.String.withDefault('default title')
			}, 'ProductType');

			var StateType = aDataTypeWithSpec({
				product: ProductType.withDefault({
					image:{ src:'original.jpg' },
					title:'original title'
				}),
				relatedProducts: Typorama.Array.of(ProductType),
				stringAndNumbers: Typorama.Array.of([Typorama.String, Typorama.Number])
			}, 'StateType');

			it('should not set data that does not fit the schema', function(){
				var state = new StateType();
				var image = new ImageType();
				var productPrevRef = state.product;

				state.product = image;

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

			it('should not set data that has different options', function(){
				var state = new StateType();
				var booleanList = Typorama.Array.of(Typorama.Boolean).create([]);
				var relatedProductsPrevRef = state.relatedProducts;
				var stringAndNumbersPrevRef = state.stringAndNumbers;

				state.relatedProducts = booleanList;
				state.stringAndNumbers = booleanList;

				expect(state.relatedProducts).to.be.equal(relatedProductsPrevRef);
				expect(state.stringAndNumbers).to.be.equal(stringAndNumbersPrevRef);
			});

			it('should set data that has equivalent options', function(){
				var state = new StateType();
				var productList = Typorama.Array.of(ProductType).create([]);
				var stringAndNumbersList = Typorama.Array.of([Typorama.String, Typorama.Number]).create([]);
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

					state.product.title = {};

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

		describe('setValue', function() {
            describe('with json input',function(){
                it('should set all values from an incoming JSON according to schema', function() {
                    var instance = new UserType({address: '21 jump street'});
                    instance.setValue({name: 'zaphod', age: 42});

                    expect(instance.name).to.equal('zaphod');
                    expect(instance.age).to.equal(42);
                    expect(instance.address).to.equal('21 jump street');
                });

                it('should copy field values rather than the nested value, so that further changes to the new value will not propagate to the instance', function() {
                    var instance = new UserType();
                    var wrapped = {name: 'zaphod'};
                    instance.setValue(wrapped);

                    wrapped.name = 'ford';

                    expect(instance.name).to.equal('zaphod');
                });

                it('should ignore fields that appear in the passed object but not in the type schema', function() {
                    var instance = new UserType();

                    instance.setValue({numOfHeads: 2});

                    expect(instance.numOfHeads).to.be.undefined;
                });

                it('should not invalidate if fields havnt changed', function() {
                    var instance = new UserWithChildType();
                    instance.setValue({child:{name: 'gaga'}});
                    instance.$resetDirty();
                    instance.setValue({child:{name: 'gaga'}});
                    expect(instance.$isDirty()).to.be.equal(false);
                });
            })
            describe('with typorama input',function(){
                it('should set replace all values from an incoming object with typorama fields according to schema', function() {
                    var instance = new UserWithChildType();
                    var childInstance = new UserType({name: 'zaphod', age: 42});
                    instance.setValue({child: childInstance});

                    expect(instance.child).to.equal(childInstance);
                });
                it('should not invalidate if child instance hasnt is the same one', function() {
                    var instance = new UserWithChildType();
                    var childInstance = new UserType({name: 'zaphod', age: 42});
                    instance.setValue({child: childInstance});
                    instance.$resetDirty();
                    instance.setValue({child: childInstance});
                    expect(instance.$isDirty()).to.equal(false);
                });
            })
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
	});
});