
import lifeCycleAsserter from './lifecycle';

describe('Map', function() {

	describe('lifecycle',function() {
		lifeCycleAsserter.assertDirtyContract();
	});

});

require('./mutable/instance.spec');
