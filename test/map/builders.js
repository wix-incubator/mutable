import Typorama from '../../src';
import {aDataTypeWithSpec} from '../../test-kit/testDrivers/index';

export function aNumberMap(optionalMap) {
	return Typorama.Map.of([Typorama.String], [Typorama.Number]).create(optionalMap || {'default_val':1});
}

export const UserType = aDataTypeWithSpec({
	name: Typorama.String.withDefault(''),
	age: Typorama.Number.withDefault(10)
}, 'User');
