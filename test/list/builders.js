import * as _ from 'lodash';

import * as Mutable from '../../src';
import {aDataTypeWithSpec} from '../../test-kit/test-drivers';

const either = Mutable.either;

export var UserType = aDataTypeWithSpec({
    name: Mutable.String.withDefault(''),
    age: Mutable.Number.withDefault(10)
}, 'User');

export var AddressType = aDataTypeWithSpec({
    address: Mutable.String.withDefault(''),
    code: Mutable.Number.withDefault(10)
}, 'Address');

export var UserWithAddressType = aDataTypeWithSpec({
    user: UserType,
    address: AddressType
}, 'UserWithAddress');


export var VeryCompositeContainer = aDataTypeWithSpec({
    child1: UserWithAddressType
}, 'VeryCompositeContainer');


export function aStringList(optionalArr) {
    return Mutable.List.of(Mutable.String).create(optionalArr || ["John", "Paul", "George", "Ringo"]);
}

export function aNumberList(optionalArr) {
    return Mutable.List.of(Mutable.Number).create(optionalArr || [1, 2]);
}

export function aNumberStringList(optionalArr) {
    return Mutable.List.of(either(Mutable.Number, Mutable.String)).create(optionalArr || [1, 'ho']);
}

export function anEmptyList() {
    return aNumberList([]);
}

export function aUserList(optionalArr) {
    return Mutable.List.of(UserType).create(optionalArr || [{}, { name: 'yossi' }]);
}

export function aUserWithAddressTypeList(optionalArr) {
    return Mutable.List.of(UserWithAddressType).create(optionalArr || [{}, { name: 'yossi' }]);
}

export function aUserOrAddressList(optionalArr) {
    return Mutable.List.of(either(UserType, AddressType)).create(optionalArr || [{}, { name: 'yossi' }]);
}

export function a2dUserWithAddressTypeList(optionalArr) {
    return Mutable.List.of(Mutable.List.of(UserWithAddressType)).create(optionalArr || [[{}], [{ name: 'yossi' }]]);
}

export function aVeryCompositeContainerList(optionalArr) {
    return Mutable.List.of(VeryCompositeContainer).create(optionalArr || [{}, { child1: { user: { name: 'yossi' } } }]);
}

const exported = { UserType, AddressType, UserWithAddressType, aStringList, aNumberList, aNumberStringList, anEmptyList, aUserList, aUserWithAddressTypeList, aUserOrAddressList, aVeryCompositeContainerList, a2dUserWithAddressTypeList };

export function asReadOnly() {
    return _.mapValues(exported, prop => {
        if (prop.id) { // mutable type
            return prop;
        } else { // factory method
            return _.flow(prop, list => list.$asReadOnly());
        }
    });
}
