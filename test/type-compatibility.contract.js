import {expect} from 'chai';
import {isAssignableFrom} from '../src/core/validation';

export function typeCompatibilityTest(typeFactory, isPrimitive) {
    describe('should be compatible', () => {
        it('with itself', () => {
            var type = typeFactory();
            expect(type).to.satisfy(isAssignableFrom.bind(null, type));
        });
        it('with types of same schema', () => {
            var type1 = typeFactory();
            var type2 = typeFactory();
            expect(type1).to.satisfy(isAssignableFrom.bind(null, type2));
        });
        describe('with results of .create()', () => {

            it('of itself', () => {
                var type = typeFactory();
                var instance = type.create();
                expect(instance).to.satisfy(type.validateType.bind(type));
            });
            it('of same schema', () => {
                var type1 = typeFactory();
                var type2 = typeFactory();
                var instance = type1.create();
                expect(instance).to.satisfy(type2.validateType.bind(type2));
            });
        });
        if (!isPrimitive) {
            describe('with results of "new" keyword', () => {
                it('of itself', () => {
                    var type = typeFactory();
                    var instance = new type();
                    expect(instance).to.satisfy(type.validateType.bind(type));
                });
                it('of same schema', () => {
                    var type1 = typeFactory();
                    var type2 = typeFactory();
                    var instance = new type1();
                    expect(instance).to.satisfy(type2.validateType.bind(type2));
                });
            });
        }
    });
}
