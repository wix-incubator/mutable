
import lifeCycleAsserter from './lifecycle.js';



describe('Map', function() {

	describe('lifecycle',function() {
		lifeCycleAsserter.assertDirtyContract();
	});

});
require('./mutable/instance.spec');
