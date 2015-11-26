/**
 * Created by idoro on 11/3/2015.
 */
import testKit from "../test-kit";
import { expect, err } from 'chai';
import sinon from 'sinon';
import Typorama from '../src';

function defineRef(def, id){
	return Typorama.define(id || 'unnamedRefType', {
		spec: function() {
			return def;
		}
	}, Typorama.Reference);
}

function defineType(def, id){
	return Typorama.define(id || 'unnamedRefType', {
		spec: function() {
			return def;
		}
	});
}

describe("reference type", function() {

	describe('initial value', function(){

		it('should warn and ignore value when value has missing fields', function(){
			var RefType = defineRef({ name:Typorama.String, age:Typorama.Number }, 'MyRefType');
			var typeIns;

			expect(function(){
				typeIns = new RefType({ age:30 });
			}).to.report({ level:/warn|error|fatal/, params:['MyRefType cannot accept value with missing field "name"'] });
			expect(typeIns.name).to.equal(undefined);
			expect(typeIns.age).to.equal(undefined);
		});

		it('should warn and ignore value when value does not fit the interface', function(){
			var RefType = defineRef({ name:Typorama.String, age:Typorama.Number }, 'MyRefType');
			var typeIns;

			expect(function(){
				typeIns = new RefType({ name:true, age:30 });
			}).to.report({ level:/warn|error|fatal/, params:['MyRefType field "name" cannot accept value with mismatched type'] });
			expect(typeIns.name).to.equal(undefined);
			expect(typeIns.age).to.equal(undefined);
		});

		it('should keep the original value reference', function(){
			var RefType = defineRef({ age:Typorama.Number }, 'MyRefType');
			var inputRef = { age:30 };

			var typeIns = new RefType(inputRef);

			expect(typeIns.__value__).to.equal(inputRef);
		});

		it('should keep the original value reference (from defaults of complex list)', function(){
			var RefType = defineRef({ age:Typorama.Number }, 'MyRefType');
			var defaultInputRef = { age:30 };
			var listOfRef = Typorama.Array.of(RefType).withDefault([defaultInputRef]);

			var listIns = new listOfRef();

			expect(listIns.at(0).__value__).to.equal(defaultInputRef);
		});

		it('should keep original value reference (from defaults of complex type)', function(){
			var RefType = defineRef({ age:Typorama.Number }, 'MyRefType');
			var MyType = defineType({ ref: RefType}, 'MyType');
			var myRef = {age:1};
			var T = MyType.withDefault({
				ref: myRef
			});

			var t = new T();

			expect(t.ref.__value__).to.equal(myRef);
		});

	});

	describe('get field', function(){

		it('should proxy according to spec', function(){
			var RefType = defineRef({ id:Typorama.String, count:Typorama.Number });
			var value = { id:"001", count:5 };

			var typeIns = new RefType(value);
			value.id = "002";

			expect(value).to.not.equal(typeIns);
			expect(typeIns.id).to.equal(value.id);
			expect(typeIns.count).to.equal(value.count);
		});

		it('should prevent access to none spec fields', function(){
			var RefType = defineRef({ knownField:Typorama.Number });
			var value = { knownField:5, UNKNOWN_FIELD:6 };

			var typeIns = new RefType(value);

			expect(typeIns.UNKNOWN_FIELD).to.equal(undefined);
		});

	});

	describe('set field', function(){

		it('should set the proxy value', function(){
			var RefType = defineRef({ id:Typorama.String, count:Typorama.Number });
			var value = { id:"001", count:5 };
			var typeIns = new RefType(value);

			typeIns.id = "002";
			typeIns.count = 6;

			expect(value.id).to.equal("002");
			expect(value.count).to.equal(6);
		});

		it('should no set the proxy value for none spec value', function(){
			var RefType = defineRef({ id:Typorama.String });
			var value = { id:"001" };
			var typeIns = new RefType(value);

			expect(function(){
				typeIns.id = 2;
			}).to.report({ level:/warn|error|fatal/, params:[`Invalid value for key id of type string: 'Number'.`] });
			expect(value.id).to.equal("001");
		});

		it('should no set the proxy value for read only copy', function(){
			var RefType = defineRef({ id:Typorama.String });
			var value = { id:"001" };
			var typeReadOnlyIns = new RefType(value).$asReadOnly();

			typeReadOnlyIns.id = "002";

			expect(value.id).to.equal("001");
		});

	});

	describe('validateType', function(){

		//it('should accept any value that has the spec interface', function(){
		//	var RefType = defineRef({ id:Typorama.String });
		//	expect(RefType.validateType({id:"001"})).to.be.true;
		//});

	});

});
