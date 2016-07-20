import {expect} from 'chai';

import * as Mutable from '../../../src';
import {LifeCycleManager, revision, either} from '../../../src';
import {aNumberList, aStringList, anEmptyList, UserType, AddressType, UserWithAddressType, aVeryCompositeContainerList} from '../builders';
import {aDataTypeWithSpec} from '../../../test-kit/test-drivers';
import modifyTestSuite from './modify-test-suite';
import {ERROR_FIELD_MISMATCH_IN_LIST_METHOD} from '../../../test-kit/test-drivers/reports';


function complexSubTypeTests() {
    it('single subtype List should allow setting data with json', function() {
        var address = new AddressType({ address: 'gaga' });
        var mixedList = Mutable.List.of(AddressType).create([address]);

        mixedList.setValue([{ code: 5 }]);

        expect(mixedList.at(0)).to.be.instanceOf(AddressType);
        expect(mixedList.at(0).code).to.be.eql(5);
        expect(mixedList.at(0).address).to.be.eql('');
        expect(mixedList.at(0)).to.not.be.eql(address);

    });

    it("report correct path for field type mismatch in deep field", function() {
        var aList = aVeryCompositeContainerList([{}, {}]);
        expect(() => aList.setValue([{}, { child1: { user: { age: "666" } } }]))
            .to.report(ERROR_FIELD_MISMATCH_IN_LIST_METHOD('setValue', 'List<VeryCompositeContainer>[1].child1.user.age', 'number', 'string'));
    });
}
modifyTestSuite('setValue', { complexSubTypeTests });

