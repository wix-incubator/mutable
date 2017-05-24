import {expect} from 'chai';
import {ArrayWrapper} from '../src/data-types/array-wrapper';
import {isArrayLike} from 'lodash';
import * as sinon from 'sinon';

function mapper(input:number):string{
    return '*'+input;
}
describe('array wrapper', () => {
    let wrapper : ArrayWrapper<string, number>;
    let reference : () => number[];
    let origin : number[];
    let expected : () => string[];

    beforeEach('reset initial inner object', () => {

        // reference is the method that fetches the inner array data
        reference = sinon.spy(() =>origin.slice());
        origin = [5, 7, 11]; // the source of the data
        expected = () => origin.map(mapper); // expected view of the data

        wrapper = new ArrayWrapper<string, number>(reference, mapper);
        expect(reference).to.have.not.been.called;
    });

    it ('creates an array-like instance', () => {
        expect(isArrayLike(wrapper), 'isArrayLike').to.be.true;
        expect(reference).to.have.been.calledOnce; // internally checks .length property
    });

    describe('.length', () => {
        it ('reflects the wrapped value', () => {
            expect(wrapper.length).to.eql(origin.length);
            expect(reference).to.have.been.calledOnce;
        });
        it ('reflects changes in the wrapped value', () => {
            origin = [];
            expect(wrapper.length).to.eql(origin.length);
            expect(reference).to.have.been.calledOnce;
        });
    });

    describe('index acessor', () => {
        it('reflects the wrapped value', () => {
            expect(wrapper[0]).to.eql(expected()[0]);
            expect(wrapper[1]).to.eql(expected()[1]);
            expect(wrapper[2]).to.eql(expected()[2]);
            expect(reference).to.have.been.calledThrice;
        });
        it ('reflects changes in the wrapped value', () => {
            origin = [1, 2];
            expect(wrapper[0]).to.eql(expected()[0]);
            expect(wrapper[1]).to.eql(expected()[1]);
            expect(reference).to.have.been.calledTwice;
            let result2;
            expect(() => result2 = wrapper[2]).to.report({ level: 'warn'});
            expect(result2).to.be.undefined;
            expect(reference).to.have.been.calledThrice;
        });
    });

    describe('.map', () => {
        it ('works as expected', () => {
            expect(wrapper.map(e => '_'+e)).to.eql(expected().map(e => '_'+e));
            expect(reference).to.have.callCount(origin.length+1);
        });
    });

    describe('.reverse', () => {
        it ('works as expected', () => {
            expect(wrapper.map(e => '_'+e)).to.eql(expected().map(e => '_'+e));
            expect(reference).to.have.callCount(origin.length+1);
        });
    });

    describe('.slice', () => {
        it ('works as expected (no args)', () => {
            expect(wrapper.slice()).to.eql(expected().slice());
            expect(reference).to.have.callCount(origin.length + 1);
        });
        it ('works as expected (with args)', () => {
            const start = 1, end = 2;
            expect(wrapper.slice(start, end)).to.eql(expected().slice(start, end));
            expect(reference).to.have.callCount(end - start + 1);
        });
    });

    describe('.join', () => {
        it ('works as expected', () => {
            expect(wrapper.join(' ')).to.eql(expected().join(' '));
            expect(reference).to.have.callCount(origin.length+1);
        });
    });

    describe('.indexOf', () => {
        it ('works as expected', () => {
            expect(wrapper.indexOf(mapper(7))).to.eql(expected().indexOf(mapper(7)));
            expect(reference).to.have.callCount(expected().indexOf(mapper(7))+2);
        });
        it ('works as expected (not found)', () => {
            expect(wrapper.indexOf(mapper(-100))).to.eql(expected().indexOf(mapper(-100)));
            expect(reference).to.have.callCount(origin.length+1);
        });
    });

    describe('.lastIndexOf', () => {
        it ('works as expected', () => {
            origin = [11, 5, 7, 7, 5, 11];
            expect(wrapper.lastIndexOf(mapper(7))).to.eql(expected().lastIndexOf(mapper(7)));
            expect(reference).to.have.callCount(origin.length - expected().lastIndexOf(mapper(7))+1);
        });
        it ('works as expected (not found)', () => {
            expect(wrapper.lastIndexOf(mapper(-100))).to.eql(expected().lastIndexOf(mapper(-100)));
            expect(reference).to.have.callCount(origin.length+1);
        });
    });

    describe('.reduce', () => {
        it ('works as expected', () => {
            expect(wrapper.reduce((a:string,c:string)=>a+c)).to.eql(expected().reduce((a:string,c:string)=>a+c));
            expect(reference).to.have.callCount(origin.length+1);
        });
    });
});
