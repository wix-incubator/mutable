import {expect} from 'chai';
import {aDataTypeWithSpec} from '../test-kit/test-drivers';
import * as mu from '../src';
import {either} from '../src/core/generic-types';
import {ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR, ERROR_IN_SET} from '../test-kit/test-drivers/reports';
import {typeCompatibilityTest} from "./type-compatibility.contract";

const TypeA = aDataTypeWithSpec({ bar: mu.String }, 'TypeA');
const TypeB = aDataTypeWithSpec({ bar: mu.Number }, 'TypeB');

describe('a type with union type field', function() {
    function defineType(){
        return aDataTypeWithSpec({ foo: either(TypeA, TypeB, mu.String, mu.Number) }, 'Generic');
    }

    function defineNullableType(){
        return aDataTypeWithSpec({ foo: either(mu.String,TypeA, TypeB).nullable(true) }, 'GenericNullable');
    }

    it('should not throw on definition', function(){
        expect(defineType).to.not.throw();
    });
    typeCompatibilityTest(defineType);

    describe('constructor', function(){

        it('should accept either type', function(){
            const Type = defineType();
            expect(new Type({foo:'bar'}).foo).to.eql('bar');
            expect(new Type({foo:2}).foo).to.eql(2);
            const foo = new TypeA();
            expect(new Type({foo}).foo).to.eql(foo);
        });
        it('should not accept unknown type', function() {
            const Type = defineType();
            expect(() =>
                new Type({foo:new Type()})
            ).to.report(ERROR_FIELD_MISMATCH_IN_CONSTRUCTOR('Generic.foo', 'TypeA|TypeB|string|number', 'Generic'));
        });

        it('should accept null if allowed', function() {
            const Type = defineNullableType();
            expect(new Type({foo:null}).foo).to.equal(null)

        });


    });
    describe('setter', function() {
        it('should accept either type', function () {
            const Type = defineType();
            const instance = new Type();
            instance.foo = 'bar';
            expect(instance.foo).to.equal('bar');
            instance.foo = 2;
            expect(instance.foo).to.equal(2);
            const foo = new TypeA();
            instance.foo = foo;
            expect(instance.foo).to.equal(foo);
        });

        /**
         *  simulation of
         *  https://github.com/wix/mutable/issues/85
         *  The bug only happens when there is a List field in the type of the complex value, as List.validate does not accept List instances.
         */
        it('should accept type (regression - list field in the type)', function () {
            const TypeC = aDataTypeWithSpec({ bar: mu.List.of(mu.String) }, 'TypeC');

            const Type = mu.define('Type', {
                spec: () => ({
                    foo: either(TypeA, TypeC)
                })
            });
            const instance = new Type();
            let foo = new TypeC(['a', 'b']);
            instance.foo = foo;
            expect(instance.foo).to.equal(foo);
        });
        it('should not accept unknown type', function () {
            const Type = defineType();
            const instance = new Type();

            expect(() => {
                instance.foo = new Type();
            }).to.report(ERROR_IN_SET('Generic.foo', 'TypeA|TypeB|string|number', 'Generic'));
        });

    });
    describe('get',function(){
        it('should work with primitives in readonly',()=>{
            const Type = defineType();
            const instance = new Type({foo:'bar'});
            expect(instance.foo).to.equal('bar');
            expect(instance.$asReadOnly().foo).to.equal('bar');
        })
    })
    describe('setValue', function() {

        it('should accept either type of mu', function () {
            const Type = defineType();
            const instance = new Type();
            instance.setValue({foo : 'bar'});
            expect(instance.foo).to.eql('bar');
            instance.setValue({foo : 2});
            expect(instance.foo).to.eql(2);
            var val = new TypeA();
            instance.setValue({foo : val});
            expect(instance.foo).to.equal(val);
            val = new TypeB();
            instance.setValue({foo : val});
            expect(instance.foo).to.equal(val);
        });
        it('should accept either form of JSON', function () {
            const Type = defineType();
            const instance = new Type();
            var val = new TypeA().toJSON();
            instance.setValue({foo : val});
            expect(instance.foo.toJSON()).to.eql(val);
            val = new TypeB().toJSON();
            instance.setValue({foo : val});
            expect(instance.foo.toJSON()).to.eql(val);
        });

        it("should accept null if nullable", function () {
            const Type = defineNullableType();
            const instance = new Type({
                foo: 'Monkey'
            });
            expect(() => instance.setValue({foo:null})).to.not.throw();
        });

        it("shouldn't crap its pants", function () {
            const Type = defineType();
            const instance = new Type({
                foo: 'Monkey'
            });
            expect(() => instance.toJSON()).to.not.throw();
        });
    });
});
