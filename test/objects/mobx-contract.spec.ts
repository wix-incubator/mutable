import * as mutable from '../../src';
import {expect} from 'chai';
import {spy, Lambda, Reaction, isObservableObject, extras} from 'mobx';
import * as sinon from 'sinon';
import {Class, MutableObj} from "../../src/objects/types";
import {SinonSpy} from 'sinon';
import {default as config} from '../../src/config';

type Parent = {foo:number};
type Child = Parent & {bar:number};

describe('[mobx contract] user defined class', () => {
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

    const trackingActionsContract = () => {
        let reaction:Reaction;
        beforeEach(() => {
            reaction = new Reaction('obj', ()=>{});
            expect(reaction.observing.length).to.eql(0);
        });
        afterEach(() => {
            reaction.dispose();
        });

        function assertReaction(){
            if (config.observable) {
                expect(reaction.observing.length).to.not.eql(0);
            } else {
                expect(reaction.observing.length).to.eql(0);
            }
        }

        it('own field read', () => {
            reaction.track(() => {
                child.bar;
            });
            assertReaction();
        });
        it('inherited field read', () => {
            reaction.track(() => {
                child.foo;
            });
            assertReaction();
        });
        it('toJSON', () => {
            reaction.track(() => {
                child.toJSON();
            });
            assertReaction();
        });
        it('toJS', () => {
            reaction.track(() => {
                child.toJS();
            });
            assertReaction();
        });
    };
    describe('tracks', trackingActionsContract);
    describe('(when config.observable is false) does not track', () => {
        before(()=>{
            config.observable = false;
        });
        after(()=>{
            config.observable = true;
        });
        trackingActionsContract();
    });
    describe('never track', () => {
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

    describe('reports to mobx spy and observer on', () => {
        let spyListener:(change: any) => void;
        let observeListener:(change: any) => void;
        let spyDestroy:Lambda;
        let observeDestroy:Lambda;
        function expectMobxReported(expected: {[k:string]:any}) {
            const eventMatcher = (change:{[k:string]:any}) => Object.keys(expected).every(k => change[k] === expected[k]);
            expect(spyListener).to.have.been.called;
            //    expect(observeListener).to.have.been.called;
            expect(spyListener).to.have.been.calledWith(sinon.match(eventMatcher));
            //    expect(observeListener).to.have.been.calledWith(sinon.match(eventMatcher));
        }
        beforeEach(()=>{
            observeListener = sinon.spy();
            //    observeDestroy = observe(child, observeListener);
            spyListener = sinon.spy();
            spyDestroy = spy(spyListener);
        });
        afterEach(()=>{
            //    observeDestroy();
            spyDestroy();
        });
        it('fields initialization', () => {
            child = new Child({bar:2});
            expectMobxReported({
                type: 'add',
                newValue: 2,
                name: 'bar'
            });
            expectMobxReported({
                type: 'add',
                newValue: 0,
                name: 'foo'
            });
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

    describe('satisfies mobx-react-devtools contract', () => {
        it('has a recognised administrator object', ()=>{
            expect(extras.getAdministration(child)).to.be.ok;
        });

        it('satisfies mobx.isObservableObject()', ()=>{
            expect(isObservableObject(child)).to.eql(true);
        });

        it('provides a meaningful result to getDebugName()', ()=>{
            expect(extras.getDebugName(child)).to.eql(child.getName());
        });

        it('has meaningful $mobx.name (otherwise constructor.name is used)', ()=>{
            expect((child as any).$mobx.name).to.eql(child.getName());
        });

        it('shows on reaction\'s getDependencyTree()', ()=>{
            const name = 'obj';
            const reaction = new Reaction(name, ()=>{});
            try {
                reaction.track(() => {
                    child.foo;
                });
                expect(extras.getDependencyTree(reaction)).to.eql({name, dependencies:[{name:`[${child.getName()}].foo`}]})
            } finally {
                reaction.dispose();
            }
        });
    });
});
