import Typorama from "../";
import {aDataTypeWithSpec} from "../testDrivers/index";
import {expect, err} from "chai";

describe('Type matchers', () => {

    describe('Field matcher', () => {

        var UserType = aDataTypeWithSpec({
            name: Typorama.String
        });

        it('should reject types that do not have the requested field', () => {
            expect(function(){
                expect(UserType).to.have.field('noSuchField');
            }).to.throw('expected a Type with a field noSuchField');
        });

        it('should reject objects that are not data types', () => {
            expect(function(){
                expect({}).to.have.field('');
            }).to.throw('expected a Type but got {}');
        });

    });

});