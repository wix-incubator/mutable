import {expect} from 'chai';

import * as mu from '../../src';
import {aDataTypeWithSpec} from '../../test-kit/test-drivers';

describe('Read only instances', () => {
    let UserType, user;
    before('init type and instance', () => {
        UserType = aDataTypeWithSpec({
            name: mu.String
        });
        user = new UserType('momo');
    });

    it('are considered equal to their read-write counterparts', () => {
        expect(() => expect(user).to.equal(user.$asReadOnly())).not.to.throw();

        expect(() => expect(user.$asReadOnly()).to.equal(user)).not.to.throw();
    });
});
