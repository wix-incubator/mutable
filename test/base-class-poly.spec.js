import {expect} from 'chai';

import * as mutable from '../src';
import {aDataTypeWithSpec} from '../test-kit/test-drivers';

describe('MuObject', function() {

    it('should be optionally nullable', function() {

        var TestType = aDataTypeWithSpec({
            poly: mutable.Object.nullable().withDefault(null)
        }, 'Test');

        var test = new TestType();

        expect(test.poly).to.equal(null);
    });

    it('should allow various types', function() {

        var Possib1 = aDataTypeWithSpec({
            value: mutable.String.withDefault('possib1')
        }, 'Possib1');

        var Possib2 = aDataTypeWithSpec({
            count: mutable.Number.withDefault(3.14),
            value: mutable.String.withDefault('possib2')
        }, 'Possib2');

        var TestType = aDataTypeWithSpec({
            poly: mutable.Object.nullable().withDefault(null)
        }, 'TestType');

        var test = new TestType();

        expect(test.poly).to.equal(null);
        test.poly = new Possib1();
        expect(test.poly.value).to.equal('possib1');
        test.poly = new Possib2();
        expect(test.poly.value).to.equal('possib2');
    });
});
