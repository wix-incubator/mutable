import * as Typorama from '../../src'
import {aDataTypeWithSpec} from "../../test-kit/testDrivers/index";
import {expect, err} from "chai";

describe('Read only instances', () => {

    var UserType = aDataTypeWithSpec({
        name: Typorama.String
    });

    var user = new UserType('momo');

    it('are considered equal to their read-write counterparts', () => {
        expect(() => expect(user).to.equal(user.$asReadOnly())).not.to.throw();

        expect(() => expect(user.$asReadOnly()).to.equal(user)).not.to.throw();
    });
});
