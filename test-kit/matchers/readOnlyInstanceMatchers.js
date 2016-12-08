export default function(chai, utils) {
    chai.Assertion.overwriteMethod('equal', function(_super) {
        return function mutableEquality(expected) {
            var actual = this._obj;
            if (expected && actual && expected.$isReadOnly && actual.$isReadOnly && expected.$isReadOnly() != actual.$isReadOnly()) {
                this.assert(
                    expected.$asReadOnly() === actual.$asReadOnly()
                    , 'expected #{this} to equal #{exp}'
                    , 'expected #{this} to not equal #{exp}'
                    , expected
                    , actual
                    , true
                );
            } else {
                _super.apply(this, arguments);
            }
        };
    });
};
