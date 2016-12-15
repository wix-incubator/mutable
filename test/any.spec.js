import {expect} from 'chai';
import {aDataTypeWithSpec} from '../test-kit/test-drivers';

import * as Mutable from '../src';
import Any from '../src/any';
import {typeCompatibilityTest} from "./type-compatibility.contract";

const TypeA = aDataTypeWithSpec({ bar: Mutable.String }, 'TypeA');
const TypeB = aDataTypeWithSpec({ bar: Mutable.Number }, 'TypeB');

describe('a type with any type field', function() {
    function defineType(){
        return aDataTypeWithSpec({ foo: Any }, 'Generic');
    }
    it('should not throw on definition', function(){
        expect(defineType).to.not.throw();
    });
    typeCompatibilityTest(defineType);

    describe('constructor', function(){

        it('should accept any type', function(){
            const Type = defineType();
            expect(new Type({foo:'bar'}).foo).to.eql('bar');
            expect(new Type({foo:2}).foo).to.eql(2);
            expect(new Type({foo:new TypeA()}).foo).to.eql(new TypeA());
        });

        it('should accept null', function() {
            const Type = defineType();
            expect(new Type({foo:null}).foo).to.equal(null)

        });
    });

    describe('setter', function() {
        it('should accept any type', function () {
            const Type = defineType();
            const instance = new Type();
            instance.foo = 'bar';
            expect(instance.foo).to.eql('bar');
            instance.foo = 2;
            expect(instance.foo).to.eql(2);
            instance.foo = new TypeA();
            expect(instance.foo).to.eql(new TypeA());
        });
        it('should accept null', function () {
            const Type = defineType();
            const instance = new Type();
            instance.foo = null;
            expect(instance.foo).to.be.null;
        });
    });
    describe('get',function(){
        it('should work with primitives in readonly',()=>{
            const Type = defineType();
            const instance = new Type({foo:'bar'});
            expect(instance.foo).to.equal('bar');
            expect(instance.$asReadOnly().foo).to.equal('bar');
        })
    });
    describe('setValue', function() {
        it('should accept either type of Mutable', function () {
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
        it('should accept either form of typed JSON', function () {
            const Type = defineType();
            const instance = new Type();
            var val = new TypeA().toJSON(true, true);
            instance.setValue({foo : val});
            expect(instance.foo).to.be.an.instanceof(TypeA);
            expect(instance.foo.toJSON(true, true)).to.eql(val);
            val = new TypeB().toJSON(true, true);
            instance.setValue({foo : val});
            expect(instance.foo).to.be.an.instanceof(TypeB);
            expect(instance.foo.toJSON(true, true)).to.eql(val);
        });

        it("should accept null", function () {
            const Type = defineType();
            const instance = new Type({foo: 'Monkey'});
            expect(() => instance.setValue({foo:null})).to.not.throw();
            expect(instance.foo).to.be.null;
        });
    });
});
