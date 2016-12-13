import * as drivers from './test-drivers/aDataTypeWithSpec'
import chaiMatchers from "./matchers";
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import escalateTestKit from 'escalate/dist/test-kit';

chai.use(chaiMatchers);
chai.use(escalateTestKit.chai);
chai.use(sinonChai);

export default {
    drivers: drivers,
    chai: chaiMatchers
}
