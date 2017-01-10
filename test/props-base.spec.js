import {expect} from 'chai';

import * as mu from '../src';

describe('PropsBase', function() {
    it('is defined as stub', function() {
        expect(mu.PropsBase).to.be.a('function');
    });
});
