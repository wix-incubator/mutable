import {expect} from 'chai';

import * as Mutable from '../../../src';
import {LifeCycleManager} from '../../../src';
import {aNumberList, aStringList, anEmptyList, UserType, AddressType, UserWithAddressType, aVeryCompositeContainerList} from '../builders';
import {aDataTypeWithSpec, getMobxLogOf} from '../../../test-kit/test-drivers';
import {either} from '../../../src/generic-types';
import {ERROR_FIELD_MISMATCH_IN_LIST_METHOD} from '../../../test-kit/test-drivers/reports';

export default function modifyTestSuite(command, { complexSubTypeTests }) {

    describe(`List ${command}`, function() {

        describe('lifecycleManager', function() {
            let arr, manager, child;
            beforeEach(()=>{
                manager = new LifeCycleManager();
                arr = Mutable.List.of(UserType).create([new builders.UserType(), new builders.UserType(), new builders.UserType()]);
                arr.$setManager(manager);
                child = new builders.UserType();
                sinon.spy(child, '$setManager');
            });
            if (context.dirtyableElements) {
                it('sets lifecycle manager in newly added elements', function() {
                    arr[command]([child]);
                    expect(child.$setManager).to.have.been.calledWithExactly(manager);
                });
                it('does not try to set lifecycle manager in read-only newly added elements', function() {
                    arr[command]([child.$asReadOnly()]);
                    expect(child.$setManager).to.have.not.been.calledWithExactly(manager);
                });
            }
        });

        it('should not get dirty if values are not changed', function() {
            var numberList = aNumberList([1]);
            var log = getMobxLogOf(()=> numberList[command]([1]));
            expect(log).to.be.empty;
        });

        it("accepts a vanilla JS List", function() {
            var list = anEmptyList();

            expect(list.length).to.equal(0);

            list[command]([17, 42]);

            expect(list.length).to.equal(2);
            expect(list.at(0)).to.equal(17);
            expect(list.at(1)).to.equal(42);
        });

        describe('replaces the value', function() {

            function aTestType(values) {
                var TestType = aDataTypeWithSpec({
                    names: Mutable.List.of(Mutable.String).withDefault(values)
                }, "TestType");

                return new TestType();
            }

            it("with Mutable object containing Mutable List of string", function() {
                var testType = aTestType(["Beyonce", "Rihanna"]);

                expect(testType.names.length).to.equal(2);
                expect(testType.names.at(0)).to.equal("Beyonce");
                expect(testType.names.at(1)).to.equal("Rihanna");

                testType[command]({
                    names: aStringList(["John", "Paul", "George"])
                });

                expect(testType.names.length).to.equal(3);
                expect(testType.names.at(0)).to.equal("John");
                expect(testType.names.at(1)).to.equal("Paul");
                expect(testType.names.at(2)).to.equal("George");
            });

            it("with JSON object containg JSON List of string", function() {
                var testType = aTestType(["Beyonce", "Rihanna"]);

                testType[command]({ names: ["John", "Paul", "George"] });

                expect(testType.names.length).to.equal(3);
                expect(testType.names.at(0)).to.equal("John");
                expect(testType.names.at(1)).to.equal("Paul");
                expect(testType.names.at(2)).to.equal("George");
            });
        });

        it("with JSON object containg empty List", function() {
            var TestType1 = aDataTypeWithSpec({ gaga: Mutable.String }, "TestType1");
            var TestType2 = aDataTypeWithSpec({ baga: Mutable.String }, "TestType2");
            var TestType3 = aDataTypeWithSpec({
                gagot: Mutable.List.of(TestType1, TestType2).withDefault([{}, {}])
            }, "TestType3");

            var testObj = new TestType3();

            testObj[command]({ gagot: [] });

            expect(testObj.gagot.length).to.equal(0);
            expect(testObj.gagot.at(0)).to.equal(undefined);
        });

        it("with List with compatible but different options", function() {
            var TestType1 = aDataTypeWithSpec({ gaga: Mutable.String }, "TestType1");
            var TestType2 = aDataTypeWithSpec({ baga: Mutable.String }, "TestType2");
            var TestType3 = aDataTypeWithSpec({
                gagot: Mutable.List.of(TestType1, TestType2).withDefault([{}, {}, {}])
            }, "TestType3");
            var TestType4 = aDataTypeWithSpec({
                gagot: Mutable.List.of(TestType2).withDefault([{}])
            }, "TestType3");
            var testObj = new TestType3();
            var test2Obj = new TestType4();


            testObj[command]({ gagot: test2Obj.gagot });

            expect(testObj.gagot.length).to.equal(1);
        });

        describe('on a List with complex subtype', function() {

            it('should keep mutable objects passed to it that fit its subtypes', function() {
                var mixedList = Mutable.List.of(either(UserType, AddressType)).create([]);
                var newUser = new UserType();
                var newAddress = new AddressType();

                mixedList[command]([newUser, newAddress]);

                expect(mixedList.at(0)).to.eql(newUser);
                expect(mixedList.at(1)).to.eql(newAddress);
            });

            it('should set the new item lifecycle manager when creating new from JSON', function() {
                var mockManager = new LifeCycleManager();
                var mixedList = Mutable.List.of(AddressType).create([]);
                mixedList.$setManager(mockManager);

                mixedList[command]([{ code: 5 }]);

                expect(mixedList.at(0).__lifecycleManager__).to.be.eql(mockManager);
            });

            complexSubTypeTests && complexSubTypeTests()

        })

    });

}
