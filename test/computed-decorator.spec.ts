import {expect} from 'chai';
import * as sinon from 'sinon';
import * as mu from '../src';

class Data extends mu.Object<{foo: string, bar:string}> {
    foo: string;
    bar: string;
}

class DataGetter  {
    data: Data;

    getFooBar(){
        this.onFoobar();
        return this.data.foo + this.data.bar;
    }
    onFoobar(){}
}

function makeObjectFromClass(dataClazz:typeof Data, dataGetterClazz:typeof DataGetter):DataGetter{

    class Data_ extends dataClazz{}

    const DefinedData = mu.define('MyData', {
        spec(_:any){
            return {
                foo:mu.String,
                bar:mu.String
            };
        }
    }, undefined, Data_);

    const result = new dataGetterClazz();
    result.data = new DefinedData();
    result.onFoobar = sinon.spy();
    return result;
}


describe.only('computed annotation', () => {

    it('(if absent) on js class calls method multiple times', () => {
        const getter = makeObjectFromClass(Data, DataGetter);
        getter.data.foo = '1';
        getter.data.bar = '2';
        [1,1,1,1].forEach(()=>expect (getter.getFooBar()).to.eql('12'));
        expect(getter.onFoobar).to.have.been.callCount(4);
    });

    it('on js class calls method once', () => {
        class ComputedGetter extends DataGetter{
            @mu.computed
            getFooBar() {
                return super.getFooBar();
            }
        }
        const getter = makeObjectFromClass(Data, ComputedGetter);
        getter.data.foo = '1';
        getter.data.bar = '2';
        [1,1,1,1].forEach(()=>expect (getter.getFooBar()).to.eql('12'));
        expect(getter.onFoobar).to.have.been.callCount(1);
    });

});
