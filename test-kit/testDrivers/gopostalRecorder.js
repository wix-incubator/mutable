/**
 * Created by amira on 9/8/15.
 */

import * as gopostal from '../../src/gopostal';


export function listen(actions, filter = (ctx => ctx != 'gopostal')) {
	return new Recorder().record(actions, filter).reports;
}
class Recorder{

	constructor(){
		this.reports = [];
	}

	record(actions, filter = _.constant(true)){
		// save old config
		var oldConfig = gopostal.config();
		try {
			// spy on gopostal
			gopostal.config({
				loggerStrategy: ctx => filter(ctx) ? {
					debug: spyReporter(this.reports, 'debug', ctx),
					info: spyReporter(this.reports, 'info', ctx),
					warn: spyReporter(this.reports, 'warn', ctx),
					error: spyReporter(this.reports, 'error', ctx)
				} : oldConfig.loggerStrategy(ctx),
				panicStrategy: ctx => filter(ctx) ? spyReporter(this.reports, 'fatal', ctx) : oldConfig.panicStrategy(ctx),
				logThresholdStrategy: ctx => filter(ctx) ? 'debug' : oldConfig.logThresholdStrategy(ctx),
				panicThresholdStrategy: ctx => filter(ctx) ? 'fatal' : oldConfig.panicThresholdStrategy(ctx)
			});
			// run actions
			actions();
			// restore config
		} finally {
			gopostal.config(oldConfig);
		}
		return this;
	}
}

function spyReporter(reports, level, context){
	return (...params) => reports.push(new Report(level, context, params));
}

export class Report{
	constructor (level, context, params){
		this.level = level;
		this.context = context;
		this.params = params;
	}
}


