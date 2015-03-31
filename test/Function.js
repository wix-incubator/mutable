import Typorama from '../src';
import {expect} from 'chai';

describe('Function data', function() {
	it('Should be able to validate', function() {

		var typedFunction = Typorama.Function.create(function myfunc() {
			return 1;
		});

		expect(typedFunction()).to.equal(1, 'wrapped function should execute properly');
	});
});
