import * as Typorama from '../src';
import {expect} from 'chai';

describe('Function data', function() {
    it('wrapped function should execute properly', function() {

        var typedFunction = Typorama.Function.create(function myfunc() {
            return 1;
        });

        expect(typedFunction()).to.equal(1, 'wrapped function should execute properly');
    });

    it('Function.withDefault should return a default function', function() {
        var typedFunction = Typorama.Function.withDefault(function myfunc() {
            return 1;
        });
        expect(typedFunction.defaults()()).to.equal(1, 'wrapped function should execute properly');
    });
});
