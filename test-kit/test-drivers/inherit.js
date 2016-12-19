/**
 * Created by amira on 18/12/16.
 */

// babel
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

export function inheritBabel(parent){
    _inherits(BabelChild, parent);
    function BabelChild() {
        _classCallCheck(this, BabelChild);
        return _possibleConstructorReturn(this, parent.apply(this, arguments));
    }
    return BabelChild;
}

// typescript
// using function constructor to hide copy-paste generated code from linter
// it's important that this code is the same as typescript's __extends function
// using tslib will solve this
const __extends = (this && this.__extends) || new Function('d', 'b', `
        for (let p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());`);

export function inheritTypescript(parent){
    __extends(TsChild, parent);
    function TsChild() {
        return parent.apply(this, arguments) || this;
    }
    return TsChild;
}
