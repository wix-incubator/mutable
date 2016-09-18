import {expect} from 'chai';
import {Report} from 'escalate/dist/test-kit/testDrivers';
import {typeCompatibilityTest} from "../type-compatibility.contract";
import * as Mutable from '../../src';
import {ERROR_KEY_MISMATCH_IN_MAP_CONSTRUCTOR, ERROR_FIELD_MISMATCH_IN_MAP_CONSTRUCTOR} from '../../test-kit/test-drivers/reports';
import {either} from '../../src/generic-types';

describe("Map", () => {
    it("field of type Map can be null", function() {
        const TestType = Mutable.define('TestType', {
            spec: () => ({
                map: Mutable.Map.of(Mutable.String, Mutable.String).nullable()
            })
        });
        const tt = new TestType();
        expect(function() {
            tt.map = null;
            },
            'assignment'
        ).to.not.throw();
        expect(function() {
            tt.setValue({ map: null })
            },
            'setValue'
        ).to.not.throw();
    });
});
