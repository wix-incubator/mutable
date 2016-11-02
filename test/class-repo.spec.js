import * as sinon from 'sinon';
import {expect} from 'chai';
import {getClassesByName, registerClass, getAllClasses} from '../src/class-repo';

class Foo {}
class AnotherFoo {}
class Bar {}

describe('class repository', ()=> {
    before(() => {
        registerClass(Foo, 'foo');
        registerClass(AnotherFoo, 'foo');
        registerClass(Bar, 'bar');
    });
    describe('.getClassesByName()', ()=> {
        it('returns all registered classes under the supplied name', ()=> {
            const types = getClassesByName('foo');
            expect(types).to.be.instanceof(Array);
            expect(types).to.include(Foo);
            expect(types).to.include(AnotherFoo);
        });
        it('does not return classes of a different name', ()=> {
            const types = getClassesByName('foo');
            expect(types).to.not.include(Bar);
        });
    });
    describe('.getAllClasses()', ()=> {
        it('getAllClasses returns all classes', ()=> {
			const types = getAllClasses();
            expect(types).to.include(Foo);
            expect(types).to.include(AnotherFoo);
            expect(types).to.include(Bar);
        });
    });
});
