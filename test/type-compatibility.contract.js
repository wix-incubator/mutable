import {expect} from 'chai';
import {isAssignableFrom} from '../src/validation';

export function typeCompatibilityTest(typeFactory) {
    describe('should be compatible', () => {
        it('with itself', () => {
            var type = typeFactory();
            expect(type.type).to.satisfy(isAssignableFrom.bind(null, type));
        });
        it('with instances of itself', () => {
            var type = typeFactory();
            var instance = new type();
            expect(instance).to.satisfy(type.validateType.bind(type));
        });
        it('with instance of same schema', () => {
            var type1 = typeFactory();
            var type2 = typeFactory();
            var instance = new type1();
            expect(instance).to.satisfy(type2.validateType.bind(type2));
        });
        it('with types of same schema', () => {
            var type1 = typeFactory();
            var type2 = typeFactory();
            expect(type1.type).to.satisfy(isAssignableFrom.bind(null, type2));
        });
    });
}
