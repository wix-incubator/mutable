import {expect} from 'chai';
import {aDataTypeWithSpec} from '../test-kit/test-drivers';
import * as Mutable from '../src';
import * as sinon from 'sinon';

describe('reference', () => {
    let Type1, Type2, inner, reference, state;
    before(() => {
        Type1 = aDataTypeWithSpec({ foo: Mutable.String }, 'Type1');
        Type2 = aDataTypeWithSpec({
            foo: Mutable.String,
            complex: Type1,
            listFoo: Mutable.List.of(Mutable.String),
            listComplex: Mutable.List.of(Type1)
        }, 'Type2');
    });

    beforeEach('reset initial inner object', () => {
        reference = sinon.spy(() => state);
        state = {
            foo: 'bar',
            complex:{
                foo: 'bar'
            },
            listFoo:['foo', 'bar', 'baz'],
            listComplex:[{foo: 'bar'}, {foo: 'buz'}]
        };
    });

    it ('make a reference instance', () => {
        const lazy = Type2.byReference(reference);
        expect(reference).to.have.not.been.called;
    });

    describe('instance', () => {
        let lazy;
        beforeEach('make an instance without resolving reference', () => {
            lazy = Type2.byReference(reference.bind(null)); // bind to null to avoid sinon-chai error reporting iterating over `this`
        });

        it ('is instance of its type', () => {
            expect(lazy).to.be.instanceOf(Type2);
            expect(reference).to.have.not.been.called;
        });

        describe('primitive property', () => {
            it ('has correct value', () => {
                expect(lazy.foo).to.eql('bar');
                expect(reference).to.have.been.calledOnce;
            });

            it('tracks changes', () => {
                state.foo = 'baz';
                expect(lazy.foo).to.eql(state.foo);
            });
        });

        describe('complex property', () => {
            it ('has correct value', () => {
                const complexProperty = lazy.complex;
                expect(complexProperty).to.be.instanceOf(Type1);
                expect(reference).to.have.been.calledOnce;
                expect(complexProperty.foo).to.eql('bar');
                expect(reference).to.have.been.calledTwice;
            });

            it('tracks changes', () => {
                const complexProperty = lazy.complex;
                state.complex.foo = 'baz';
                expect(complexProperty.foo).to.eql(state.complex.foo);
            });
        });

        describe('list of primitive property', () => {
            it ('has correct value', () => {
                const list = lazy.listFoo;
                expect(list).to.be.instanceOf(Mutable.List);
                expect(reference).to.have.been.calledOnce;
                expect(list.at(0)).to.eql('foo');
                expect(list.toJS()).to.eql(['foo', 'bar', 'baz']);
            });

            it('tracks changes', () => {
                const list = lazy.listFoo;
                state.listFoo = ['baz'];
                expect(list.toJS()).to.eql(state.listFoo);
            });
        });

        describe('list of complex property', () => {
            it ('has correct value', () => {
                const list = lazy.listComplex;
                expect(list).to.be.instanceOf(Mutable.List);
                expect(reference).to.have.been.calledOnce;
                const complexElement = list.at(0);
                expect(complexElement).to.be.instanceOf(Type1);
                expect(complexElement.foo).to.eql('bar');
                expect(list.toJS()).to.eql([{foo: 'bar'}, {foo: 'buz'}]);
            });

            it('tracks changes', () => {
                const list = lazy.listComplex;
                state.listComplex = [{foo: 'meep'}];
                expect(list.toJS()).to.eql(state.listComplex);
            });
        });
    });

});
