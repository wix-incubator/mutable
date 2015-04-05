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

function isDirectlyDirtifies(factory, mutator) {
    var instance = factory();
    mutator(instance);
    return instance.__dirty__.isKnown;
}


export default function testLifeCycleContract(factory, mutator, description, framePredicate = () => true){
    var idempotent = isIdempotent(factory, mutator);
    var directlyDirtifies = isDirectlyDirtifies(factory, mutator);
    describe(description + ' lifecycle contract', function() {
        describe('clean > dirty > clean', function(){
            before('init', function() {
                this.instance = factory();
            });
            it('$isDirty returns false', function(){
                expect(this.instance.$isDirty()).to.be.false;
            });
            it('mutator makes $isDirty return true', function(){
                mutator(this.instance);
                expect(this.instance.$isDirty()).to.be.true;
            });
            it('$resetDirty makes $isDirty return false again', function(){
                this.instance.$resetDirty();
                expect(this.instance.$isDirty()).to.be.false;
            });
            if (idempotent) {
                it('idempotent mutator makes $isDirty return false on subsequent invocations', function () {
                    mutator(this.instance);
                    expect(this.instance.$isDirty()).to.be.true; // TODO should be false
                });
            }
            afterEach(function(){
                expect(framePredicate(this.instance)).to.be.true;
            });
            after('cleanup', function(){
                delete this.instance;
            });
        });

        if (!directlyDirtifies) {
            describe('cache on: clean > dirty > clean', function () {
                before('init', function () {
                    this.instance = factory();
                });
                it('$isDirty returns false', function () {
                    expect(this.instance.$isDirty(true)).to.be.false;
                });
                it('mutator does not change $isDirty result', function () {
                    mutator(this.instance);
                    expect(this.instance.$isDirty(true)).to.be.false;
                });
                it('$resetDirty makes $isDirty return false again', function () {
                    this.instance.$resetDirty();
                    expect(this.instance.$isDirty()).to.be.false;
                });
                afterEach(function () {
                    expect(framePredicate(this.instance)).to.be.true;
                });
                after('cleanup', function () {
                    delete this.instance;
                });
            });
        }
    });
}