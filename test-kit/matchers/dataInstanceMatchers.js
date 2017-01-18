import * as _ from 'lodash';

export default function(chai, utils) {

    chai.Assertion.addProperty("dataInstance", function() {
        var instance = this._obj;
        return new DataInstanceAssertion(instance);
    });

    class DataInstanceAssertion extends chai.Assertion {

        fields(expectFunction) {
            var instance = this._obj;
            var fieldsSpec = instance.constructor._spec;

            _.forEach(fieldsSpec, (fieldSpec, fieldName) => {
                expectFunction(new DataInstanceFieldAssertion({
                    value: instance[fieldName],
                    name: fieldName,
                    spec: fieldSpec
                }, this));
            });

            return new DataInstanceAssertion(instance);
        }

    }

    class DataInstanceFieldAssertion extends chai.Assertion {

        defaultValue() {
            var field = this._obj;
            var defaultValue = field.spec.defaults();

            this.assert(
                field.value === defaultValue,
                'expected field "' + field.name + '" to be the default value but got #{act}',
                'expected field "' + field.name + '" not to be the default value but got #{act}',
                defaultValue,
                field.value,
                true
            );

            return new DataInstanceFieldAssertion(field);
        }

    }
};
