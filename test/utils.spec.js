import * as sinon from 'sinon';
import {expect} from 'chai';

import {cloneType} from '../src/utils';
import {aDataTypeWithSpec} from '../test-kit/test-drivers';

describe('utils', function() {

    describe("cloneType", function() {

        it("should merge origin type options with constructor options", function() {
            let spy = sinon.spy();
            class MockType{
                static options= { a: true };
                constructor(...args){
                    spy(...args);
                }
            }
            var CloneType = cloneType(MockType);

            new CloneType("value", { b: false });

            expect(spy).to.have.been.calledWith("value", { a: true, b: false });

        });

    });
});
