import Typorama from '../../src';
import {expect} from 'chai';
import {either} from '../../src/composite';
import {aNumberArray, aStringArray, UserType, AddressType, UserWithAddressType} from './builders';

describe('(Read Only) instance', function() {

    it('Should have default length', function() {
        var numberList = aNumberArray([1, 2, 3]).$asReadOnly();
        expect(numberList.length).to.equal(3);
    });

    it('Should keep the source instance not readOnly', function() {
        // this is because the readonly instance used to have a bug in which it changed the original item value while wrapping it
        var numberList = aNumberArray();

        numberList.$asReadOnly();
        numberList.setValue([5,6]);

        expect(numberList.toJSON()).to.eql([5,6]);
    });

    it('Should be created once for each data instance', function() {
        var numberList = aNumberArray();
        var roInstance1 = numberList.$asReadOnly();
        var roInstance2 = numberList.$asReadOnly();

        expect(roInstance1).to.equal(roInstance2);
    });

    describe("with global freeze config", function(){

        before("set global freeze configuration", function(){
            Typorama.config.freezeInstance = true;
        });

        after("clear global freeze configuration", function(){
            Typorama.config.freezeInstance = false;
        });

        it("should throw error on unknown field setter", function(){
            var names = aStringArray().$asReadOnly();

            expect(function(){
                names[4] = "there is no 4 - only at()";
            }).to.throw('object is not extensible');
        });

    });

    describe('at', function() {

        it('Should return a number for native immutable Typorama.Number', function() {
            expect(aNumberArray().$asReadOnly().at(0)).to.equal(1);
        });

        it('Should return a string for native immutable Typorama.String', function() {
            expect(aStringArray().$asReadOnly().at(0)).to.equal('John');
        });

        it('Should return wrapped item that passes the test() of their type', function() {
            expect(aNumberArray().$asReadOnly().__options__.subTypes.validate(aNumberArray().$asReadOnly().at(0))).to.beTrue;
        });

        it('Should return a typed item for mutable data (like custom types)', function() {
            var arr = Typorama.Array.of(UserType).create([{name: 'avi', age: 12}]).$asReadOnly();
            expect(arr.at(0)).to.be.instanceof(UserType);
        });

        it('Should return a typed item form multiple types if there is _type field', function() {
            var data = [
                {_type:'User',  name: 'avi', age: 12},
                {_type:'Address', name: 'avi', age: 12}
            ];
            var arr = Typorama.Array.of(either(UserType, AddressType)).create(data).$asReadOnly();
            expect(arr.at(0)).to.be.instanceof(UserType);
            expect(arr.at(1)).to.be.instanceof(AddressType);
        });

        it('Should not modify inner complex data', function() {
            var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
            var arrComplexType = Typorama.Array.of(UserWithAddressType).create([{}, {}, {}]).$asReadOnly();

            var elem = arrComplexType.at(1);

            elem.user.name = 'modified user name';
            expect(elem.user.name).to.equal(userDefaultName);
        });

        it('Should handle multi level array', function() {
            var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]]).$asReadOnly();

            var userWithAddress = arrComplexType.at(0).at(0);
            expect(userWithAddress).to.be.instanceof(UserWithAddressType);

            userWithAddress.user.name = 'you got a new name';
            expect(userWithAddress.user.name).to.equal('');
        });


        it('should keep read only item as read only', function() {
       		var readOnlyData = new UserWithAddressType().$asReadOnly();
       		var arrComplexType = Typorama.Array.of(UserWithAddressType).create([readOnlyData]);

       		var readOnlyItemData = arrComplexType.at(0);
       		readOnlyItemData.user.name = 'you got a new name';

       		expect(readOnlyItemData).to.eql(readOnlyData);
       	});

    });

    describe('push',function() {
        it('should not modify an array ', function() {
            var numberList = aNumberArray().$asReadOnly();
            var lengthBeforePush = numberList.length;

            var newIndex = numberList.push(3);

            expect(newIndex).to.be.null;
            expect(numberList.length).to.equal(lengthBeforePush);
            expect(numberList.at(2)).to.equal(undefined);

        })
    });

    describe('splice',function() {
        it('should not modify an array ', function() {
            var numberList = aNumberArray().$asReadOnly();
            var lengthBeforeSplice = numberList.length;

            var removedItems = numberList.splice(0, 1, 17);

            expect(removedItems).to.be.null;
            expect(numberList.length).to.equal(lengthBeforeSplice);
            expect(numberList.at(0)).to.equal(1);
            expect(numberList.at(1)).to.equal(2);
        })
    });

    describe('__value__', function() {
        it('should be synced with the readonly', function () {
            var arr = Typorama.Array.of(UserType).create();
            var readOnly = arr.$asReadOnly();

            arr.setValue([UserType.defaults()])

            expect(arr.__value__).to.equal(readOnly.__value__);
        });

        //TODO @baraki wrote this and I'm not sure what it's supposed to do
        xit('should fail', function(){
            var Type = Typorama.define('Type',{
                spec: function(){
                    return {
                        items: Typorama.Array.of(UserType)
                    };
                }
            });
            var type = new Type();
            var readOnly = type.$asReadOnly();
            type.setValue({items: Typorama.Array.of(UserType).create([UserType.defaults(), UserType.defaults()]) });
            var items = readOnly.items;
            expect(items.__value__).to.eql(['hello', 'world'])
        });
    });
});