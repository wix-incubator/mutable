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
		before('spy on console', () => {
			['info', 'warn', 'error'].forEach((level) => {
				sandbox.spy(console, level);
			});
		});
		it('logger threshold is info', ()=> {
			expect(originalConfig.logThresholdStrategy()).to.eql('info');
		});
		it('panic threshold is error', ()=> {
			expect(originalConfig.panicThresholdStrategy()).to.eql('error');
		});
		it('panic throws', ()=> {
			expect(() => originalConfig.panicStrategy()(...PARAMS), 'reporting fatal with default configuration').to.throw;
		});
		['debug', 'info', 'warn', 'error'].forEach((level) => {
			var consoleLevel = (level === 'debug') ? 'info' : level;
			it(`logger.${level} writes to console.${consoleLevel}`, ()=> {
				console[consoleLevel].reset();
				originalConfig.loggerStrategy()[level](...PARAMS);
				expect(console[consoleLevel].called, 'logger called').to.be.true;
				expect(console[consoleLevel].args, 'arguments of logger call').to.eql([PARAMS]);
			});
		});
	});
	describe('.config()', () => {
		beforeEach('reset configurations', () => {
			gopostal.config(originalConfig);
		});
		it('returns updated configuration', ()=> {
			var comparisonBase = gopostal.config();
			var func = _.constant('warn');
			var newConfig = gopostal.config({logThresholdStrategy: func});
			comparisonBase.logThresholdStrategy = func;
			expect(comparisonBase).to.eql(newConfig);
		});
		it('returns detached configuration', ()=> {
			gopostal.config().loggerStrategy = null;
			expect(gopostal.config(), 'current config').to.eql(originalConfig);
		});
		it('accepts partial configuration', ()=> {
			gopostal.config({loggerStrategy: originalConfig.loggerStrategy});
			gopostal.config({panicStrategy: originalConfig.panicStrategy});
			gopostal.config({logThresholdStrategy: originalConfig.logThresholdStrategy});
			gopostal.config({panicThresholdStrategy: originalConfig.panicThresholdStrategy});
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
		function replaceAllButGopostal(field, replacement){
			var config = {};
			config[field] = (ctx) => ctx === 'gopostal'? originalConfig[field](ctx) : replacement;
			gopostal.config(config);
		}
		beforeEach('init per test', ()=>{
			logger = {};
			panic = sandbox.spy();
			mailBox = gopostal.getMailBox('some context');
			replaceAllButGopostal('loggerStrategy', logger);
			replaceAllButGopostal('panicStrategy', panic);
		});

		EXPECTED_LEVELS.forEach((panicLevel, panicLevelIdx) => {
			describe(`with panic threshold ${panicLevel}`, () => {
				beforeEach('reset log level to avoid it being higher than panic level', () => {
					replaceAllButGopostal('logThresholdStrategy', 'debug');
				});
				beforeEach(`panic threshold ${panicLevel}`, () => {
					replaceAllButGopostal('panicThresholdStrategy', panicLevel);
				});
				EXPECTED_LEVELS.slice(0, panicLevelIdx + 1).forEach((logLevel, logLevelIdx) => {
					describe(`and log threshold ${logLevel}`, () => {
						beforeEach(`log threshold ${logLevel}`, () => {
							replaceAllButGopostal('logThresholdStrategy', logLevel);
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