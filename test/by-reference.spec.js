import {expect} from 'chai';
import {aDataTypeWithSpec} from '../test-kit/test-drivers';
import * as Mutable from '../src';
import * as sinon from 'sinon';

describe.only('reference', () => {
    let Type1, Type2, inner, reference;
    before(() => {
        Type1 = aDataTypeWithSpec({ foo: Mutable.String }, 'Type1');
        Type2 = aDataTypeWithSpec({ foo: Mutable.String, complex: Type1 }, 'Type2');
    });

    beforeEach('reset initial inner object', () => {
        inner = {
            foo: 'bar',
            complex:{
                foo: 'bar'
            }
        };
        reference = sinon.spy(() => inner);
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

        it ('has primitive properties as provided', () => {
            expect(lazy.foo).to.eql('bar');
            expect(reference).to.have.been.calledOnce;
        });

        it('tracks changes in primitive properties', () => {
            expect(lazy.foo).to.eql('bar');
            expect(reference).to.have.been.calledOnce;
            inner.foo = 'baz';
            expect(lazy.foo).to.eql('baz');
            expect(reference).to.have.been.calledTwice;
        });

        it ('has complex type properties as provided', () => {
            const complexProperty = lazy.complex;
            expect(complexProperty).to.be.instanceOf(Type1);
            expect(complexProperty.foo).to.eql('bar');
            expect(reference).to.have.been.calledOnce;
        });

        it('tracks changes in complex properties', () => {
            expect(lazy.complex.foo).to.eql('bar');
            expect(reference).to.have.been.calledOnce;
            inner.complex.foo = 'baz';
            expect(lazy.complex.foo).to.eql('baz');
            expect(reference).to.have.been.calledTwice;
        });
    });

});
