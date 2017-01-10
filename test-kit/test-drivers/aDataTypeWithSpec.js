import * as mu from '../../src'

export default function(spec, displayName = 'unknown') {
    var createSpec = (typeof spec === 'function') ? spec : function() { return spec; };

    return mu.define(displayName, {
        spec: createSpec
    });
};
