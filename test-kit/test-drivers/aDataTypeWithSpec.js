import * as Mutable from '../../src'

export default function(spec, displayName = 'unknown') {
    var createSpec = (typeof spec === 'function') ? spec : function() { return spec; };

    return Mutable.define(displayName, {
        spec: createSpec
    });
};
