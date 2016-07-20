import * as sinon from 'sinon';
import {expect} from 'chai';

import * as Typorama from '../../../src';
import {aNumberList, aStringList, UserType, AddressType, UserWithAddressType} from '../builders';

describe('List', function() {
    describe('mutable instance', function() {

        it('Should have default length', function() {
            var numberList = aNumberList([1, 2, 3]);
            expect(numberList.length).to.equal(3);
        });

        describe("with global freeze config", function() {

            before("set global freeze configuration", function() {
                Typorama.config.freezeInstance = true;
            });

            after("clear global freeze configuration", function() {
                Typorama.config.freezeInstance = false;
            });

            it("should throw error on unknown field setter", function() {
                var names = aStringList();

                expect(function() {
                    names[4] = "there is no 4 - only at()";
                }).to.throw('object is not extensible');
            });

        });

        describe('as field on data object', function() {
            var GroupType;
            beforeEach(() => {
                GroupType = Typorama.define('GroupType', {
                    spec: function() {
                        return {
                            title: Typorama.String,
                            users: Typorama.List.of(UserType)
                        };
                    }
                });
            });

            it('Should be modified from json ', function() {
                var groupData = new GroupType();

                groupData.users = Typorama.List.of(UserType).create([
                    { 'name': 'tom', 'age': 25 },
                    { 'name': 'omri', 'age': 35 }
                ]);

                expect(groupData.users.at(0).name).to.equal('tom');
                expect(groupData.users.at(0).age).to.equal(25);
                expect(groupData.users.at(1).name).to.equal('omri');
                expect(groupData.users.at(1).age).to.equal(35);
            });
        });

    });
});
