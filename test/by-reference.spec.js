import {expect} from 'chai';
import {aDataTypeWithSpec} from '../test-kit/test-drivers';
import * as mu from '../src';
import * as sinon from 'sinon';

describe('reference', () => {
    let Type1, Root, reference, state;
    before(() => {
        Type1 = aDataTypeWithSpec({ foo: mu.String }, 'Type1');
        Root = aDataTypeWithSpec({
            foo: mu.String,
            complex: Type1,
            listFoo: mu.List.of(mu.String),
            listComplex: mu.List.of(Type1),
            mapFoo: mu.Es5Map.of(mu.String),
            mapComplex: mu.Es5Map.of(Type1)
        }, 'Root');
    });

    beforeEach('reset initial inner object', () => {
        reference = sinon.spy(() => state);
        state = {
            foo: 'bar',
            complex:{
                foo: 'bar'
            },
            listFoo:['foo', 'bar', 'baz'],
            listComplex:[{foo: 'bar'}, {foo: 'buz'}],
            mapFoo:{foo:'bar', baz:'fiz'},
            mapComplex:{foo:{foo: 'bar'}, baz:{foo: 'buz'}}
        };
    });

    it ('make a reference instance', () => {
        Root.byReference(reference);
        expect(reference).to.have.not.been.called;
    });

    describe('instance', () => {
        let rootRef;
        beforeEach('make an instance without resolving reference', () => {
            rootRef = Root.byReference(reference.bind(null)); // bind to null to avoid sinon-chai error reporting iterating over `this`
        });

        it ('is instance of its type', () => {
            expect(rootRef).to.be.instanceOf(Root);
            expect(reference).to.have.not.been.called;
        });

        describe('primitive property', () => {
            it ('has correct value', () => {
                expect(rootRef.foo).to.eql('bar');
                expect(reference).to.have.been.calledOnce;
            });

            it('tracks changes', () => {
                state.foo = 'baz';
                expect(rootRef.foo).to.eql(state.foo);
            });
        });

        describe('complex property', () => {
            it ('has correct value', () => {
                const element = rootRef.complex;
                expect(element).to.be.instanceOf(Type1);
                expect(reference).to.have.been.calledOnce;
                expect(element.foo).to.eql('bar');
                expect(reference).to.have.been.calledTwice;
            });

            it('tracks changes', () => {
                const element = rootRef.complex;
                state.complex.foo = 'baz';
                expect(element.foo).to.eql(state.complex.foo);
            });
        });

        describe('list of primitive property', () => {
            it ('has correct value', () => {
                const list = rootRef.listFoo;
                expect(list).to.be.instanceOf(mu.List);
                expect(reference).to.have.been.calledOnce;
                expect(list.at(0)).to.eql('foo');
                expect(list.toJS()).to.eql(['foo', 'bar', 'baz']);
            });

            it('tracks changes', () => {
                const list = rootRef.listFoo;
                state.listFoo = ['baz'];
                expect(list.toJS()).to.eql(state.listFoo);
            });
        });

        describe('list of complex property', () => {
            it ('has correct value', () => {
                const list = rootRef.listComplex;
                expect(list).to.be.instanceOf(mu.List);
                expect(reference).to.have.been.calledOnce;
                const element = list.at(0);
                expect(element).to.be.instanceOf(Type1);
                expect(element.foo).to.eql('bar');
                expect(list.toJS()).to.eql([{foo: 'bar'}, {foo: 'buz'}]);
            });

            it('tracks changes', () => {
                const list = rootRef.listComplex;
                state.listComplex = [{foo: 'meep'}];
                expect(list.toJS()).to.eql(state.listComplex);
            });
        });

        describe('map of primitive property', () => {
            it ('has correct value', () => {
                const map = rootRef.mapFoo;
                expect(map).to.be.instanceOf(mu.Es5Map);
                expect(reference).to.have.been.calledOnce;
                expect(map.get('foo')).to.eql(state.mapFoo.foo);
                expect(map.toJS()).to.eql(state.mapFoo);
            });

            it('tracks changes', () => {
                const map = rootRef.mapFoo;
                state.mapFoo = {'abc':'456'};
                expect(map.toJS()).to.eql(state.mapFoo);
            });
        });

        describe('map of complex property', () => {
            it ('has correct value', () => {
                const map = rootRef.mapComplex;
                expect(map).to.be.instanceOf(mu.Map);
                expect(reference).to.have.been.calledOnce;
                const element = map.get('foo');
                expect(element).to.be.instanceOf(Type1);
                expect(element.foo).to.eql(state.mapComplex.foo.foo);
                expect(map.toJS()).to.eql(state.mapComplex);
            });

            it('tracks changes', () => {
                const map = rootRef.mapComplex;
                state.mapComplex = {bar:{foo: '123'}};
                expect(map.toJS()).to.eql(state.mapComplex);
            });
        });
    });
});
