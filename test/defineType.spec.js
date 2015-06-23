import _ from 'lodash';
import Typorama from '../src';
import {aDataTypeWithSpec} from '../test-kit/testDrivers/index';
import {expect, err} from 'chai';
import Type1 from './type1';
import Type2 from './type2';

describe('a type definition', () => {
    describe('that is isomorphic to another type', () => {
        it('should result in two compatible types', () => {
            new Type2(new Type1({foo: "bar"}));
            expect(() => new Type2(new Type1({foo: "bar"}))).not.to.throw;
        })
    });
});