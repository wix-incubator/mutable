import {expect} from 'chai';

import * as mu from '../../../src';
import {aNumberList, aStringList, anEmptyList, UserType, AddressType, aVeryCompositeContainerList} from '../builders';
import {ERROR_FIELD_MISMATCH_IN_LIST_METHOD} from '../../../test-kit/test-drivers/reports'

const either = mu.either;

describe('List', function() {
    describe('mu instance', function() {

        describe('pop', function() {
            it('should remove the last element from a List', function() {
                var numberList = aNumberList();
                var oldArr = numberList.concat();

                var valueRemoved = numberList.pop();

                expect(numberList.length).to.equal(oldArr.length - 1);
                expect(valueRemoved).to.equal(oldArr.at(oldArr.length - 1));
            });

            it('should return undefined if called on an empty List', function() {
                var numberList = anEmptyList();

                var valueRemoved = numberList.pop();

                expect(valueRemoved).to.be.undefined;

            });
        });

        describe('push', function() {
            it('it should add a number to a List ', function() {
                var numberList = aNumberList([1, 2, 3, 4]);
                var lengthBeforePush = numberList.length;

                var newIndex = numberList.push(5);

                expect(newIndex).to.equal(lengthBeforePush + 1);
                expect(numberList.at(lengthBeforePush)).to.equal(5);
            });

            it('should add a typed item for non-primitive data (like custom types)', function() {
                var arr = mu.List.of(UserType).create([]);
                arr.push({});
                expect(arr.at(0)).to.be.instanceOf(UserType);
            });

            it('should add a typed item form multiple types if there is _type field', function() {
                var arr = mu.List.of(either(UserType, AddressType)).create([]);
                arr.push({ _type: 'User' });
                arr.push({ _type: 'Address' });
                expect(arr.at(0)).to.be.instanceOf(UserType);
                expect(arr.at(1)).to.be.instanceOf(AddressType);
            });

            it('should support push of multiple items', function() {
                var numberList = aNumberList([1, 2]);
                numberList.push(3, 4);

                expect(numberList.length).to.equal(4);
                expect(numberList.at(2)).to.equal(3);
                expect(numberList.at(3)).to.equal(4);
            });

            it("report correct path for field type mismatch in deep field", function() {
                var aList = aVeryCompositeContainerList([{}, {}]);
                expect(() => aList.push({}, { child1: { user: { age: "666" } } }))
                    .to.report(ERROR_FIELD_MISMATCH_IN_LIST_METHOD('push', 'List<VeryCompositeContainer>[3].child1.user.age', 'number', 'string'));
            });

            describe('lifecycleManager', function() {
                let arr, manager, child;
                beforeEach(()=>{
                    manager = new LifeCycleManager();
                    arr = mu.List.of(UserType).create([new builders.UserType(), new builders.UserType(), new builders.UserType()]);
                    arr.$setManager(manager);
                    child = new builders.UserType();
                    sinon.spy(child, '$setManager');
                });
                if (context.dirtyableElements) {
                    it('sets lifecycle manager in newly added elements', function() {
                        arr.push(child);
                        expect(child.$setManager).to.have.been.calledWithExactly(manager);
                    });
                    it('does not try to set lifecycle manager in read-only newly added elements', function() {
                        arr.push(child.$asReadOnly());
                        expect(child.$setManager).to.have.not.been.calledWithExactly(manager);
                    });
                }
            });
        });

        describe('set', function() {
            it('should replace an existing element', () => {
                var arr = aStringList(['a']);

                arr.set(0, 'b');

                expect(arr.toJSON()).to.eql(['b']);
            });
            it('should add an element if none exists', () => {
                var arr = anEmptyList();

                arr.set(0, 42);

                expect(arr.toJSON()).to.eql([42]);
            });

            it('should return the element', () => {
                var arr = aStringList(['a']);

                expect(arr.set(0, 'b')).to.eql('b');
            });

            it("report correct path for field type mismatch in deep field", function() {
                var aList = aVeryCompositeContainerList([{}, {}]);
                expect(() => aList.set(1, { child1: { user: { age: "666" } } }))
                    .to.report(ERROR_FIELD_MISMATCH_IN_LIST_METHOD('set', 'List<VeryCompositeContainer>.child1.user.age', 'number', 'string'));
            });

            describe('lifecycleManager', function() {
                let arr, manager, child;
                beforeEach(()=>{
                    manager = new LifeCycleManager();
                    arr = mu.List.of(UserType).create([new builders.UserType(), new builders.UserType(), new builders.UserType()]);
                    arr.$setManager(manager);
                    child = new builders.UserType();
                    sinon.spy(child, '$setManager');
                });
                if (context.dirtyableElements) {
                    it('sets lifecycle manager in newly added elements', function() {
                        arr.set(0, child);
                        expect(child.$setManager).to.have.been.calledWithExactly(manager);
                    });
                    it('does not try to set lifecycle manager in read-only newly added elements', function() {
                        arr.set(0, child.$asReadOnly());
                        expect(child.$setManager).to.have.not.been.calledWithExactly(manager);
                    });
                }
            });
        });

        describe('shift', function() {
            it('should return the first element from the List', function() {
                var numberList = aNumberList();
                var ListBeforeShift = numberList.concat();

                var valueRemoved = numberList.shift();

                expect(ListBeforeShift.at(0)).to.equal(valueRemoved);
            });

            it('should remove an element from the List', function() {
                var numberList = aNumberList();
                var lengthBeforeShift = numberList.length;

                numberList.shift();

                expect(numberList.length).to.equal(lengthBeforeShift - 1);
            });
        });


        describe('unshift', function() {
            it('should return the length of the List', function() {
                var numberList = aNumberList();

                var newLength = numberList.unshift();

                expect(numberList.length).to.equal(newLength, 'Did not return the proper List.length');
            });

            it('should add an element to the List', function() {
                var numberList = aNumberList();
                var lengthBeforeUnshift = numberList.length;

                numberList.unshift(5);

                expect(numberList.length).to.equal(lengthBeforeUnshift + 1);
                expect(numberList.at(0)).to.equal(5);
            });

            it("report correct path for field type mismatch in deep field", function() {
                var aList = aVeryCompositeContainerList([{}, {}]);
                expect(() => aList.unshift({}, { child1: { user: { age: "666" } } }))
                    .to.report(ERROR_FIELD_MISMATCH_IN_LIST_METHOD('unshift', 'List<VeryCompositeContainer>[1].child1.user.age', 'number', 'string'));
            });

            describe('lifecycleManager', function() {
                let arr, manager, child;
                beforeEach(()=>{
                    manager = new LifeCycleManager();
                    arr = mu.List.of(UserType).create([new builders.UserType(), new builders.UserType(), new builders.UserType()]);
                    arr.$setManager(manager);
                    child = new builders.UserType();
                    sinon.spy(child, '$setManager');
                });
                if (context.dirtyableElements) {
                    it('sets lifecycle manager in newly added elements', function() {
                        arr.unshift(child);
                        expect(child.$setManager).to.have.been.calledWithExactly(manager);
                    });
                    it('does not try to set lifecycle manager in read-only newly added elements', function() {
                        arr.unshift(child.$asReadOnly());
                        expect(child.$setManager).to.have.not.been.calledWithExactly(manager);
                    });
                }
            });
        });
    });
});
