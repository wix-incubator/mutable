import chai from 'chai';
import sinonChai from 'sinon-chai';
import testKit from '../test-kit';
import escalateTestKit from 'escalate/dist/test-kit';

chai.use(testKit.chai);
chai.use(escalateTestKit.chai);
chai.use(sinonChai);

var context = require.context('./', true, /.+\.spec\.js?$/);
context.keys().forEach(context);


//let glob = require('glob');
//let files = glob.sync(__dirname +'/**/*.spec.js');
//files.forEach(require);
