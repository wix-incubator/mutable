import * as _ from 'lodash';
import * as mu from '../../src';
import {aDataTypeWithSpec} from '../../test-kit/test-drivers';

export function aNumberMap(optionalMap) {
    return mu.Es5Map.of(mu.Number).create(optionalMap || {});
}

export function aUserTypeMap(optionalMap) {
    return mu.Es5Map.of(UserType).create(optionalMap || []);
}

export function aUnionTypeMap(optionalMap) {
    return mu.Es5Map.of(mu.either(CheeseType, UserType)).create(optionalMap || []);
}

export const UserType = aDataTypeWithSpec({
    name: mu.String.withDefault(''),
    age: mu.Number.withDefault(10)
}, 'User');

export const CheeseType = aDataTypeWithSpec({
    name: mu.String.withDefault(''),
    age: mu.Number.withDefault(10)
}, 'Cheese');

const exported = { CheeseType, UserType, aNumberMap, aUserTypeMap, aUnionTypeMap };

export function asReadOnly() {
    return _.mapValues(exported, prop => {
        if (prop.id) { // mu type
            return prop;
        } else { // factory method
            return _.flow(prop, list => list.$asReadOnly());
        }
    });
}
