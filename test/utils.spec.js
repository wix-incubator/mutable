/**
 * Created by amira on 1/4/15.
 */

import _ from 'lodash';
import { cloneType } from '../src/utils';
import { aDataTypeWithSpec } from '../test-kit/testDrivers/index';
import { expect, err } from 'chai';
import sinon from 'sinon';

describe('utils', function() {

    describe("cloneType", function() {

        it("should merge origin type options with constructor options", function() {
            var MockType = {
				options:{a:true},
				create:sinon.stub()
			};
			var CloneType = cloneType(MockType);

			new CloneType("value", {b:false});

			expect(MockType.create).to.have.been.calledWith("value", {a:true,b:false});

        });

    });
});
