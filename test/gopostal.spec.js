/**
 * Created by amira on 2/8/15.
 */
import _ from 'lodash';
import {expect, err} from 'chai';
import sinon from 'sinon';
import * as gopostal from '../src/gopostal.js';
import {Report} from '../test-kit/testDrivers/gopostalRecorder';

var EXPECTED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
var PARAMS = ['TEST PARAMS', 1, {}];

describe('gopostal', () => {
	var sandbox, originalConfig;
	after(() => {
		sandbox.restore();
	});
	before('save original configuration', () => {
		originalConfig = gopostal.config();
		sandbox = sinon.sandbox.create();
	});
	afterEach('reset configurations', () => {
		gopostal.config(originalConfig);
	});
	EXPECTED_LEVELS.forEach((level) => {
		it(`${level} is a legal report level`, ()=> {
			expect(gopostal.levels).to.contain(level);
		});
	});
	describe('default configuration', () => {
		it('logger threshold is info', ()=> {
			expect(originalConfig.logThresholdStrategy()).to.eql('info');
		});
		it('panic threshold is info', ()=> {
			expect(originalConfig.panicThresholdStrategy()).to.eql('fatal');
		});
		it('panic throws', ()=> {
			expect(() => originalConfig.panicStrategy()(...PARAMS), 'reporting fatal with default configuration').to.throw;
		});
		['debug', 'info', 'warn', 'error'].forEach((level) => {
			it(`logger.${level} writes to console.${level}`, ()=> {
				sandbox.spy(console, level);
				originalConfig.loggerStrategy()[level](...PARAMS);
				expect(console[level].called, 'logger called').to.be.true;
				expect(console[level].args, 'arguments of logger call').to.eql([PARAMS]);
			});
		});
	});
	describe('.config()', () => {
		beforeEach('reset configurations', () => {
			gopostal.config(originalConfig);
		});
		it('returns updated configuration', ()=> {
			var comparisonBase = gopostal.config();
			var newConfig = gopostal.config({loggerStrategy: _.noop});
			comparisonBase.loggerStrategy = _.noop;
			expect(comparisonBase).to.eql(newConfig);
		});
		it('returns detached configuration', ()=> {
			gopostal.config().loggerStrategy = null;
			expect(gopostal.config(), 'current config').to.eql(originalConfig);
		});
		it('accepts partial configuration', ()=> {
			gopostal.config({loggerStrategy: _.noop});
			gopostal.config({panicStrategy: _.noop});
			gopostal.config({logThresholdStrategy: _.noop});
			gopostal.config({panicThresholdStrategy: _.noop});
		});
		it('affects pre-existing mailboxes', ()=> {
			var mailBox = gopostal.getMailBox();
			var panicSpy = sandbox.spy();
			gopostal.config({panicStrategy: _.constant(panicSpy)});
			expect (()=> mailBox.fatal(...PARAMS), 'reporting fatal after overriding panic').not.to.throw();
			expect(panicSpy.calledOnce, 'panicSpy called once').to.be.true;
			expect(panicSpy.calledWithExactly(...PARAMS), 'panicSpy called with expected args').to.be.true;
		});
	});
	describe('mailbox', () => {
		var mailBox, logger, panic;
		beforeEach('init per test', ()=>{
			logger = {};
			panic = sandbox.spy();
			mailBox = gopostal.getMailBox('some context');
			gopostal.config({
				loggerStrategy: () => logger,
				panicStrategy: () => panic
			});
		});

		EXPECTED_LEVELS.forEach((logLevel, logLevelIdx) => {
			describe(`with log threshold ${logLevel}`, () => {
				beforeEach(`log threshold ${logLevel}`, () => {
					gopostal.config({
						logThresholdStrategy: _.constant(logLevel)
					});
				});
				EXPECTED_LEVELS.slice(logLevelIdx).forEach((panicLevel, panicLevelIdx) => {
					panicLevelIdx += logLevelIdx;
					describe(`and panic threshold ${panicLevel}`, () => {
						beforeEach(`panic threshold ${panicLevel}`, () => {
							gopostal.config({
								panicThresholdStrategy: _.constant(panicLevel)
							});
						});
						EXPECTED_LEVELS.forEach((reportLevel, reportLevelIdx) => {
							describe(`.${reportLevel} method`, () => {
								beforeEach(`spy on logger.${reportLevel} and report`, ()=> {
									logger[reportLevel] = sandbox.spy();
								});
								if (reportLevelIdx >= panicLevelIdx || reportLevelIdx < logLevelIdx) {
									it(`logger.${reportLevel} is not called`, ()=> {
										mailBox[reportLevel](...PARAMS);
										expect(logger[reportLevel].called, 'logger called').to.be.false;
									});
								} else {
									it(`logger.${reportLevel} is called`, ()=> {
										mailBox[reportLevel](...PARAMS);
										expect(logger[reportLevel].args, 'logger called exactly once with the expected arguments').to.eql([PARAMS]);
									});
								}
								if (reportLevelIdx < panicLevelIdx) {
									it(`panic is not called`, ()=> {
										mailBox[reportLevel](...PARAMS);
										expect(panic.called, 'panic called').to.be.false;
									});
								} else {
									it(`panic is called`, ()=> {
										mailBox[reportLevel](...PARAMS);
										expect(panic.args, 'panic called exactly once with the expected arguments').to.eql([PARAMS]);
									});
								}
							});
						});
					});
				});
			});
		});
	});
});