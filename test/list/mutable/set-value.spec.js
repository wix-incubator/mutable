import {expect} from 'chai';
import * as mu from '../../../src';
import {either} from '../../../src';
import {AddressType, aVeryCompositeContainerList} from '../builders';
import modifyTestSuite from './modify-test-suite';
import {ERROR_FIELD_MISMATCH_IN_LIST_METHOD} from '../../../test-kit/test-drivers/reports';


function complexSubTypeTests() {
    it('List should allow setting data with json', function() {
        var address = new AddressType({ address: 'gaga' });
        var list = mu.List.of(AddressType).create([address]);

        list.setValue([{ code: 5 }]);

        expect(list.at(0)).to.be.instanceOf(AddressType);
        expect(list.at(0).code).to.be.eql(5);
        expect(list.at(0).address).to.be.eql('');
        expect(list.at(0)).to.not.be.eql(address);

    });

    it('List should allow adding data with json', function() {
        var list = mu.List.of(AddressType).create();

        list.setValue([{ code: 5 }]);

        expect(list.at(0)).to.be.instanceOf(AddressType);
        expect(list.at(0).code).to.be.eql(5);

    });

    it("report correct path for field type mismatch in deep field", function() {
        var aList = aVeryCompositeContainerList([{}, {}]);
        expect(() => aList.setValue([{}, { child1: { user: { age: "666" } } }]))
            .to.report(ERROR_FIELD_MISMATCH_IN_LIST_METHOD('setValue', 'List<VeryCompositeContainer>[1].child1.user.age', 'number', 'string'));
    });
}
modifyTestSuite('setValue', { complexSubTypeTests });

