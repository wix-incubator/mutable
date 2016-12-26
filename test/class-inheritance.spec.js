import {expect} from 'chai';
import * as sinon from 'sinon';
import * as Mutable from '../src';
import testKit from '../test-kit'

describe('a user class using babel inheritance', () => {

    it('should provide default values', function() {

        const UserClass = testKit.drivers.inheritBabel(Mutable.BaseType);

        const Type1 = Mutable.define('Type1', {
            spec:() => ({
                str: Mutable.String
            })
        }, UserClass);
        const Type2 = Mutable.define('Type2', {
            spec() {
                return {
                    int: Mutable.Number,
                    bool: Mutable.Boolean,
                };
            }
        }, Type1);
        const obj = new Type2();
        expect(obj).to.be.instanceof(Mutable.BaseType);
        expect(obj).to.be.instanceof(UserClass);
        expect(obj).to.be.instanceof(Type1);
        expect(obj).to.be.instanceof(Type2);
        expect(obj.str).to.equal('');
        expect(obj.int).to.equal(0);
        expect(obj.bool).to.equal(false);
    });

    it('should allow overriding wrapValue', function() {
        const unexpectedValue = function(){};
        const UserClass = testKit.drivers.inheritBabel(Mutable.BaseType);
        UserClass.wrapValue = sinon.spy(function wrapValue(value, spec, options = {}, errorContext) {
            return {str:unexpectedValue}
        });

        const Type1 = Mutable.define('Type1', {
            spec:() => ({
                str: Mutable.String
            })
        }, UserClass);
        const obj = new Type1();
        expect(UserClass.wrapValue).to.have.been.calledWith(Type1.defaults(), Type1._spec);
        expect(obj.str).to.equal(unexpectedValue);
    });
});
