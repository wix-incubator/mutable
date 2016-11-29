import {expect} from 'chai';

import * as Mutable from '../../../src';
import {either, LifeCycleManager} from '../../../src';
import {aNumberList, aStringList, anEmptyList, UserType, AddressType, UserWithAddressType, aVeryCompositeContainerList} from '../builders';
import {aDataTypeWithSpec, getMobxLogOf} from '../../../test-kit/test-drivers';
import modifyTestSuite from './modify-test-suite';
import {ERROR_FIELD_MISMATCH_IN_LIST_METHOD} from '../../../test-kit/test-drivers/reports';

function complexSubTypeTests() {
    it('single subtype List should allow setting data with json', function() {
        var address = new AddressType({ address: 'gaga' });
        var list = Mutable.List.of(AddressType).create([address]);
        var log = getMobxLogOf(()=> list.setValueDeep([{ code: 5 }]));

        expect(list.at(0)).to.be.instanceOf(AddressType);
        expect(list.at(0).code).to.be.eql(5);
        expect(list.at(0).address).to.be.eql('');
        expect(list.at(0)).to.be.equal(address);
        expect(log.filter(change => change.object === list.__value__)).to.be.empty;
        expect(log.filter(change => change.object === list.at(0).__value__)).not.to.be.empty;
    });

    it('single not be dirty if nothing changed', function() {
        var address = new AddressType({ address: 'gaga' });
        var list = Mutable.List.of(AddressType).create([address]);
        var log = getMobxLogOf(()=> list.setValueDeep([list.at(0).toJSON()]));
        expect(log).to.be.empty;
    });

    it('should keep mutable instances', function() {
        var newUser = new UserType();
        var newAddress = new AddressType();
        var mixedList = Mutable.List.of(either(UserType, AddressType)).create([newUser, newAddress]);
        var log = getMobxLogOf(()=> mixedList.setValueDeep([{ age: 65 }, { code: 999 }]));

        expect(mixedList.at(0)).to.equal(newUser);
        expect(mixedList.at(1)).to.equal(newAddress);
        expect(log.filter(change => change.object === mixedList.__value__)).to.be.empty;
        expect(log.filter(change => change.object === mixedList.at(0).__value__)).not.to.be.empty;
        expect(log.filter(change => change.object === mixedList.at(1).__value__)).not.to.be.empty;
    });

    it('should replace item for mismatch type', function() {
        const aUser = new UserType();
        const anAddress = new AddressType();
        const mixedList = Mutable.List.of(either(UserType, AddressType)).create([aUser, anAddress]);
        const log = getMobxLogOf(()=> mixedList.setValueDeep([{ _type: 'Address', age: 65 }, { code: 999 }]));

        expect(mixedList.at(0)).to.be.an.instanceOf(AddressType);
        expect(mixedList.at(1)).to.equal(anAddress);
        expect(log.filter(change => change.object === mixedList.__value__)).not.to.be.empty;
        expect(log.filter(change => change.object === aUser.__value__)).to.be.empty;
        expect(log.filter(change => change.object === mixedList.at(1).__value__)).not.to.be.empty;
    });

    it('should create new item if item is read only', function() {
        var address = new AddressType({ address: 'gaga' });
        var list = Mutable.List.of(AddressType).create([address.$asReadOnly()]);
        var log = getMobxLogOf(()=> list.setValueDeep([{ code: 5 }]));

        expect(list.at(0)).to.not.be.equal(address);

        expect(log.filter(change => change.object === list.__value__)).not.to.be.empty;
        expect(log.filter(change => change.object === list.at(0).__value__)).not.to.be.empty;
        expect(log.filter(change => change.object === address.__value__)).to.be.empty;
    });
}
modifyTestSuite('setValueDeep', { complexSubTypeTests });
