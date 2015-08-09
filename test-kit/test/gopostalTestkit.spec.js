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
	return () => {gopostal.getMailBox(CONTEXT)[reportLevel](...PARAMS);};
}
describe('gopostal testkit', () => {
	gopostal.levels.forEach((reportLevel, reportIdx) => {
		var expectedReport = new Report(reportLevel, CONTEXT, PARAMS);
		var reporterForLevel = getOneTimeReporterForLevel(reportLevel);
		var reporterForAnotherLevel = getOneTimeReporterForLevel(gopostal.levels[(reportIdx + 1) % gopostal.levels.length]);

		it(`can match existing ${reportLevel} reports (true positive)`, () => {
			expect(reporterForLevel).to.report(expectedReport);
		});
		it(`can match missing ${reportLevel} reports (true negative)`, () => {
			expect(reporterForAnotherLevel).to.not.report(expectedReport);
		});
		it(`does not match existing ${reportLevel} reports as missing (false negative)`, () => {
			expect (() => {
				expect(reporterForLevel).to.not.report(expectedReport)
			}).to.throw();
		});
		it(`does not match missing ${reportLevel} reports as existing (false positive)`, () => {
			expect(() => {
				expect(reporterForAnotherLevel).to.report(expectedReport);
			}).to.throw();
		});

		it(`can match ${reportLevel} reports with explicit recorder`, () => {
			var recording = listen(reporterForLevel);
			expect(recording).to.eql([{level : reportLevel, context : CONTEXT, params : PARAMS}]);
			expect(recording).to.eql([expectedReport]);
		});
	});
});