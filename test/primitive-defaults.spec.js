import {expect} from 'chai';
import * as mu from '../src';
import {lifecycleContract} from './lifecycle.contract.spec';

describe('primitive defaults', function() {

    it('null function', function() {
        var Type = mu.Function.nullable().withDefault(null);
        var value = Type.create();
        expect(value).to.equal(null);
    });

    it('null string', function() {
        var Type = mu.String.nullable().withDefault(null);
        var value = Type.create();
        expect(value).to.equal(null);
    });


    it('null boolean', function() {
        var Type = mu.Boolean.nullable().withDefault(null);
        var value = Type.create();
        expect(value).to.equal(null);
    });


    it('null number', function() {
        var Type = mu.Number.nullable().withDefault(null);
        var value = Type.create();
        expect(value).to.equal(null);
    });

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////

    it('function', function() {
        var Type = mu.Function.withDefault(function() { return 'abc' });
        var value = Type.create();
        expect(value()).to.equal('abc');
    });

    it('string', function() {
        var Type = mu.String.withDefault('abc');
        var value = Type.create();
        expect(value).to.equal('abc');
    });


    it('boolean', function() {
        var Type = mu.Boolean.withDefault(true);
        var value = Type.create();
        expect(value).to.equal(true);
    });


    it('number', function() {
        var Type = mu.Number.withDefault(123);
        var value = Type.create();
        expect(value).to.equal(123);
    });

});
