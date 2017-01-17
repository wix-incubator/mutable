import * as mutable from '../../src';
import {expect} from 'chai';
import {spy, Lambda, Reaction} from 'mobx';
import * as sinon from 'sinon';
import {Class, MutableObj} from "../../src/objects/types";
import {SinonSpy} from 'sinon';

type Parent = {foo:number};
type Child = Parent & {bar:number};

describe('user defined class', () => {
    let Child:Class<Child>;
    let child:MutableObj<Child>;

    before(()=>{
        const Parent = mutable.define<Parent>('Parent', {spec:(c)=>({
            foo:mutable.Number
        })});
        Child = mutable.define<Child, Parent>('Child', {spec:(c)=>({
            bar:mutable.Number
        })}, Parent);
    });
    beforeEach(() => {
        child = new Child();
    });

    describe('tracks', () => {
        let objSpy:SinonSpy, reaction:Reaction;
        beforeEach(() => {
            objSpy = sinon.spy();
            reaction = new Reaction('obj', objSpy);
            expect(reaction.observing.length).to.eql(0);
        });
        afterEach(() => {
            reaction.dispose();
        });

        it('own field read', () => {
            reaction.track(() => {
                child.bar;
            });
            expect(reaction.observing.length).to.not.eql(0);
        });
        it('inherited field read', () => {
            reaction.track(() => {
                child.foo;
            });
            expect(reaction.observing.length).to.not.eql(0);
        });
        it('toJSON', () => {
            reaction.track(() => {
                child.toJSON();
            });
            expect(reaction.observing.length).to.not.eql(0);
        });
        it('toJS', () => {
            reaction.track(() => {
                child.toJS();
            });
            expect(reaction.observing.length).to.not.eql(0);
        });
    });

    describe('does not track', () => {
        let objSpy:SinonSpy, reaction:Reaction;
        beforeEach(() => {
            objSpy = sinon.spy();
            reaction = new Reaction('obj', objSpy);
            expect(reaction.observing.length).to.eql(0);
        });
        afterEach(() => {
            reaction.dispose();
        });

        it('setValue with empty argument', () => {
            reaction.track(() => {
                child.setValue({});
            });
            expect(reaction.observing.length).to.eql(0);
        });

        it('setValueDeep with empty argument', () => {
            reaction.track(() => {
                child.setValueDeep({});
            });
            expect(reaction.observing.length).to.eql(0);
        });
    });

    describe('triggers mobx reaction on changes to', () => {
        let fooSpy:SinonSpy, fooReaction:Reaction, barSpy:SinonSpy, barReaction:Reaction;
        beforeEach(() => {
            fooSpy = sinon.spy();
            fooReaction = new Reaction('foo', fooSpy);
            fooReaction.track(() => child.foo);
            barSpy = sinon.spy();
            barReaction = new Reaction('bar', barSpy);
            barReaction.track(() => child.bar);
        });
        afterEach(() => {
            fooReaction.dispose();
            barReaction.dispose();
        });
        it('own field assignment', () => {
            child.bar = 2;
            expect(barSpy).to.have.been.callCount(1);
            expect(fooSpy).to.have.been.callCount(0);
        });
        it('inherited field assignment', () => {
            child.foo = 2;
            expect(barSpy).to.have.been.callCount(0);
            expect(fooSpy).to.have.been.callCount(1);
        });

        it('setValue', () => {
            child.setValue({foo : 2, bar : 2});
            expect(fooSpy).to.have.been.callCount(1);
            expect(barSpy).to.have.been.callCount(1);
        });

        it('setValueDeep', () => {
            child.setValueDeep({foo : 2, bar : 2});
            expect(fooSpy).to.have.been.callCount(1);
            expect(barSpy).to.have.been.callCount(1);
        });
    });

    describe('does not trigger mobx reaction as a result of', () => {
        let objSpy:SinonSpy, reaction:Reaction;
        beforeEach(() => {
            objSpy = sinon.spy();
            reaction = new Reaction('obj', objSpy);
            reaction.track(() => child.foo + child.bar);
        });
        afterEach(() => {
            reaction.dispose();
        });

        it('setValue with empty argument', () => {
            child.setValue({});
            expect(objSpy).to.have.been.callCount(0);
        });

        it('setValueDeep with empty argument', () => {
            child.setValueDeep({});
            expect(objSpy).to.have.been.callCount(0);
        });

        it('setting field to NaN', () => {
            child.foo = NaN;
            expect(objSpy).to.have.been.callCount(1);
            child.foo = NaN;
            expect(objSpy).to.have.been.callCount(1);
        });
    });

    describe('reports to mobx spy on', () => {
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
        it('own field assignment', () => {
            child.bar = 2;
            expectMobxReported({
                type: 'update',
                oldValue: 0,
                newValue: 2,
                name: 'bar'
            });
        });
        it('inherited field assignment', () => {
            child.foo = 2;
            expectMobxReported({
                type: 'update',
                oldValue: 0,
                newValue: 2,
                name: 'foo'
            });
        });
        it('setValue', () => {
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
        it('setValueDeep', () => {
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
});
