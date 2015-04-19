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

        it("each member is a string", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            expect(Ape.chimp.valueOf()).to.be.equal("chimp");
            expect(Ape.gorilla.valueOf()).to.be.equal("gorilla");
        });

        it("members can have a custom string value", function() {
            var Ape = Typorama.defineEnum({ chimp: "_chimp_", gorilla: "_gorilla_" });
            expect(Ape.chimp.valueOf()).to.be.equal("_chimp_");
            expect(Ape.gorilla.valueOf()).to.be.equal("_gorilla_");
        });

        it("members can be numbers", function() {
            var Ape = Typorama.defineEnum({ chimp: 0, gorilla: 1 });
            expect(Ape.chimp.valueOf()).to.be.equal(0);
            expect(Ape.gorilla.valueOf()).to.be.equal(1);
        });

        it("members can have object values", function() {
            var Ape = Typorama.defineEnum({ chimp: { i: 1 }, gorilla: { i: 2 } });
            expect(Ape.chimp.i).to.be.equal(1);
            expect(Ape.gorilla.i).to.be.equal(2);
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
    });
});