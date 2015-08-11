/**
 * Created by amira on 6/8/15.
 */
import {expect} from "chai";
import _ from 'lodash';
import * as gopostal from '../../src/gopostal';
import {listen, Report} from '../testDrivers/gopostalRecorder';


var PARAMS = ['TEST PARAMS', 1, {}];
var CONTEXT = {};
function getOneTimeReporterForLevel(reportLevel) {
	return () => gopostal.getMailBox(CONTEXT)[reportLevel](...PARAMS);
}
function testMatcherConlfusionMatrix(regexMatcher, positive, negative) {
	it(`matches existing reports (true positive)`, () => {
		expect(() => {
			expect(positive).to.report(regexMatcher);
		}).to.not.throw();
	});
	it(`matches missing reports (true negative)`, () => {
		expect(() => {
			expect(negative).not.to.report(regexMatcher);
		}).to.not.throw();
	});
	it(`does not match existing reports as missing (false negative)`, () => {
		expect(() => {
			expect(positive).not.to.report(regexMatcher);
		}).to.throw();
	});
	it(`does not match missing reports as existing (false positive)`, () => {
		expect(() => {
			expect(negative).to.report(regexMatcher);
		}).to.throw();
	})
}
describe('gopostal testkit', () => {
	gopostal.levels.forEach((reportLevel, reportIdx) => {
		var reportMatcher = new Report(reportLevel, CONTEXT, PARAMS);
		var reporterForLevel = getOneTimeReporterForLevel(reportLevel);
		var reporterForAnotherLevel = getOneTimeReporterForLevel(gopostal.levels[(reportIdx + 1) % gopostal.levels.length]);
		describe(`exact chai matcher for '${reportLevel}' level`, () => {
			testMatcherConlfusionMatrix(
				reportMatcher, 
				reporterForLevel, 
				reporterForAnotherLevel);
		});
		it(`recorder tool can match ${reportLevel} reports`, () => {
			var recording = listen(reporterForLevel);
			expect(recording).to.eql([{level : reportLevel, context : CONTEXT, params : PARAMS}]);
			expect(recording).to.eql([reportMatcher]);
		});
	});
	describe('chai matcher for regex', () => {
		testMatcherConlfusionMatrix(
			{level: /warn|error|fatal/},
			getOneTimeReporterForLevel('error'),
			getOneTimeReporterForLevel('info'));
	});

});