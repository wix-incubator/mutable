/**
 * Created by amira on 1/4/15.
 */

import _ from 'lodash';
import Typorama from '../src';
import { aDataTypeWithSpec } from '../test-kit/testDrivers/index';
import { expect, err } from 'chai';
import {revision} from '../src/lifecycle';

describe('Enum Type', function() {

    describe("instantiation", function() {

        it("should return a class", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            expect(Ape).to.be.a("function");
        });

        it("enum cannot be instantiated", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            expect(function() {
                new Ape();
            }).to.report({level : /error/});
        });

        it("enum extends PrimitiveType", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            expect(Ape.chimp).to.be.instanceof(Typorama.PrimitiveBase);
        });

        it("enum can be initialized", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            var ape = Ape.chimp;
            expect(ape).to.be.equal(Ape.chimp);
        });

		it("should return value string for toString()", function() {
			var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
			expect(Ape.chimp.toString()).to.be.equal("chimp");
			expect(Ape.gorilla.toString()).to.be.equal("gorilla");
		});

        it("enum can be initialized as member in a custom type", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            var TestType = aDataTypeWithSpec({ 
                ape: Ape
            });
            var tt = TestType.create(Ape.chimp);
            expect(tt.ape).to.be.equal(Ape.chimp);
        });

        it("enum can be initialized using withDefault", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            var TestType = aDataTypeWithSpec({ 
                ape: Ape.withDefault(Ape.gorilla)
            });
            var tt = TestType.create();
            expect(tt.ape).to.be.equal(Ape.gorilla);
        });

        it("enum can receive value from create of parent type", function() {
            var Ape = Typorama.defineEnum(["chimp", "gorilla"]);
            var TestType = aDataTypeWithSpec({ 
                ape: Ape.withDefault(Ape.gorilla)
            });
            var tt = TestType.create({ ape: Ape.chimp });
            expect(tt.ape).to.be.equal(Ape.chimp);
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
            }).to.throw('object is not extensible');
        });

        it("instanceOf works", function() {
            var Ape = Typorama.defineEnum({ chimp: 1, gorilla: 2 });
            expect(Ape.chimp).to.be.instanceof(Ape);
        });

        it("members have a key which is the originl key in the def", function() {
            var Ape = Typorama.defineEnum({ chimp: 1, gorilla: 2 });
            expect(Ape.chimp.key).to.be.equal("chimp");
        });

		it("should return current value", function() {
			var ImageSizing = Typorama.defineEnum({
				NONE: null,
				COVER: "cover",
				CONTAIN: "contain"
			});

			expect(ImageSizing.NONE.toJSON()).to.be.null;
			expect(ImageSizing.COVER.toJSON()).to.be.equal("cover");
			expect(ImageSizing.CONTAIN.toJSON()).to.be.equal("contain");
		});

		it("should initiate from value string", function() {
			var ImageSizing = Typorama.defineEnum({
				NONE: null,
				COVER: "cover",
				CONTAIN: "contain"
			});

			var enumIns = ImageSizing.create(ImageSizing.COVER.toJSON());

			expect(enumIns).to.be.equal(ImageSizing.COVER);
		});

		it("should initiate from value string as part of complex data", function() {
			var ImageSizing = Typorama.defineEnum({
				NONE: null,
				COVER: "cover",
				CONTAIN: "contain"
			});

			var Complex = aDataTypeWithSpec({
				size: ImageSizing
			}, 'User');

			var complex = new Complex({ size:"cover" });

			expect(complex.size).to.be.equal(ImageSizing.COVER);
		});

		it("should initiate from default value as part of complex data when no initial value is provided", function() {
			var ImageSizing = Typorama.defineEnum({
				NONE: null,
				COVER: "cover",
				CONTAIN: "contain"
			});
			var Complex = aDataTypeWithSpec({
				size: ImageSizing.withDefault(ImageSizing.CONTAIN)
			}, 'User');

			var complex = new Complex({ size:"contain" });

			expect(complex.size).to.be.equal(ImageSizing.CONTAIN);
		});

		it("should not be dirtyable", function(){
			var ImageSizing = Typorama.defineEnum(["A", "B"]);
			expect(ImageSizing.$isDirtyable).to.not.be.defined;
			expect(ImageSizing.A.$isDirtyable).to.not.be.defined;
			expect(ImageSizing.B.$isDirtyable).to.not.be.defined;
		});

    });
});
