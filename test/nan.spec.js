import * as mu from '../src';
import {expect} from 'chai';
import {forEach} from 'lodash';
import * as sinon from 'sinon';

describe("setting NaN value", ()=>{
    let currValue, setter;
    beforeEach('set up object',() => {
        setter = sinon.spy();
    });

    describe("in a user type", ()=>{
        let Container, instance;
        before('set up type',() => {
            Container = mu.define('Container', {spec: () => ({num: mu.Number})});
        });
        beforeEach('set up object',() => {
            instance = new Container();
            instance.__value__ = {
                get num(){
                    return currValue;
                },
                set num(n){
                    setter(n);
                }
            }
        });
        describe("set value to NaN if pre-existing normal number value", ()=>{
            beforeEach('set pre-existing value to 6', ()=>{
                currValue = 6;
            });
            it('property setter', ()=>{
                instance.num = NaN;
                expect(setter).to.have.been.calledWith(NaN);
            });
            it('setValue', ()=>{
                instance.setValue({ num:NaN});
                expect(setter).to.have.been.calledWith(NaN);
            });
            it('setValueDeep', ()=>{
                instance.setValueDeep({ num:NaN});
                expect(setter).to.have.been.calledWith(NaN);
            });
        });

        describe("do nothing if pre-existing NaN value", ()=>{
            beforeEach('set pre-existing value to NaN', ()=>{
                currValue = NaN;
            });
            it('property setter', ()=>{
                instance.num = NaN;
                expect(setter).to.have.not.been.called;
            });
            it('setValue', ()=>{
                instance.setValue({ num:NaN});
                expect(setter).to.have.not.been.called;
            });
            it('setValueDeep', ()=>{
                instance.setValueDeep({ num:NaN});
                expect(setter).to.have.not.been.called;
            });
        });
    });

    describe("in a list", ()=>{
        let Container, instance;
        before('set up type',() => {
            Container = mu.List.of(mu.Number);
        });
        beforeEach('set up object',() => {
            instance = new Container();
            instance.__value__ = {
                get '0'(){
                    return currValue[0];
                },
                set '0'(n){},
                get '1'(){
                    return currValue[1];
                },
                set '1'(n){
                    setter(n);
                },
                get '2'(){
                    return currValue[2];
                },
                set '2'(n){}
            }
        });
        describe("set value to NaN if pre-existing normal number value", ()=>{
            beforeEach('set pre-existing value to 1', ()=>{
                currValue = [1, 1, 1];
            });
            it('property setter', ()=>{
                instance.set(1, NaN);
                expect(setter).to.have.been.calledWith(NaN);
            });
            it('setValue', ()=>{
                instance.setValue([1, NaN, 1]);
                expect(setter).to.have.been.calledWith(NaN);
            });
            it('setValueDeep', ()=>{
                instance.setValueDeep([1, NaN, 1]);
                expect(setter).to.have.been.calledWith(NaN);
            });
        });

        describe("do nothing if pre-existing NaN value", ()=>{
            beforeEach('set pre-existing value to NaN', ()=>{
                currValue = [1, NaN, 1];
            });
            it('property setter', ()=>{
                instance.set(1, NaN);
                expect(setter).to.have.not.been.called;
            });
            it('setValue', ()=>{
                instance.setValue([1, NaN, 1]);
                expect(setter).to.have.not.been.called;
            });
            it('setValueDeep', ()=>{
                instance.setValueDeep([1, NaN, 1]);
                expect(setter).to.have.not.been.called;
            });
        });
    });

    describe("in a map", ()=>{
        let Container, instance, otherChangeSpy;
        before('set up type',() => {
            Container = mu.Es5Map.of(mu.Number);
        });
        beforeEach('set up object',() => {
            otherChangeSpy = sinon.spy();
            instance = new Container();
            instance.__value__ = {
                keys(){
                    return Object.keys(currValue);
                },
                get(key){
                    return currValue[key];
                },
                set(key, val){
                    if (key == 'bingo'){
                        setter(val);
                    }
                },
                clear(){
                    otherChangeSpy();
                },
                merge(newValue){
                    setter(newValue.bingo === undefined? newValue.get('bingo') : newValue.bingo);
                },
                forEach(cb){
                    forEach(this, cb);
                }
            }
        });
        describe("set value to NaN if pre-existing normal number value", ()=>{
            beforeEach('set pre-existing value to 1', ()=>{
                currValue = {bingo:1};
            });
            it('property setter', ()=>{
                instance.set('bingo', NaN);
                expect(setter).to.have.been.calledWith(NaN);
            });
            it('setValue', ()=>{
                instance.setValue({bingo:NaN});
                expect(setter).to.have.been.calledWith(NaN);
            });
            it('setValueDeep', ()=>{
                instance.setValueDeep({bingo:NaN});
                expect(setter).to.have.been.calledWith(NaN);
            });
        });

        describe("do nothing if pre-existing NaN value", ()=>{
            beforeEach('set pre-existing value to NaN', ()=>{
                currValue = {bingo:NaN};
            });
            it('property setter', ()=>{
                instance.set('bingo', NaN);
                expect(setter).to.have.not.been.called;
            });
            it('setValue', ()=>{
                instance.setValue({bingo:NaN});
                expect(setter).to.have.not.been.called;
            });
            it('setValueDeep', ()=>{
                instance.setValueDeep({bingo:NaN});
                expect(setter).to.have.not.been.called;
            });
        });
    });
});
