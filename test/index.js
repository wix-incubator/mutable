import chai from 'chai';
import testKit from '../test-kit';
import gopostalTestKit from 'gopostal/dist/test-kit';

chai.use(testKit.chai);
chai.use(gopostalTestKit.chai);

import "../test-kit/test";

import "./custom";
import "./custom-nullable";
import "./array/Array";
import "./Function";
import "./boolean";
import "./enum";
import "./defineType.spec";

