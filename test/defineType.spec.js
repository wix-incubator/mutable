import _ from 'lodash';
import Typorama from '../src';
import {isAssignableFrom} from '../src/validation';
import {either} from '../src/genericTypes';
import {expect, err} from 'chai';
import Type1 from './type1';
import Type2 from './type2';
import {Report} from 'gopostal/dist/test-kit/testDrivers';
import {ERROR_FIELD_MISMATCH_IN_LIST_CONSTRUCTOR,ERROR_IN_DEFAULT_VALUES,ERROR_IN_FIELD_TYPE,ERROR_MISSING_GENERICS,ERROR_UNTYPED_LIST,ERROR_RESERVED_FIELD} from '../test-kit/testDrivers/reports'


function typeErrorMessage(valueField, valueStr,typeStr,subTypes, collectionType){
	return `Illegal ${valueField} ${valueStr} of type ${typeStr} for ${collectionType} of type ${subTypes}`;
}

function typeCompatibilityTest(typeFactory){
	describe('should be compatible', () => {
		it('with itself', () => {
			var type = typeFactory();
			expect(type.type).to.satisfy(isAssignableFrom.bind(null, type));
		});
		it('with instances of itself', () => {
			var type = typeFactory();
			var instance = new type();
			expect(instance).to.satisfy(type.validateType.bind(type));
		});
		it('with instance of same schema', () => {
			var type1 = typeFactory();
			var type2 = typeFactory();
			var instance = new type1();
			expect(instance).to.satisfy(type2.validateType.bind(type2));
		});
		it('with types of same schema', () => {
			var type1 = typeFactory();
			var type2 = typeFactory();
			expect(type1.type).to.satisfy(isAssignableFrom.bind(null, type2));
		});
	});
}

describe('defining', () => {

	describe('String with default value', () => {
		// fixme #187
		// typeCompatibilityTest(() => Typorama.String.withDefault('im special!'));
	});

	describe('Number with default value', () => {
		// fixme #187
		// typeCompatibilityTest(() => Typorama.Number.withDefault(6));
	});

	describe('Boolean with default value', () => {
		// fixme #187
		// typeCompatibilityTest(() => Typorama.Boolean.withDefault(true));
	});


	describe('a basic type', () => {

		typeCompatibilityTest(() => Type2);
		describe('that is isomorphic to another type', () => {
			it('should result in two compatible types', () => {
				new Type2(new Type1({foo: "bar"}));
				expect(() => new Type2(new Type1({foo: "bar"}))).not.to.report({level : /warn|error|fatal/});
			})
		});

		it('should allow defining types with primitive fields', function () {
			var primitives = Typorama.define('primitives', {
				spec: () => ({
					name: Typorama.String.withDefault('leon'),
					child1: Typorama.String,
					child2: Typorama.String
				})
			});
			expect(new primitives().name).to.equal('leon');
		});

		it('should allow defining types with custom fields', function () {
			var primitives = Typorama.define('primitives', {
				spec: () => ({
					name: Typorama.String.withDefault('leon'),
					child1: Typorama.String,
					child2: Typorama.String
				})
			});
			var composite = Typorama.define('composite', {
				spec: () => ({
					child: primitives
				})
			});
			expect(new composite().child.name).to.equal('leon');
		});

		it('should report error if field type is not valid', function () {
			expect(function () {
				Typorama.define('invalid', {
					spec: () => ({
						zagzag: {}
					})
				});
			}).to.report(ERROR_IN_FIELD_TYPE('invalid.zagzag'));
		});


		it('should report error if field type is missing', function () {
			expect(function () {
				Typorama.define('invalid', {
					spec: () => ({
						zagzag: null
					})
				});
			}).to.report(ERROR_IN_FIELD_TYPE('invalid.zagzag'));
		});

		it('should report error for reserved keys', function() { // ToDo: change to fields that start with $ and __
			expect(() => {
				Typorama.define('invalid', {
					spec: () => ({
						$asReadOnly: Typorama.String
					})
				});
			}).to.report(ERROR_RESERVED_FIELD('invalid.$asReadOnly'));
		});

		describe('type with generic field', function(){
			it('should throw error if field doesnt include generics info', function(){
				expect(() => {
					Typorama.define('invalid', {
						spec: () => ({
							zagzag: Typorama.Array
						})
					});
				}).to.report(ERROR_MISSING_GENERICS('invalid.zagzag'));
			});
			it('should throw error if field subtypes are invalid', function(){
				expect(() => {
					Typorama.define('invalid', {
						spec: () => ({
							zagzag: Typorama.Array.of(Typorama.String,function(){})
						})
					});
				}).to.report(ERROR_IN_FIELD_TYPE('invalid.zagzag<1>'));
			});
			it('should throw error if field subtypes dont include generics info', function(){
				expect(() => {
					Typorama.define('invalid', {
						spec: () => ({
							zagzag: Typorama.Array.of(Typorama.Array)
						})
					});
				}).to.report(ERROR_MISSING_GENERICS('invalid.zagzag<0>'));
			});

			xit('should throw error if field subtypes have invalid generics info', function(){
				expect(() => {
					Typorama.define('invalid', {
						spec: () => ({
							zagzag: Typorama.Array.of(Typorama.Array.of(function(){}))
						})
					});
				}).to.report(ERROR_MISSING_GENERICS('invalid.zagzag<0<0>>'));
			});

		});

	});

	describe('type with default value', function(){
		typeCompatibilityTest(() => Type1.withDefault({foo: 'im special!'}));

		it('should clone the previous type definition', function(){
			var originalType = Typorama.String;
			originalType.options = {};

			var customDefaultType = originalType.withDefault('im special!');

			expect(customDefaultType).not.to.equal(originalType);
			expect(customDefaultType.options).not.to.equal(originalType.options);
		});

	});

	describe('nullable type', function(){

		it('should clone the previous type definition and options', function(){
			var originalType = Typorama.String;
			originalType.options = { randomConfig:{someOption:true} };

			var customDefaultType = originalType.nullable();

			expect(customDefaultType).not.to.equal(originalType);
			expect(customDefaultType.options).not.to.equal(originalType.options);
			expect(customDefaultType.options.randomConfig).not.to.equal(originalType.options.randomConfig);
			expect(customDefaultType.options).to.eql({
				randomConfig:{someOption:true},
				nullable:true
			});
		});

	});

	describe("collection",() => {
		var UserType, AddressType;
		before('define helper types',()=>{
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


		describe("a map type",() => {

			describe('with default value', () => {
				typeCompatibilityTest(() => Typorama.Map.of(Typorama.String, Typorama.String).withDefault({lookAtMe: 'im special!'}));
			});
			describe("with missing sub-types",()=>{
				it('should report error when instantiating vanilla Map', () => {
					var inValidMapType = Typorama.Map;
					expect(()=>new inValidMapType()).to.report(new Report('error', 'Typorama.Map', 'Map constructor: Untyped Maps are not supported please state types of key and value in the format core3.Map<string, string>'));
				});
				it('should report error when defining Map with zero types', () => {
					expect(()=>Typorama.Map.of()).to.report(new Report('error', 'Typorama.Map', 'Missing types for map. Use Map<SomeType, SomeType>'));
				});
				it('should report error when defining Map with one type', () => {
					expect(()=>Typorama.Map.of(Typorama.Number)).to.report(new Report('error', 'Typorama.Map', 'Wrong number of types for map. Instead of Map<number> Use Map<string, number>'));
				});
			});

			describe('with complex value sub-type', () => {
				function typeFactory() {
					return Typorama.Map.of(Typorama.String, AddressType);
				}

				typeCompatibilityTest(typeFactory);
				describe("instantiation",function(){
					it('should allow setting data with json, ', function() {

						var map = typeFactory().create({'foo': {address:'gaga'}});

						expect(map.get('foo')).to.be.instanceOf(AddressType);
						expect(map.get('foo').code).to.eql(10);
						expect(map.get('foo').address).to.eql('gaga');
					});
				});
				it('should report error when null key is added',function(){
					expect(() => typeFactory().create([[null, 'gaga']])).to.report(
						new Report('error', 'Typorama.validation', 'Cannot assign null value to a type which is not defined as nullable.')); // todo nadavify
				});
				it('should report error when null key is added',function(){
					expect(() => typeFactory().create([[5, null]])).to.report(
						new Report('error', 'Typorama.validation', 'Cannot assign null value to a type which is not defined as nullable.')); // todo nadavify
				});
				it('should report error when unallowed primitive key is added',function(){
					expect(() => typeFactory().create([[5, 'gaga']])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('key', 5, 'number', '<string, Address>', 'Map')));
				});
				it('should report error when unallowed primitive value is added',function(){
					expect(() => typeFactory().create([['baga', 'gaga']])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('value', 'gaga','string','<string, Address>', 'Map')));
				});
				it('should report error when unallowed object key is added',function(){
					expect(() => typeFactory().create([[{}, new AddressType()]])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('key', '[object Object]', 'object', '<string, Address>', 'Map')));
				});
				it('should report error when when json value with unallowed _type is added',function(){
					expect(() => typeFactory().create([['baga', {_type:'User'}]])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('value', {_type:'User'},'User','<string, Address>', 'Map')));
				});
				it('should report error when unallowed typorama key is added',function(){
					expect(() => typeFactory().create([[new UserType(), new AddressType()]])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('key', new UserType(),'User','<string, Address>', 'Map')));
				});
				it('should report error when unallowed typorama value is added',function(){
					expect(() => typeFactory().create([['gaga', new UserType()]])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('value', new UserType(),'User','<string, Address>', 'Map')));
				});
			});

			describe('with complex key sub-type', () => {
				function typeFactory() {
					return Typorama.Map.of(UserType, Typorama.String);
				}
				typeCompatibilityTest(typeFactory);
				it('should report error when null key is added',function(){
					expect(() => typeFactory().create([[null, 'gaga']])).to.report(
						new Report('error', 'Typorama.validation', 'Cannot assign null value to a type which is not defined as nullable.')); // todo nadavify
				});
				it('should report error when null key is added',function(){
					expect(() => typeFactory().create([[new UserType(), null]])).to.report(
						new Report('error', 'Typorama.validation', 'Cannot assign null value to a type which is not defined as nullable.')); // todo nadavify
				});
				it('should report error when unallowed primitive key is added',function(){
					expect(() => typeFactory().create([['baga', 'gaga']])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('key', 'baga','string','<User, string>', 'Map')));
				});
				it('should report error when unallowed primitive value is added',function(){
					expect(() => typeFactory().create([[new UserType(), 5]])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('value', 5, 'number', '<User, string>', 'Map')));
				});
				it('should report error unallowed object value is added',function(){
					expect(() => typeFactory().create([[new UserType(), new UserType()]])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('value', new UserType(),'User','<User, string>', 'Map')));
				});
				it('should report error when when json kay with unallowed _type is added',function(){
					expect(() => typeFactory().create([[{_type:'Address'}, 'gaga']])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('key', '[object Object]','Address','<User, string>', 'Map')));
				});
				it('should report error when unallowed typorama key is added',function(){
					expect(() => typeFactory().create([[new AddressType(), 'gaga']])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('key', new AddressType(),'Address','<User, string>', 'Map')));
				});
				it('should report error when unallowed typorama value is added',function(){
					expect(() => typeFactory().create([['gaga', new AddressType()]])).to.report(
						new Report('error', 'Typorama.Map', typeErrorMessage('value', new AddressType(),'Address','<User, string>', 'Map')));
				});
			});

			describe('with complex key sub-type and union value sub-type', () => {
				function typeFactory() {
					return Typorama.Map.of(UserType, either(UserType,AddressType,Typorama.String));
				}
				typeCompatibilityTest(typeFactory);
				describe("instantiation",function(){
					let newUser, newUser2, newAddress;
					beforeEach(() => {
						newUser = new UserType();
						newUser2 = new UserType();
						newAddress = new AddressType();
					});
					it('should keep typorama objects passed to it that fit its subtypes', function() {
						var mixedMap = typeFactory().create([[newUser, newUser],[newUser2, newAddress]]);
						expect(mixedMap.get(newUser)).to.eql(newUser);
						expect(mixedMap.get(newUser2)).to.eql(newAddress);
					});
					it('should allow setting data with json and should default to first type, ', function() {
						var map = typeFactory().create([[newUser, {someKey:'gaga'}]]);
						expect(map.get(newUser)).to.be.instanceOf(UserType);
					});
					it('should use _type field to detect which subtype to use when setting data with json, ', function() {
						var map = typeFactory().create([[newUser, {_type: AddressType.id, address:'gaga'}]]);
						expect(map.get(newUser)).to.be.instanceOf(AddressType);
						expect(map.get(newUser).address).to.eql('gaga');
					});
					it('should detect primitives', function() {
						var mixedMap = typeFactory().create([[newUser, 'gaga']]);
						expect(mixedMap.get(newUser)).to.be.eql('gaga');
					});
				});
			});
		});

		describe("an array type",() => {

			describe("with no sub-types",()=>{
				it('should report error when instantiating', () => {
					var inValidArrType = Typorama.Array;
					expect(()=>new inValidArrType()).to.report(new Report('error', 'Typorama.Array', 'List constructor: Untyped Lists are not supported please state type of list item in the format core3.List<string>'));
				});
			});
			describe('with complex element sub-type', () => {
				typeCompatibilityTest(function typeFactory() {
					return Typorama.Array.of(UserType);
				});
				describe("instantiation",function(){
					it('should keep typorama objects passed to it that fit its subtypes', function() {
						var newUser = new UserType();
						var newAddress = new AddressType();

						var mixedList = Typorama.Array.of(either(UserType,AddressType)).create([newUser,newAddress]);

						expect(mixedList.at(0)).to.eql(newUser);
						expect(mixedList.at(1)).to.eql(newAddress);
					});
					it('single subtype array should allow setting data with json, ', function() {

						var mixedList = Typorama.Array.of(AddressType).create([{address:'gaga'}]);

						expect(mixedList.at(0)).to.be.instanceOf(AddressType);
						expect(mixedList.at(0).code).to.be.eql(10);
						expect(mixedList.at(0).address).to.be.eql('gaga');

					});

					it('a multi subtype array should default to first object based types for json', function() {
						var mixedList = Typorama.Array.of(either(AddressType, UserType)).create([{}]);

						expect(mixedList.at(0)).to.be.instanceOf(AddressType);

					});
					it('a multi subtype array should detect primitives', function() {
						var mixedList = Typorama.Array.of(either(AddressType, UserType,Typorama.String)).create(['gaga']);

						expect(mixedList.at(0)).to.be.eql('gaga');
					});
					it('a multi subtype array should use _type field to detect which subtype to use', function() {
						var mixedList = Typorama.Array.of(either(AddressType, UserType,Typorama.String)).create([{_type:'User'}]);

						expect(mixedList.at(0)).to.be.instanceOf(UserType);
					});
					it('should report error when unallowed primitive is added',function(){
						var ListCls = Typorama.Array.of(AddressType);
						expect(function(){ListCls.create(['gaga'])}).to.report(new Report('error', 'Typorama.Array', typeErrorMessage('value', 'gaga','string','<Address>', 'Array')));

						ListCls = Typorama.Array.of(Typorama.Number);
						expect(function(){ListCls.create(['gaga'])}).to.report(new Report('error', 'Typorama.Array', typeErrorMessage('value', 'gaga','string','<number>', 'Array')));
					});

					it('should report error when object is added an no object types allowed',function(){
						var ListCls = Typorama.Array.of(Typorama.String);
						expect(function(){ListCls.create([{}])}).to.report(new Report('error', 'Typorama.Array', typeErrorMessage('value', '[object Object]','object','<string>', 'Array')));
					});

					it('should report error when unallowed typorama is added',function(){
						var ListCls = Typorama.Array.of(UserType);
						expect(function(){ListCls.create([new AddressType()])}).to.report(new Report('error', 'Typorama.Array', typeErrorMessage('value', '[object Object]','Address','<User>', 'Array')));
					});

					it('should report error when json with unallowed _type added',function(){
						var ListCls = Typorama.Array.of(UserType);
						expect(function(){ListCls.create([{_type:'Address'}])}).to.report(new Report('error', 'Typorama.Array', typeErrorMessage('value', '[object Object]','Address','<User>', 'Array')));
					});

				});

			});
			describe('with union element sub-type', () => {
				typeCompatibilityTest(function typeFactory() {
					return Typorama.Array.of(either(UserType,AddressType));
				});
			});
			describe("with default values", function() {

				typeCompatibilityTest(() => Typorama.Array.of(Typorama.String).withDefault(['im special!']));

				var array, TestType, testType;

				before("instantiate with create", function () {
					array = Typorama.Array.of(Typorama.String).create(["Beyonce", "Rihanna", "Britney", "Christina"]);
				});

				before("define an array type with default", function () {
					TestType = Typorama.define('TestType', {
						spec: () => ({
							names: Typorama.Array.of(Typorama.String).withDefault(["Beyonce", "Rihanna", "Britney", "Christina"])
						})
					});
				});

				before("instantiate a type with default array", function () {
					testType = new TestType();
				});

				it("should have correct initial values in instances", function () {
					expect(array.length).to.equal(4);
					expect(array.at(0)).to.equal("Beyonce");
					expect(array.at(1)).to.equal("Rihanna");
					expect(array.at(2)).to.equal("Britney");
					expect(array.at(3)).to.equal("Christina");
				});

				it("should have correct initial values in withDefaults", function () {
					expect(testType.names.length).to.equal(4);
					expect(testType.names.at(0)).to.equal("Beyonce");
					expect(testType.names.at(1)).to.equal("Rihanna");
					expect(testType.names.at(2)).to.equal("Britney");
					expect(testType.names.at(3)).to.equal("Christina");
				});

			});
		});
	});
});
