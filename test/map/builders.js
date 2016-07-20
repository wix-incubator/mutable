import * as _ from 'lodash';

import * as Mutable from '../../src';
import {aDataTypeWithSpec} from '../../test-kit/test-drivers';

export function aNumberMap(optionalMap) {
    return Mutable.Map.of(Mutable.String, Mutable.Number).create(optionalMap || {});
}

export function aUserTypeMap(optionalMap) {
    return Mutable.Map.of(UserType, UserType).create(optionalMap || []);
}

export function aUnionTypeMap(optionalMap) {
    return Mutable.Map.of(Mutable.String, Mutable.either(CheeseType, UserType)).create(optionalMap || []);
}

export const UserType = aDataTypeWithSpec({
    name: Mutable.String.withDefault(''),
    age: Mutable.Number.withDefault(10)
}, 'User');

export const CheeseType = aDataTypeWithSpec({
    name: Mutable.String.withDefault(''),
    age: Mutable.Number.withDefault(10)
}, 'Cheese');

const exported = { CheeseType, UserType, aNumberMap, aUserTypeMap, aUnionTypeMap };

export function asReadOnly() {
    return _.mapValues(exported, prop => {
        if (prop.id) { // mutable type
            return prop;
        } else { // factory method
            return _.flow(prop, list => list.$asReadOnly());
        }
    });
}
