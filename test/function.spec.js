import * as mu from '../src';
import testKit from '../test-kit';
import {expect} from 'chai';
import * as sinon from 'sinon';

/**
 * babel inherit implementation
 * // TODO move to test kit, test extension of all types
 */


describe('Function data', function() {
    it('wrapped function should execute properly', function() {

        var typedFunction = mu.Function.create(function myfunc() {
            return 1;
        });

        expect(typedFunction()).to.equal(1, 'wrapped function should execute properly');
    });

    it('Function.withDefault should return a default function', function() {
        var typedFunction = mu.Function.withDefault(function myfunc() {
            return 1;
        });
        expect(typedFunction.defaults()()).to.equal(1, 'wrapped function should execute properly');
    });

    it('is extendible', function() {
        var DerivedFunc = testKit.drivers.inheritBabel(mu.Function);
        DerivedFunc.of = function of(DataType) {
            var WithDataSpec = this.withDefault(undefined, undefined, { dataType: DataType });
            return WithDataSpec;
        };
        DerivedFunc.id = 'DerivedFunc';
        var innerSpy = sinon.spy();
        var StringDerivedFunc = DerivedFunc.of(mu.String);
        var func = new StringDerivedFunc(innerSpy);

        expect(func).not.to.throw();
        expect(innerSpy).to.have.been.calledOnce;
        expect(StringDerivedFunc.validate(func) || StringDerivedFunc.validateType(func)).to.be.true;

    });

});
