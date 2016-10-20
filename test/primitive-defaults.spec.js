import * as sinon from 'sinon';
import {expect} from 'chai';

import * as Mutable from '../src';
import {aDataTypeWithSpec} from '../test-kit/test-drivers';
import {lifecycleContract} from './lifecycle.contract.spec';

describe('primitive defaults', function() {

    it('null function', function() {
        var Type = Mutable.Function.nullable().withDefault(null);
        var value = Type.create();
        expect(value).to.equal(null);
    });

    it('null string', function() {
        var Type = Mutable.String.nullable().withDefault(null);
        var value = Type.create();
        expect(value).to.equal(null);
    });


    it('null boolean', function() {
        var Type = Mutable.Boolean.nullable().withDefault(null);
        var value = Type.create();
        expect(value).to.equal(null);
    });


    it('null number', function() {
        var Type = Mutable.Number.nullable().withDefault(null);
        var value = Type.create();
        expect(value).to.equal(null);
    });

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////

    it('function', function() {
        var Type = Mutable.Function.withDefault(function() { return 'abc' });
        var value = Type.create();
        expect(value()).to.equal('abc');
    });

    it('string', function() {
        var Type = Mutable.String.withDefault('abc');
        var value = Type.create();
        expect(value).to.equal('abc');
    });


    it('boolean', function() {
        var Type = Mutable.Boolean.withDefault(true);
        var value = Type.create();
        expect(value).to.equal(true);
    });


    it('number', function() {
        var Type = Mutable.Number.withDefault(123);
        var value = Type.create();
        expect(value).to.equal(123);
    });

});
