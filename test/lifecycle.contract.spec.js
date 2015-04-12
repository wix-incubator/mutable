import {expect} from 'chai';
import sinon from 'sinon';



describe('assume',() => {
    it('spy works', () =>{
        var spy = sinon.spy();
        expect(spy.called).to.be.false;
        spy.reset();

        spy();
        expect(spy.called).to.be.true;
    });
});



export function setDirtyContractTest(factory, mutator, description, ...predicates) {
    describe(description, function () {
        before('init', function () {
            this.instance = factory();
            this.dirtySpy = sinon.spy(this.instance, '$setDirty');
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

export function isDirtyContractTest(containerFactory, childFactory, description, ...predicates){
    describe(description, function () {
        before('init', function () {
            this.child = childFactory();
            this.container = containerFactory(this.child);
            this.dirtyStub = sinon.stub(this.child, '$isDirty', () => true);
        });
        it('calls $isDirty', function () {
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