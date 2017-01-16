import * as mutable from '../src';
import {expect} from 'chai';
import {spy, Lambda} from 'mobx';
import * as sinon from 'sinon';
import {Class} from "../src/objects/types";

describe('user defined class', () => {
    let listener:(change: any) => void;
    let spyDestroy:Lambda;
    function expectMobxReported(expected: {[k:string]:any}) {
        const eventMatcher = (change:{[k:string]:any}) => Object.keys(expected).every(k => change[k] === expected[k]);
        expect(listener).to.have.been.calledWith(sinon.match(eventMatcher));
    }
    beforeEach(()=>{
        listener = sinon.spy();
        spyDestroy = spy(listener);
    });
    afterEach(()=>{
        spyDestroy();
    });
    let Child:Class<{foo:number, bar:number}>;
    before(()=>{
        const Parent = mutable.define<{foo:number}>('Parent', {spec:(c)=>({
            foo:mutable.Number
        })});
        Child = mutable.define<{foo:number, bar:number}, {foo:number}>('Child', {spec:(c)=>({
            bar:mutable.Number
        })}, Parent);
    });
    it('own field assignment is observed by mobx', () => {
        const child = new Child();
        child.bar = 2;
        expectMobxReported({
            type: 'update',
            oldValue: 0,
            newValue: 2,
            name: 'bar'
        });
    });
    it('inherited field assignment is observed by mobx', () => {
        const child = new Child();
        child.foo = 2;
        expectMobxReported({
            type: 'update',
            oldValue: 0,
            newValue: 2,
            name: 'foo'
        });
    });
    it('setValue is observed by mobx', () => {
        const child = new Child();
        child.setValue({foo : 2, bar : 2});
        expectMobxReported({
            type: 'update',
            oldValue: 0,
            newValue: 2,
            name: 'foo'
        });
        expectMobxReported({
            type: 'update',
            oldValue: 0,
            newValue: 2,
            name: 'bar'
        });
    });
    it('setValueDeep is observed by mobx', () => {
        const child = new Child();
        child.setValueDeep({foo : 2, bar : 2});
        expectMobxReported({
            type: 'update',
            oldValue: 0,
            newValue: 2,
            name: 'foo'
        });
        expectMobxReported({
            type: 'update',
            oldValue: 0,
            newValue: 2,
            name: 'bar'
        });
    });
});
