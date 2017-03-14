import {expect} from 'chai';
import * as sinon from 'sinon';
import * as mu from '../src';
import {IReactionDisposer, autorun} from 'mobx';

class Data extends mu.Object<{foo: string, bar: string}> {
    foo: string;
    bar: string;
}

class DataGetter {
    data: Data;

    getFooBar() {
        this.onFoobar();
        return this.data.foo + this.data.bar;
    }

    onFoobar() {
    }
}

function makeObjectFromClass(dataClazz: typeof Data, dataGetterClazz: typeof DataGetter): DataGetter {

    class Data_ extends dataClazz {
    }

    const DefinedData = mu.define('MyData', {
        spec(_: any){
            return {
                foo: mu.String,
                bar: mu.String
            };
        }
    }, undefined, Data_);

    const result = new dataGetterClazz();
    result.data = new DefinedData();
    result.onFoobar = sinon.spy();
    return result;
}

class TestActions{
    private disposer1:IReactionDisposer;
    private disposer2:IReactionDisposer;
    public numInvocations = 4;
    constructor(private getter:DataGetter, private actionImpl:Function) {}
    autorun(){
        // will run once now and again when .foo or .bar change
        this.disposer1 = autorun(() => {
            this.actionImpl();
            this.actionImpl();
        });
        this.disposer2 = autorun(() => {
            this.actionImpl();
            this.actionImpl();
        });
    }
    dispose(){
        this.disposer1();
        this.disposer2();
    }
}

describe('computed annotation', () => {
    describe('(Baseline - without @computed)', () => {
        it('should not cache results when run in an action', () => {
            const getter = makeObjectFromClass(Data, DataGetter);
            const tester = new TestActions(getter, () => getter.getFooBar());
            tester.autorun();
            try {
                expect(getter.onFoobar).to.have.callCount(1 * tester.numInvocations);
                getter.data.foo = '7';
                expect(getter.onFoobar).to.have.callCount(2 * tester.numInvocations);
                getter.data.bar = '7';
                expect(getter.onFoobar).to.have.callCount(3 * tester.numInvocations);
            } finally {
                tester.dispose();
            }
        });
    });
    describe('on a class consuming Mutable object', ()=>{
        let getter:DataGetter;
        beforeEach(()=>{
            class ComputedGetter extends DataGetter {
                @mu.computed
                getFooBar() {
                    return super.getFooBar();
                }
            }
            getter = makeObjectFromClass(Data, ComputedGetter);
        });
        it('should return the correct result', ()=>{
            getter.data.foo = '1';
            getter.data.bar = '2';
            expect(getter.getFooBar()).to.eql('12');
        });
        it('should cache results when run in an action', () => {
            const tester = new TestActions(getter, () => getter.getFooBar());
            tester.autorun();
            try {
                expect(getter.onFoobar).to.have.callCount(1);
                getter.data.foo = '7';
                expect(getter.onFoobar).to.have.callCount(2);
                getter.data.bar = '7';
                expect(getter.onFoobar).to.have.callCount(3);
            } finally {
                tester.dispose();
            }
        });
    });
});
