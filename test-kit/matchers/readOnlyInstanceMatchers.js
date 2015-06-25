import _ from 'lodash';
import Typorama from '../../src';

export default function (chai, utils) {
    chai.Assertion.overwriteMethod('equal', function (_super) {
      return function typoramaEquality(expected) {
        function isTyporamaObject(o) {
          return Typorama.BaseType.validateType(o);
        }

        var actual = this._obj;
        if (isTyporamaObject(actual) && isTyporamaObject(expected) && expected.$isReadOnly() != actual.$isReadOnly()) {
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