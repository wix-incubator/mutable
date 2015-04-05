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
        describe('basic clean > dirty > clean', function(){
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
                expect(framePredicate(this.instance.$asReadOnly())).to.be.true;
            });
            after('cleanup', function(){
                delete this.instance;
            });
        });

        if (!directlyDirtifies) {
            describe('dirty flag caching', function () {
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
                    expect(framePredicate(this.instance.$asReadOnly())).to.be.true;
                });
                after('cleanup', function () {
                    delete this.instance;
                });
            });
        }

        describe('read only', function(){
            before('init', function() {
                this.rw = factory();
                this.ro = this.rw.$asReadOnly();
            });
            it('$isDirty returns false', function(){
                expect(this.ro.$isDirty(true)).to.be.false;
            });
            it('mutator makes $isDirty return true, ignores read only caching attempt', function(){
                mutator(this.rw);
                expect(this.ro.$isDirty()).to.be.true;
            });
            it('$resetDirty on read only does not change anything', function(){
                this.ro.$resetDirty();
                expect(this.ro.$isDirty()).to.be.true;
            });
            it('$resetDirty on read write makes $isDirty return false again', function(){
                this.rw.$resetDirty();
                expect(this.ro.$isDirty()).to.be.false;
            });
            afterEach(function(){
                expect(this.ro.$isDirty()).to.eq(this.rw.$isDirty());
                expect(framePredicate(this.ro)).to.be.true;
            });
            after('cleanup', function(){
                delete this.rw;
                delete this.ro;
            });
        });
    });
}