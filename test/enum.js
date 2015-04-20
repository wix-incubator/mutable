/**
 * Created by amira on 1/4/15.
 */

import _ from 'lodash';
import Typorama from '../src';
import {aDataTypeWithSpec} from '../test-kit/testDrivers/index';
import {expect, err} from 'chai';

describe('Enum Type', function() {

    describe("instantiation", function() {

        it("defining an enum returns a class", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            expect(Ape).to.be.a("function");
        });

        it("enum cannot be instantiated", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            expect(function() {
                new Ape();
            }).to.throw();
        });

        it("enum can be initialized", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            var ape = Ape.chimp;
            expect(ape).to.be.equal(Ape.chimp);
        });

        it("each member can have a string value", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            expect(Ape.chimp.value).to.be.equal("chimp");
            expect(Ape.gorilla.value).to.be.equal("gorilla");
        });

        it("members can have a custom string value", function() {
            var Ape = Typorama.defineEnum({ chimp: "_chimp_", gorilla: "_gorilla_" });
            expect("" + Ape.chimp).to.be.equal("_chimp_");
            expect("" + Ape.gorilla).to.be.equal("_gorilla_");
        });

        it("members can have number value", function() {
            var Ape = Typorama.defineEnum({ chimp: 0, gorilla: 1 });
            expect(0 + Ape.chimp).to.be.equal(0);
            expect(0 + Ape.gorilla).to.be.equal(1);
        });

        it("members can have object values", function() {
            var Ape = Typorama.defineEnum({ 
                chimp: { dateOfBirth: "11/11/1980" }, 
                gorilla: { dateOfBirth: "12/12/1995" } 
            });
            expect(Ape.chimp.value.dateOfBirth).to.be.equal("11/11/1980");
            expect(Ape.gorilla.value.dateOfBirth).to.be.equal("12/12/1995");
        });

        it("member is immutable", function() {
            var Ape = Typorama.defineEnum({ chimp: 1, gorilla: 2 });
            expect(function() {
                Ape.chimp.blyat = "blyat";
            }).to.throw();
        });

        it("instanceOf works", function() {
            var Ape = Typorama.defineEnum({ chimp: 1, gorilla: 2 });
            expect(Ape.chimp).to.be.instanceof(Ape);
        });

        it("members have a key which is the originl key in the def", function() {
            var Ape = Typorama.defineEnum({ chimp: 1, gorilla: 2 });
            expect(Ape.chimp.key).to.be.equal("chimp");
        });
    });
});
