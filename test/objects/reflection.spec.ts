import * as mutable from '../../src';
import {expect} from 'chai';

describe('user defined class', () => {
    let UserClass:any, UserClassChild:any;
    before(()=>{
        UserClass = mutable.define('UserClass', {spec:(c)=>({
            foo:mutable.Number
        })});
        UserClassChild = mutable.define('UserClassChild', {spec:(c)=>({
            bar:mutable.Number
        })}, UserClass);
    });
    it('is any', () => {
        expect(mutable.isAny(UserClass), 'UserClass').to.be.true;
        expect(mutable.isAny(UserClassChild), 'UserClassChild').to.be.true;
    });
    it('is mutable', () => {
        expect(mutable.isMutable(UserClass), 'UserClass').to.be.true;
        expect(mutable.isMutable(UserClassChild), 'UserClassChild').to.be.true;
    });
    it('is class', () => {
        expect(mutable.isClass(UserClass), 'UserClass').to.be.true;
        expect(mutable.isClass(UserClassChild), 'UserClassChild').to.be.true;
    });
    it('is not enum', () => {
        expect(mutable.isEnum(UserClass), 'UserClass').to.be.false;
        expect(mutable.isEnum(UserClassChild), 'UserClassChild').to.be.false;
    });
    it('is not nullable', () => {
        expect(mutable.isNullable(UserClass), 'UserClass').to.be.false;
        expect(mutable.isNullable(UserClassChild), 'UserClassChild').to.be.false;
    });
});
