/**
 * Created by amira on 9/8/15.
 */

import * as gopostal from '../../src/gopostal';


export function listen(actions) {
	return new Recorder().record(actions).reports;
}
class Recorder{

	constructor(){
		this.reports = [];
	}

	record(actions){
		// save old config
		var oldConfig = gopostal.config();
		// spy on gopostal
		gopostal.config({
			loggerStrategy: ctx => ({
				debug : spyReporter(this.reports, 'debug')(ctx),
				info : spyReporter(this.reports, 'info')(ctx),
				warn : spyReporter(this.reports, 'warn')(ctx),
				error : spyReporter(this.reports, 'error')(ctx)
			}),
			panicStrategy: spyReporter(this.reports, 'fatal'),
			logThresholdStrategy: _.constant('debug'),
			panicThresholdStrategy: _.constant('fatal')
		});
		// run actions
		actions();
		// restore config
		gopostal.config(oldConfig);
		return this;
	}
}

function spyReporter(reports, level){
	return (context) => (...params) => reports.push(new Report(level, context, params));
}

export class Report{
	constructor (level, context, params){
		this.level = level;
		this.context = context;
		this.params = params;
	}
}


