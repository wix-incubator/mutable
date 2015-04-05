import Typorama from '../../src'

export default function(spec, displayName='unknown'){
    var createSpec = (typeof spec === 'function') ? spec : function(){ return spec; };

    return Typorama.define(displayName, {
        spec: createSpec
    });
};
