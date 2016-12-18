import * as Mutable from '../src';
import {expect} from 'chai';
import * as sinon from 'sinon';

/**
 * babel inherit implementation
 * // TODO move to test kit, test extension of all types
 */

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
describe('Function data', function() {
    it('wrapped function should execute properly', function() {

        var typedFunction = Mutable.Function.create(function myfunc() {
            return 1;
        });

        expect(typedFunction()).to.equal(1, 'wrapped function should execute properly');
    });

    it('Function.withDefault should return a default function', function() {
        var typedFunction = Mutable.Function.withDefault(function myfunc() {
            return 1;
        });
        expect(typedFunction.defaults()()).to.equal(1, 'wrapped function should execute properly');
    });

    it('is extendible', function() {
        var DerivedFunc = function (_Mutable$Function) {
            _inherits(DerivedFunc, _Mutable$Function);
            function DerivedFunc() {
                _classCallCheck(this, DerivedFunc);
                return _possibleConstructorReturn(this, _Mutable$Function.apply(this, arguments));
            }
            DerivedFunc.of = function of(DataType) {
                var WithDataSpec = this.withDefault(undefined, undefined, { dataType: DataType });
                return WithDataSpec;
            };
            return DerivedFunc;
        }(Mutable.Function);
        DerivedFunc.id = 'DerivedFunc';
        var innerSpy = sinon.spy();
        var StringDerivedFunc = DerivedFunc.of(Mutable.String);
        var func = new StringDerivedFunc(innerSpy);

        expect(func).not.to.throw();
        expect(innerSpy).to.have.been.calledOnce;
        expect(StringDerivedFunc.validate(func) || StringDerivedFunc.validateType(func)).to.be.true;

    });

});
