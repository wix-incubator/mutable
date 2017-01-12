import {expect} from 'chai';
import * as sinon from 'sinon';
import * as mutable from '../src';
import testKit from '../test-kit'

describe('a user class using babel inheritance', () => {

    it('should provide default values', function() {

        const UserClass = testKit.drivers.inheritBabel(mutable.Object);

        const Type1 = mutable.define('Type1', {
            spec:() => ({
                str: mutable.String
            })
        }, UserClass);
        const Type2 = mutable.define('Type2', {
            spec() {
                return {
                    int: mutable.Number,
                    bool: mutable.Boolean,
                };
            }
        }, Type1);
        const obj = new Type2();
        expect(obj).to.be.instanceof(mutable.Object);
        expect(obj).to.be.instanceof(UserClass);
        expect(obj).to.be.instanceof(Type1);
        expect(obj).to.be.instanceof(Type2);
        expect(obj.str).to.equal('');
        expect(obj.int).to.equal(0);
        expect(obj.bool).to.equal(false);
    });

    it('should allow overriding wrapValue', function() {
        const unexpectedValue = function(){};
        const UserClass = testKit.drivers.inheritBabel(mutable.Object);
        UserClass.wrapValue = sinon.spy(function wrapValue(value, spec, options = {}, errorContext) {
            return {str:unexpectedValue}
        });

        const Type1 = mutable.define('Type1', {
            spec:() => ({
                str: mutable.String
            })
        }, UserClass);
        const obj = new Type1();
        expect(UserClass.wrapValue).to.have.been.calledWith(Type1.defaults(), Type1._spec);
        expect(obj.str).to.equal(unexpectedValue);
    });
});
