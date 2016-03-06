import _ from'lodash';
import Typorama from '../../src';
import {aDataTypeWithSpec} from '../../test-kit/testDrivers/index';

export function aNumberMap(optionalMap) {
	return Typorama.Map.of(Typorama.String, Typorama.Number).create(optionalMap || {});
}

export function aUserTypeMap(optionalMap) {
	return Typorama.Map.of(UserType, UserType).create(optionalMap || []);
}

export function aUnionTypeMap(optionalMap) {
	return Typorama.Map.of(Typorama.String, Typorama.either(Typorama.Number, UserType)).create(optionalMap || []);
}

export const UserType = aDataTypeWithSpec({
	name: Typorama.String.withDefault(''),
	age: Typorama.Number.withDefault(10)
}, 'User');

export const CheeseType = aDataTypeWithSpec({
	name: Typorama.String.withDefault(''),
	age: Typorama.Number.withDefault(10)
}, 'Cheese');

const exported = {CheeseType, UserType, aNumberMap, aUserTypeMap, aUnionTypeMap};

function asReadOnly(){
	return _.mapValues(exported, prop => {
		if (prop.id){			// typorama type
			return prop;
		} else {				// factory method
			return _.flow(prop, list => list.$asReadOnly());
		}
	});
}

export default _.defaults(exported, {asReadOnly});
