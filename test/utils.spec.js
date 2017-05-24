import * as sinon from 'sinon';
import {expect} from 'chai';

import {cloneType} from '../src/utils';
import {isAssignableFrom} from '../src/core/validation';

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
            var CloneType = cloneType('CloneType', MockType);

            new CloneType("value", { b: false });

            expect(spy).to.have.been.calledWith("value", { a: true, b: false });

        });

        it("two inherited classes should still be isAssignableFrom", function() {
            class MockType{
                static options= { a: true };
                constructor(...args){
                    spy(...args);
                }
            }
            var CloneType1 = cloneType('CloneType1', MockType);
            var CloneType2 = cloneType('CloneType2', MockType);

            expect(isAssignableFrom(CloneType1, CloneType2)).to.eql(true);
        });
    });
});
