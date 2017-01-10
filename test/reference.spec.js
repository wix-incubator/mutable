import {expect} from 'chai';
import {aDataTypeWithSpec} from '../test-kit/test-drivers';
import {ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR}  from '../test-kit/test-drivers/reports';
import * as mu from '../src';

function defineRef(def, id) {
    return mu.define(id || 'unnamedRefType', {
        spec: function() {
            return def;
        }
    }, mu.Reference);
}

function defineType(def, id) {
    return mu.define(id || 'unnamedRefType', {
        spec: function() {
            return def;
        }
    });
}

describe("reference type", function() {

    describe('initial value', function() {

        it('should warn and ignore value when value has missing fields', function() {
            var RefType = defineRef({ name: mu.String, age: mu.Number }, 'MyRefType');
            var typeIns;

            expect(function() {
                typeIns = new RefType({ age: 30 });
            }).to.report({ level: /warn|error|fatal/, params: ['MyRefType cannot accept value with missing field "name"'] });
            expect(typeIns.name).to.equal(undefined);
            expect(typeIns.age).to.equal(undefined);
        });

        it('should warn and ignore value when value does not fit the interface', function() {
            var RefType = defineRef({ name: mu.String, age: mu.Number }, 'MyRefType');
            var typeIns;

            expect(function() {
                typeIns = new RefType({ name: true, age: 30 });
            }).to.report({ level: /warn|error|fatal/, params: ['MyRefType field "name" cannot accept value with mismatched type'] });
            expect(typeIns.name).to.equal(undefined);
            expect(typeIns.age).to.equal(undefined);
        });

        it('should keep the original value reference', function() {
            var RefType = defineRef({ age: mu.Number }, 'MyRefType');
            var inputRef = { age: 30 };

            var typeIns = new RefType(inputRef);

            expect(typeIns.__value__).to.equal(inputRef);
        });

        it('should accept none object classes', function() {
            var MyClass = function() { this.age = 35; };
            var RefType = defineRef({ age: mu.Number }, 'MyRefType');
            var inputRef = new MyClass();

            var typeIns = new RefType(inputRef);

            expect(typeIns.__value__).to.equal(inputRef);
        });

        it('should keep the original value reference (from defaults of complex list)', function() {
            var RefType = defineRef({ age: mu.Number }, 'MyRefType');
            var defaultInputRef = { age: 30 };
            var listOfRef = mu.List.of(RefType).withDefault([defaultInputRef]);

            var listIns = new listOfRef();

            expect(listIns.at(0).__value__).to.equal(defaultInputRef);
        });

        it('should accept non-object classes (in list)', function() {
            var MyClass = function() { this.age = 35; };
            var RefType = defineRef({ age: mu.Number }, 'MyRefType');
            var defaultInputRef = new MyClass();
            var listOfRef = mu.List.of(RefType);

            var listIns = new listOfRef([defaultInputRef]);

            expect(listIns.at(0).__value__).to.equal(defaultInputRef);
        });

        it('should keep original value reference (from defaults of complex type)', function() {
            var RefType = defineRef({ age: mu.Number }, 'MyRefType');
            var MyType = defineType({ ref: RefType }, 'MyType');
            var myRef = { age: 1 };
            var T = MyType.withDefault({
                ref: myRef
            });

            var t = new T();

            expect(t.ref.__value__).to.equal(myRef);
        });

        it('should accept non-object classes (in complex type)', function() {
            var MyClass = function() { this.age = 35; };
            var RefType = defineRef({ age: mu.Number }, 'MyRefType');
            var defaultInputRef = new MyClass();
            var MyType = defineType({ ref: RefType }, 'MyType');

            var t = new MyType({ ref: defaultInputRef });

            expect(t.__value__.ref.__value__).to.equal(defaultInputRef);
        });

    });

    describe('get field', function() {

        it('should proxy according to spec', function() {
            var RefType = defineRef({ zagzag: mu.String, count: mu.Number });
            var value = { zagzag: "001", count: 5 };

            var typeIns = new RefType(value);
            value.zagzag = "002";

            expect(value).to.not.equal(typeIns);
            expect(typeIns.zagzag).to.equal(value.zagzag);
            expect(typeIns.count).to.equal(value.count);
        });

        it.skip('ask ido about problem with id', function() {
            var RefType = defineRef({ id: mu.String, count: mu.Number });
            var value = { id: "001", count: 5 };

            var typeIns = new RefType(value);
            value.id = "002";

            expect(value).to.not.equal(typeIns);
            expect(typeIns.id).to.equal(value.id);
            expect(typeIns.count).to.equal(value.count);
        });

        it('should prevent access to none spec fields', function() {
            var RefType = defineRef({ knownField: mu.Number });
            var value = { knownField: 5, UNKNOWN_FIELD: 6 };

            var typeIns = new RefType(value);

            expect(typeIns.UNKNOWN_FIELD).to.equal(undefined);
        });

    });

    describe('set field', function() {

        it('should set the proxy value', function() {
            var RefType = defineRef({ zagzag: mu.String, count: mu.Number });
            var value = { zagzag: "001", count: 5 };
            var typeIns = new RefType(value);

            typeIns.zagzag = "002";
            typeIns.count = 6;

            expect(value.zagzag).to.equal("002");
            expect(value.count).to.equal(6);
        });

        it('should no set the proxy value for non spec value', function() {
            var RefType = defineRef({ id: mu.String }, 'ParentType');
            var value = { id: "001" };
            var typeIns = new RefType(value);

            expect(function() {
                typeIns.id = 2;
            }).to.report({ level: /warn|error|fatal/, params: [`Set error: "ParentType.id" expected type string but got number`] });
            expect(value.id).to.equal("001");
        });
        it('should no set the proxy value for non spec value with complex values', function() {
            var RefType = defineRef({ id: mu.String }, 'ParentType');
            var RefType2 = defineRef({ id: mu.String }, 'ChildType');
            var value = { id: "001" };
            var typeIns = new RefType(value);

            expect(function() {
                typeIns.id = new RefType2();
            }).to.report({ level: /warn|error|fatal/, params: [`Set error: "ParentType.id" expected type string but got ChildType`] });
            expect(value.id).to.equal("001");
        });
        it('should no set the proxy value for read only copy', function() {
            var RefType = defineRef({ id: mu.String });
            var value = { id: "001" };
            var typeReadOnlyIns = new RefType(value).$asReadOnly();

            typeReadOnlyIns.id = "002";

            expect(value.id).to.equal("001");
        });

    });

    describe('allowPlainVal', function() {

        it('should accept any value that has the spec interface', function(){
            var RefType = defineRef({ id:mu.String });
            expect(RefType.allowPlainVal({id:"001", foo:5}, {path:'foo'})).to.be.true;
        });

        it('should not accept any value that does not have the spec interface', function(){
            var RefType = defineRef({ id:mu.String });
            expect(RefType.allowPlainVal({}, {path:'foo'})).to.be.false;
        });
    });

    describe('as a field in another type', function() {

        let Type1, Type2;
        before('define types', () => {
            Type1 = defineRef({ id:mu.String }, 'Type1');
            Type2 = aDataTypeWithSpec({ ref: Type1 }, 'Type2');
        });

        it('should return any value that has the spec interface', function(){
            expect(new Type2({ref:{id:"001", foo:5}}).ref.id).to.eql("001");
        });

        it('should report on any value that does not have the spec interface', function(){
            expect(() => new Type2({ref:{foo:5}})).to.report(ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR("Type2.ref", "Type1", "object"));
        });
    });

});
