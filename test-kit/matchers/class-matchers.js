import * as mu from '../../src';

export default function(chai, utils) {

    chai.Assertion.addMethod("field", function(name) {
        var Type = this._obj;

        this.assert(
            mu.Object.prototype.isPrototypeOf(Type.prototype),
            'expected a Type but got #{act}',
            'expected not a Type but got #{act}',
            mu.Object,
            Type,
            true
        );

        var TypeName = Type.displayName || Type;

        var spec = Type._spec[name];

        this.assert(
            spec !== undefined,
            'expected a Type with a field ' + name,
            'expected a Type without a field ' + name,
            name,
            undefined,
            true
        );

        return new TypeFieldAssertion({ spec, name });
    });

    class TypeFieldAssertion extends chai.Assertion {

        defaults(expectedValue) {
            var field = this._obj;

            var defaults = field.spec.defaults();

            this.assert(
                defaults === expectedValue,
                'expected field "' + field.name + '" defaults to be #{exp} but got #{act}',
                'expected field "' + field.name + '" defaults not to be #{exp} but got #{act}',
                expectedValue,
                defaults,
                true
            );

            return new TypeFieldAssertion(field, this);
        }

        type(expectedType) {
            var field = this._obj;

            this.assert(
                expectedType.isJsAssignableFrom(field.spec),
                'expected field "' + field.name + '" type to be #{exp} but got #{act}',
                'expected field "' + field.name + '" type not to be #{exp} but got #{act}',
                expectedType.displayName || expectedType,
                field.spec.displayName || field.spec,
                true
            );

            return new TypeFieldAssertion(field, this);
        }

    }
};
