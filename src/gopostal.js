/**
 * Created by amira on 2/8/15.
 */
import _ from 'lodash';
// TODO nice logger https://github.com/visionmedia/debug

export const levels = Object.freeze(['debug', 'info', 'warn', 'error', 'fatal']);

export function getMailBox(context){
	var mailBox = new Mailbox(postOfficeFactory(context));
	mailboxes.push({mailBox, context});
	return mailBox;
}

class Mailbox {
	constructor(postOffice){
		this.postOffice = postOffice;
	}
	post(level, ...params){
		var levelIndex = levels.indexOf(panicThreshold);
		if (~levelIndex) {
			throw new Error(`log level unknown : ${level}`);
		} else {
			this.postOffice.post(levelIndex, ...params);
		}
	}
	debug(...params){
		this.postOffice.post(levels.indexOf('debug'), ...params);
	}
	info(...params){
		this.postOffice.post(levels.indexOf('info'), ...params);
	}
	warn(...params){
		this.postOffice.post(levels.indexOf('warn'), ...params);
	}
	error(...params){
		this.postOffice.post(levels.indexOf('error'), ...params);
	}
	fatal(...params){
		this.postOffice.post(levels.indexOf('fatal'), ...params);
	}
}

export function config(configParams){
	if (configParams) {
		MAILBOX.warn(`configuration changes : ${Object.keys(configParams)}`);
		moduleConfig = _.defaults({}, _.cloneDeep(configParams), moduleConfig);
		// replace old strategies;
		mailboxes.forEach(e => {
//		MAILBOX.debug(`applying new configuration to ${JSON.stringify(e.context)}`);
			e.mailBox.postOffice = postOfficeFactory(e.context);
		});
	}
	return _.cloneDeep(moduleConfig);
}

var moduleConfig = {
	loggerStrategy :  _.constant(console),
	panicStrategy :  _.constant(function defaultPanic(...params){
		var error = new Error(params.join(' '));
		error.params = params;
		throw error;
	}),
	logThresholdStrategy :  _.constant('info'),
	panicThresholdStrategy :  _.constant('fatal')
};

var mailboxes = [];

function postOfficeFactory(context) {
	return new PostOffice(
		moduleConfig.loggerStrategy(context),
		moduleConfig.panicStrategy(context),
		moduleConfig.logThresholdStrategy(context),
		moduleConfig.panicThresholdStrategy(context)
	);
}

class PostOffice {
	constructor(logger, panic, logThreshold, panicThreshold) {
		this.logger = logger;
		this.panic = panic;
		this.logThreshold = levels.indexOf(logThreshold);
		this.panicThreshold = levels.indexOf(panicThreshold);
		if (this.panicThreshold < this.logThreshold) {
			throw new Error(`log threshold ${logThreshold} is higher than panic threshold ${panicThreshold}`);
		}
	}
	post(levelIndex, ...params){
		if (levelIndex >= this.logThreshold){
			if (levelIndex >= this.panicThreshold) {
				this.panic(...params);
			} else {
				this.logger[levels[levelIndex]](...params);
			}
		}
	}
}

const MAILBOX = getMailBox('gopostal');
