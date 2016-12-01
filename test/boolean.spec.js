import {expect} from 'chai';

import * as Mutable from '../src';
import {aDataTypeWithSpec} from '../test-kit/test-drivers';

describe('Boolean Type', function() {

    var Boolean = Mutable.Boolean;

    describe('js value is strictly boolean', function() {

        var BooleanValues = aDataTypeWithSpec({
            yes: Mutable.Boolean.withDefault(true),
            no: Mutable.Boolean.withDefault(false),
            default: Mutable.Boolean
        }, 'BooleanValues');

        var booleans;
        before(() => booleans = new BooleanValues());

        it('should resolve to javascript boolean', function() {
            expect(booleans.yes).to.be.a('boolean');
            expect(booleans.no).to.be.a('boolean');
            expect(booleans.default).to.be.a('boolean');
        });
    });
});
