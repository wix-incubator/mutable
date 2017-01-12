import * as _ from 'lodash';

import * as mu from '../../src';
import {aDataTypeWithSpec} from '../../test-kit/test-drivers';

const either = mu.either;

export var UserType = aDataTypeWithSpec({
    name: mu.String.withDefault(''),
    age: mu.Number.withDefault(10)
}, 'User');

export var AddressType = aDataTypeWithSpec({
    address: mu.String.withDefault(''),
    code: mu.Number.withDefault(10)
}, 'Address');

export var UserWithAddressType = aDataTypeWithSpec({
    user: UserType,
    address: AddressType
}, 'UserWithAddress');


export var VeryCompositeContainer = aDataTypeWithSpec({
    child1: UserWithAddressType
}, 'VeryCompositeContainer');


export function aStringList(optionalArr) {
    return mu.List.of(mu.String).create(optionalArr || ["John", "Paul", "George", "Ringo"]);
}

export function aNumberList(optionalArr) {
    return mu.List.of(mu.Number).create(optionalArr || [1, 2]);
}

export function aNumberStringList(optionalArr) {
    return mu.List.of(either(mu.Number, mu.String)).create(optionalArr || [1, 'ho']);
}

export function anEmptyList() {
    return aNumberList([]);
}

export function aUserList(optionalArr) {
    return mu.List.of(UserType).create(optionalArr || [{}, { name: 'yossi' }]);
}

export function aUserWithAddressTypeList(optionalArr) {
    return mu.List.of(UserWithAddressType).create(optionalArr || [{}, { name: 'yossi' }]);
}

export function aUserOrAddressList(optionalArr) {
    return mu.List.of(either(UserType, AddressType)).create(optionalArr || [{}, { name: 'yossi' }]);
}

export function a2dUserWithAddressTypeList(optionalArr) {
    return mu.List.of(mu.List.of(UserWithAddressType)).create(optionalArr || [[{}], [{ name: 'yossi' }]]);
}

export function aVeryCompositeContainerList(optionalArr) {
    return mu.List.of(VeryCompositeContainer).create(optionalArr || [{}, { child1: { user: { name: 'yossi' } } }]);
}

const exported = { UserType, AddressType, UserWithAddressType, aStringList, aNumberList, aNumberStringList, anEmptyList, aUserList, aUserWithAddressTypeList, aUserOrAddressList, aVeryCompositeContainerList, a2dUserWithAddressTypeList };

export function asReadOnly() {
    return _.mapValues(exported, prop => {
        if (prop.id) { // mu type
            return prop;
        } else { // factory method
            return _.flow(prop, list => list.$asReadOnly());
        }
    });
}
