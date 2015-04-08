import {expect} from 'chai';

function isIdempotent(factory, mutator) {
    var instance = factory();
    mutator(instance);
    var json = JSON.stringify(instance);
    var anotherInstance = factory();
    mutator(anotherInstance);
    mutator(anotherInstance);
    var anotherJson = JSON.stringify(anotherInstance);
    return anotherJson === json;
}


export default function testLifeCycleContract(factory, mutator, description, ...predicates) {
    var directlyDirtifies = isDirectlyDirtifies(factory, mutator);
    describe(description, function () {
        before('init', function () {
            this.dirtySpy = sinon.spy();
            this.instance = factory();
            instance.$isDirty = this.dirtySpy;
        });
        it('mutator calls $setDirty', function () {
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
        if (isIdempotent(factory, mutator)) {
            it('idempotent mutator makes $isDirty return true on subsequent invocations', function () {
                this.dirtySpy.reset();
                mutator(this.instance);
                expect(this.dirtySpy.called).to.be.true; // TODO should be false
            });
        }
        after('cleanup', function () {
            delete this.instance;
        });
    });
}