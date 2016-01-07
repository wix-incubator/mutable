import Typorama from '../../src';
import {aDataTypeWithSpec} from '../../test-kit/testDrivers/index';

export function aNumberMap(optionalMap) {
	return Typorama.Map.of(Typorama.String, Typorama.Number).create(optionalMap || {});
}


export function aUserTypeMap(optionalMap) {
	return Typorama.Map.of(UserType, UserType).create(optionalMap || []);
}


export const UserType = aDataTypeWithSpec({
	name: Typorama.String.withDefault(''),
	age: Typorama.Number.withDefault(10)
}, 'User');
const exported = {UserType, aNumberMap, aUserTypeMap};

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
