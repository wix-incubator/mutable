import {expect} from 'chai';
import sinon from 'sinon';

export default function testLifeCycleContract(factory, mutator, description, ...predicates) {
    describe(description, function () {
        before('init', function () {
            this.dirtySpy = sinon.spy();
            this.instance = factory();
            this.instance.$setDirty = this.dirtySpy;
        });
        it('calls $setDirty', function () {
           this.dirtySpy.reset();
            mutator(this.instance);
            expect(this.dirtySpy.called).to.be.true;
        });
        predicates.forEach(function (predicate) {
            it(predicate.description, function () {
                var isOk = predicate.condition(this.instance);
                expect(isOk).to.be.true;
            });
        });
        after('cleanup', function () {
            delete this.instance;
        });
    });
}