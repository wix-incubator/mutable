import {expect} from 'chai';

import lifeCycleAsserter from './lifecycle.js';

describe('List', function() {

	describe('lifecycle:',function() {
		lifeCycleAsserter.assertDirtyContract();
	});


});

require('./mutable/instance.spec');
require('./mutable/item-read.spec');
require('./mutable/views.spec');
require('./mutable/functional-programming.spec')
require('./mutable/set-value.spec');
require('./mutable/item-mutations.spec');
require('./mutable/in-place-mutations.spec');
