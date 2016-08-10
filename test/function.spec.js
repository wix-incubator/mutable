import * as Mutable from '../src';
import {expect} from 'chai';

describe('Function data', function() {
    it('wrapped function should execute properly', function() {

        var typedFunction = Mutable.Function.create(function myfunc() {
            return 1;
        });

        expect(typedFunction()).to.equal(1, 'wrapped function should execute properly');
    });

    it('Function.withDefault should return a default function', function() {
        var typedFunction = Mutable.Function.withDefault(function myfunc() {
            return 1;
        });
        expect(typedFunction.defaults()()).to.equal(1, 'wrapped function should execute properly');
    });

});
