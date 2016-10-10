
import lifeCycleAsserter from './lifecycle';

describe('Es5 Map', function() {

    describe('lifecycle', function() {
        lifeCycleAsserter.assertDirtyContract();
    });

});

require('./mutable/instance.spec');
require('./type-edge-cases.spec');
