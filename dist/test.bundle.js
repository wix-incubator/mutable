/******/ (function(modules) { // webpackBootstrap
/******/ 	var parentHotUpdateCallback = this["webpackHotUpdate"];
/******/ 	this["webpackHotUpdate"] = 
/******/ 			function webpackHotUpdateCallback(chunkId, moreModules) {
/******/ 				hotAddUpdateChunk(chunkId, moreModules);
/******/ 				if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 			}
/******/ 	
/******/ 			function hotDownloadUpdateChunk(chunkId) {
/******/ 				var head = document.getElementsByTagName('head')[0];
/******/ 				var script = document.createElement('script');
/******/ 				script.type = 'text/javascript';
/******/ 				script.charset = 'utf-8';
/******/ 				script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 				head.appendChild(script);
/******/ 			}
/******/ 	
/******/ 			function hotDownloadManifest(callback) {
/******/ 				if(typeof XMLHttpRequest === "undefined")
/******/ 					return callback(new Error("No browser support"));
/******/ 				try {
/******/ 					var request = new XMLHttpRequest();
/******/ 					var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 					request.open("GET", requestPath, true);
/******/ 					request.timeout = 10000;
/******/ 					request.send(null);
/******/ 				} catch(err) {
/******/ 					return callback(err);
/******/ 				}
/******/ 				request.onreadystatechange = function() {
/******/ 					if(request.readyState !== 4) return;
/******/ 					if(request.status === 0) {
/******/ 						// timeout
/******/ 						callback(new Error("Manifest request to " + requestPath + " timed out."));
/******/ 					} else if(request.status === 404) {
/******/ 						// no update available
/******/ 						callback();
/******/ 					} else if(request.status !== 200 && request.status !== 304) {
/******/ 						// other failure
/******/ 						callback(new Error("Manifest request to " + requestPath + " failed."));
/******/ 					} else {
/******/ 						// success
/******/ 						try {
/******/ 							var update = JSON.parse(request.responseText);
/******/ 						} catch(e) {
/******/ 							callback(e);
/******/ 							return;
/******/ 						}
/******/ 						callback(null, update);
/******/ 					}
/******/ 				};
/******/ 			}
/******/ 		
/******/
/******/ 	
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "ffca4716303758b2d276";
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentParents = [];
/******/ 	
/******/ 	function hotCreateRequire(moduleId) {
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					if(me.children.indexOf(request) < 0)
/******/ 						me.children.push(request);
/******/ 				} else hotCurrentParents = [moduleId];
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name)) {
/******/ 				fn[name] = __webpack_require__[name];
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId, callback) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			__webpack_require__.e(chunkId, function() {
/******/ 				try {
/******/ 					callback.call(null, fn);
/******/ 				} finally {
/******/ 					finishChunkLoading();
/******/ 				}
/******/ 				function finishChunkLoading() {
/******/ 					hotChunksLoading--;
/******/ 					if(hotStatus === "prepare") {
/******/ 						if(!hotWaitingFilesMap[chunkId]) {
/******/ 							hotEnsureUpdateChunk(chunkId);
/******/ 						}
/******/ 						if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 							hotUpdateDownloaded();
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		}
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) {
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "number")
/******/ 					hot._acceptedDependencies[dep] = callback;
/******/ 				else for(var i = 0; i < dep.length; i++)
/******/ 					hot._acceptedDependencies[dep[i]] = callback;
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "number")
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 				else for(var i = 0; i < dep.length; i++)
/******/ 					hot._declinedDependencies[dep[i]] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailibleFilesMap = {};
/******/ 	var hotCallback;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function hotCheck(apply, callback) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		if(typeof apply === "function") {
/******/ 			hotApplyOnUpdate = false;
/******/ 			callback = apply;
/******/ 		} else {
/******/ 			hotApplyOnUpdate = apply;
/******/ 			callback = callback || function(err) { if(err) throw err };
/******/ 		}
/******/ 		hotSetStatus("check");
/******/ 		hotDownloadManifest(function(err, update) {
/******/ 			if(err) return callback(err);
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				callback(null, null);
/******/ 				return;
/******/ 			}
/******/ 	
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotAvailibleFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			for(var i = 0; i < update.c.length; i++)
/******/ 				hotAvailibleFilesMap[update.c[i]] = true;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			hotCallback = callback;
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 2; {
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) {
/******/ 		if(!hotAvailibleFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailibleFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var callback = hotCallback;
/******/ 		hotCallback = null;
/******/ 		if(!callback) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			hotApply(hotApplyOnUpdate, callback);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(+id);
/******/ 				}
/******/ 			}
/******/ 			callback(null, outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options, callback) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		if(typeof options === "function") {
/******/ 			callback = options;
/******/ 			options = {};
/******/ 		} else if(options && typeof options === "object") {
/******/ 			callback = callback || function(err) { if(err) throw err };
/******/ 		} else {
/******/ 			options = {};
/******/ 			callback = callback || function(err) { if(err) throw err };
/******/ 		}
/******/ 		
/******/ 		function getAffectedStuff(module) {
/******/ 			var outdatedModules = [module];
/******/ 			var outdatedDependencies = {};
/******/ 			
/******/ 			var queue = outdatedModules.slice();
/******/ 			while(queue.length > 0) {
/******/ 				var moduleId = queue.pop();
/******/ 				var module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return new Error("Aborted because of self decline: " + moduleId);
/******/ 				}
/******/ 				if(moduleId === 0) {
/******/ 					return;
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return new Error("Aborted because of declined dependency: " + moduleId + " in " + parentId);
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push(parentId);
/******/ 				}
/******/ 			}
/******/ 			
/******/ 			return [outdatedModules, outdatedDependencies];
/******/ 		}
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				var moduleId = +id;
/******/ 				var result = getAffectedStuff(moduleId);
/******/ 				if(!result) {
/******/ 					if(options.ignoreUnaccepted)
/******/ 						continue;
/******/ 					hotSetStatus("abort");
/******/ 					return callback(new Error("Aborted because " + moduleId + " is not accepted"));
/******/ 				}
/******/ 				if(result instanceof Error) {
/******/ 					hotSetStatus("abort");
/******/ 					return callback(result);
/******/ 				}
/******/ 				appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 				addAllToSet(outdatedModules, result[0]);
/******/ 				for(var moduleId in result[1]) {
/******/ 					if(Object.prototype.hasOwnProperty.call(result[1], moduleId)) {
/******/ 						if(!outdatedDependencies[moduleId])
/******/ 							outdatedDependencies[moduleId] = [];
/******/ 						addAllToSet(outdatedDependencies[moduleId], result[1][moduleId]);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(var i = 0; i < outdatedModules.length; i++) {
/******/ 			var moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			var moduleId = queue.pop();
/******/ 			var module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(var j = 0; j < disposeHandlers.length; j++) {
/******/ 				var cb = disposeHandlers[j]
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(var j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				var idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 					if(child.parents.length === 0 && child.hot && child.hot._disposeHandlers && child.hot._disposeHandlers.length > 0) {
/******/ 						// Child has dispose handlers and no more references, dispose it too
/******/ 						queue.push(child.id);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				for(var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 					var dependency = moduleOutdatedDependencies[j];
/******/ 					var idx = module.children.indexOf(dependency);
/******/ 					if(idx >= 0) module.children.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(var moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				var callbacks = [];
/******/ 				for(var i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 					var dependency = moduleOutdatedDependencies[i];
/******/ 					var cb = module.hot._acceptedDependencies[dependency];
/******/ 					if(callbacks.indexOf(cb) >= 0) continue;
/******/ 					callbacks.push(cb);
/******/ 				}
/******/ 				for(var i = 0; i < callbacks.length; i++) {
/******/ 					var cb = callbacks[i];
/******/ 					try {
/******/ 						cb(outdatedDependencies);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(var i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			var moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else if(!error)
/******/ 					error = err;
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return callback(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		callback(null, outdatedModules);
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: hotCurrentParents,
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(3);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	if(true) {
		var lastData;
		var upToDate = function upToDate() {
			return lastData.indexOf(__webpack_require__.h()) >= 0;
		};
		var check = function check() {
			module.hot.check(true, function(err, updatedModules) {
				if(err) {
					if(module.hot.status() in {abort:1,fail:1}) {
						console.warn("[HMR] Cannot apply update. Need to do a full reload!");
						window.location.reload();
					} else {
						console.warn("[HMR] Update failed: " + err);
					}
					return;
				}
	
				if(!updatedModules) {
					console.warn("[HMR] Cannot find update. Need to do a full reload!");
					console.warn("[HMR] (Probably because of restarting the webpack-dev-server)")
					window.location.reload();
					return;
				}
	
				if(!upToDate()) {
					check();
				}
	
				if(!updatedModules || updatedModules.length === 0) {
					console.log("[HMR] Update is empty.");
				} else {
					console.log("[HMR] Updated modules:");
					updatedModules.forEach(function(moduleId) {
						console.log("[HMR]  - " + moduleId);
					});
				}
				if(upToDate()) {
					console.log("[HMR] App is up to date.");
				}
	
			});
		};
		var addEventListener = window.addEventListener ? function(eventName, listener) {
			window.addEventListener(eventName, listener, false);
		} : function (eventName, listener) {
			window.attachEvent('on' + eventName, listener);
		};
		addEventListener("message", function(event) {
			if(typeof event.data === "string" && event.data.indexOf("webpackHotUpdate") === 0) {
				lastData = event.data;
				if(!upToDate() && module.hot.status() === "idle") {
					console.log("[HMR] Checking for updates on the server...");
					check();
				}
			}
		});
		console.log("[HMR] Waiting for update signal from WDS...");
	} else {
		throw new Error("[HMR] Hot Module Replacement is disabled.");
	}


/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	mocha.setup("bdd");
	__webpack_require__(4)
	__webpack_require__(6);
	if(true) {
		module.hot.accept();
		module.hot.dispose(function() {
			mocha.suite.suites.length = 0;
			var stats = document.getElementById('mocha-stats');
			var report = document.getElementById('mocha-report');
			stats.parentNode.removeChild(stats);
			report.parentNode.removeChild(report);
		});
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	__webpack_require__(12);
	
	__webpack_require__(13);

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	if (! document.getElementById("mocha")) { document.write("<div id=\"mocha\"></div>"); }
	
	__webpack_require__(16);
	__webpack_require__(18);


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {process.nextTick(function() {
		delete __webpack_require__.c[module.id];
		if(typeof window !== "undefined" && window.mochaPhantomJS)
			mochaPhantomJS.run();
		else
			mocha.run();
	});
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(15)))

/***/ },
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _babelHelpers = __webpack_require__(14)["default"];
	
	var Typorama = _babelHelpers.interopRequire(__webpack_require__(21));
	
	var aDataTypeWithSpec = __webpack_require__(22).aDataTypeWithSpec;
	
	var expect = __webpack_require__(27).expect;
	
	describe("Custom data", function () {
	
	    var UserType = aDataTypeWithSpec({
	        name: Typorama.String.withDefault("leon"),
	        age: Typorama.Number.withDefault(10)
	    }, "User");
	
	    var UserWithChildType = aDataTypeWithSpec({
	        name: Typorama.String.withDefault("leon"),
	        age: Typorama.Number.withDefault(40),
	        child: UserType.withDefault({ name: "bobi", age: 13 })
	    }, "UserWithChildType");
	
	    var UserWith2ChildType = aDataTypeWithSpec({
	        name: Typorama.String.withDefault("leon"),
	        age: Typorama.Number.withDefault(40),
	        child: UserType.withDefault({ name: "bobi", age: 13 }),
	        child2: UserType.withDefault({ name: "chiki", age: 5 })
	    }, "UserWith2ChildType");
	
	    describe("definition", function () {
	        it("Should throw error for reserved keys", function () {
	            // ToDo: change to fields that start with $ and __
	            expect(function () {
	                aDataTypeWithSpec({ $asReadOnly: Typorama.String });
	            }).to["throw"]();
	        });
	    });
	
	    describe("constructor", function () {
	        it("Should have getFieldsSpec()", function () {
	            var fieldsDesc = UserType.getFieldsSpec();
	
	            //expect(fieldDesc).toHaveFields([
	            //    aField("name").withDefaults('leon').withType(Typorama.String.type),
	            //    aField("age")....])
	
	            expect(fieldsDesc.name.defaults()).to.equal("leon");
	            expect(fieldsDesc.name.type).to.eql(Typorama.String.type);
	            expect(fieldsDesc.age.defaults()).to.equal(10);
	            expect(fieldsDesc.age.type).to.eql(Typorama.Number.type);
	        });
	    });
	
	    describe("(Mutable) instance", function () {
	
	        it("Should return default value for fields from custom instance when no data is passed", function () {
	            var userData = new UserType();
	
	            expect(userData.name).to.equal("leon");
	            expect(userData.age).to.equal(10);
	        });
	
	        it("Should modify fields (json and primitives)", function () {
	            var userData = new UserWithChildType();
	
	            userData.name = "moshe";
	            userData.age = 30;
	            userData.child = { name: "chiki", age: 5 };
	
	            expect(userData.name).to.equal("moshe");
	            expect(userData.age).to.equal(30);
	            expect(userData.child.name).to.equal("chiki");
	            expect(userData.child.age).to.equal(5);
	        });
	
	        it("Should modify fields (typorama data)", function () {
	            var userData = new UserWithChildType();
	
	            userData.child = new UserType({ name: "yossi", age: 3 });
	
	            expect(userData.child.name).to.equal("yossi");
	            expect(userData.child.age).to.equal(3);
	        });
	
	        it("Should accept value", function () {
	            var userData = new UserType({ name: "yoshi", age: 50 });
	
	            expect(userData.name).to.equal("yoshi");
	            expect(userData.age).to.equal(50);
	        });
	
	        it("Should accept partial value", function () {
	            var userData = new UserType({ age: 53 });
	
	            expect(userData.name).to.equal("leon");
	            expect(userData.age).to.equal(53);
	        });
	
	        xit("Should ignore type mismatch", function () {
	            var userData = new UserType({ age: {} });
	
	            expect(userData.name).to.equal("leon");
	            expect(userData.age).to.equal(30);
	        });
	
	        it("Should return json value from toJSON()", function () {
	            var userData = new UserWithChildType();
	
	            expect(userData.toJSON()).to.eql({
	                name: "leon",
	                age: 40,
	                child: { name: "bobi", age: 13 }
	            });
	
	            userData.name = "moshe";
	            userData.age = 30;
	
	            expect(userData.toJSON()).to.eql({
	                name: "moshe",
	                age: 30,
	                child: { name: "bobi", age: 13 }
	            });
	        });
	
	        it("Should be convertible to JSON ", function () {
	            var userData = new UserWithChildType();
	
	            expect(JSON.parse(JSON.stringify(userData))).to.eql({
	                name: "leon",
	                age: 40,
	                child: { name: "bobi", age: 13 }
	            });
	
	            userData.name = "moshe";
	            userData.age = 30;
	
	            expect(JSON.parse(JSON.stringify(userData))).to.eql({
	                name: "moshe",
	                age: 30,
	                child: { name: "bobi", age: 13 }
	            });
	        });
	
	        it("Should return wrapped data for none native immutable fields (like custom data)", function () {
	            var userData = new UserWithChildType();
	
	            expect(userData.child instanceof UserType).to.equal(true);
	        });
	    });
	
	    describe("(Read Only) instance", function () {
	
	        it("Should be created from data instance", function () {
	            var userData = new UserType();
	            var userReadOnly = userData.$asReadOnly();
	
	            expect(userReadOnly.name).to.equal("leon");
	            expect(userReadOnly.age).to.equal(10);
	        });
	
	        it("Should be created once for each data instance", function () {
	            var userData = new UserType();
	            var userReadOnly = userData.$asReadOnly();
	            var userReadOnly2 = userData.$asReadOnly();
	
	            expect(userReadOnly).to.equal(userReadOnly2);
	        });
	
	        it("Should be linked to data instance values", function () {
	            var userData = new UserType();
	            var userReadOnly = userData.$asReadOnly();
	
	            userData.name = "moshe";
	            userData.age = 120;
	
	            expect(userReadOnly.name).to.equal("moshe");
	            expect(userReadOnly.age).to.equal(120);
	        });
	
	        it("Should not change values", function () {
	            var userData = new UserType();
	            var userReadOnly = userData.$asReadOnly();
	
	            userReadOnly.name = "moshe";
	            userReadOnly.age = 120;
	
	            expect(userData.name).to.equal("leon");
	            expect(userData.age).to.equal(10);
	            expect(userReadOnly.name).to.equal("leon");
	            expect(userReadOnly.age).to.equal(10);
	        });
	
	        it("Should return wrapped data for none native immutable fields (like custom data)", function () {
	            var userData = new UserWithChildType().$asReadOnly();
	
	            var readOnlyChild = userData.child;
	            readOnlyChild.name = "modified name";
	
	            expect(readOnlyChild instanceof UserType).to.equal(true);
	            expect(readOnlyChild.name).to.equal("bobi");
	        });
	    });
	
	    describe("Type invalidation", function () {
	        describe("$isInvalidated()", function () {
	            it("Should return false for un modified data", function () {
	                var userData = new UserType();
	                expect(userData.$isInvalidated()).to.equal(false);
	            });
	            it("Should return true for modified data", function () {
	                var userData = new UserType();
	                userData.name = "gaga";
	                expect(userData.$isInvalidated()).to.equal(true);
	            });
	            it("Should return true for data when a child value has changed", function () {
	                var userWithChildType = new UserWithChildType();
	                userWithChildType.child.name = "gaga";
	                expect(userWithChildType.$isInvalidated()).to.equal(true);
	            });
	            xit("Should return true for data when a child value has changed after isinvalidates was already called", function () {
	                var userWithChildType = new UserWithChildType();
	                expect(userWithChildType.$isInvalidated()).to.equal(false);
	                userWithChildType.child.name = "gaga";
	                expect(userWithChildType.$isInvalidated()).to.equal(true);
	            });
	            it("Should return false for data when only a parent/sibling value has changed", function () {
	                var userWith2ChildType = new UserWith2ChildType();
	
	                userWith2ChildType.name = "gaga";
	                userWith2ChildType.child.name = "baga";
	                expect(userWith2ChildType.child.$isInvalidated()).to.equal(true);
	                expect(userWith2ChildType.child2.$isInvalidated()).to.equal(false);
	            });
	        });
	        describe("$revalidate()", function () {
	            it("Should reset data invalidation", function () {
	                var userData = new UserType();
	                userData.name = "gaga";
	                expect(userData.$isInvalidated()).to.equal(true);
	                userData.$revalidate();
	                expect(userData.$isInvalidated()).to.equal(false);
	            });
	            it("Should reset deep data invalidation", function () {
	                var userWithChildType = new UserWithChildType();
	                userWithChildType.child.name = "gaga";
	                expect(userWithChildType.$isInvalidated()).to.equal(true);
	                expect(userWithChildType.child.$isInvalidated()).to.equal(true);
	                userWithChildType.$revalidate();
	                expect(userWithChildType.$isInvalidated()).to.equal(false);
	                expect(userWithChildType.child.$isInvalidated()).to.equal(false);
	            });
	        });
	        describe("$resetValidationCheck()", function () {
	            it("it Should allow isInvalidated to return true for data when a child value has changed after isinvalidates was already called", function () {
	                var userWithChildType = new UserWithChildType();
	                expect(userWithChildType.$isInvalidated()).to.equal(false);
	                userWithChildType.child.name = "gaga";
	                expect(userWithChildType.$isInvalidated()).to.equal(false);
	                userWithChildType.$resetValidationCheck();
	                expect(userWithChildType.$isInvalidated()).to.equal(true);
	            });
	        });
	    });
	});

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _babelHelpers = __webpack_require__(14)["default"];
	
	var Typorama = _babelHelpers.interopRequire(__webpack_require__(21));
	
	var aDataTypeWithSpec = __webpack_require__(22).aDataTypeWithSpec;
	
	var expect = __webpack_require__(27).expect;
	
	describe("Array data", function () {
	
	    var UserType = aDataTypeWithSpec({
	        name: Typorama.String.withDefault(""),
	        age: Typorama.Number.withDefault(10)
	    }, "User");
	
	    var AddressType = aDataTypeWithSpec({
	        address: Typorama.String.withDefault(""),
	        code: Typorama.Number.withDefault(10)
	    }, "Address");
	
	    var UserWithAddressType = aDataTypeWithSpec({
	        user: UserType,
	        address: AddressType
	    }, "UserWithAddress");
	
	    describe("(Mutable) instance", function () {
	
	        it("Should have default length", function () {
	            var numberList = new Typorama.Array([1, 2, 3, 4], false, Typorama.Number);
	            expect(numberList.length).to.equal(4);
	        });
	
	        it("Should be created once for each data instance", function () {
	            var numberList = new Typorama.Array([1, 2, 3, 4], false, Typorama.Number);
	            var numberListReadOnly = numberList.$asReadOnly();
	            var numberListReadOnly2 = numberList.$asReadOnly();
	
	            expect(numberListReadOnly).to.equal(numberListReadOnly2);
	        });
	
	        describe("at()", function () {
	
	            it("Should return a number for native immutable Typorama.Number", function () {
	                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
	                expect(numberList.at(0)).to.equal(1);
	            });
	
	            it("Should return a string for native immutable Typorama.String", function () {
	                var arr = Typorama.Array.of(Typorama.String).create(["123", "sdfs"]);
	                expect(arr.at(0)).to.equal("123");
	            });
	
	            it("Should return wrapped item that passes the test() of their type", function () {
	                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
	                expect(numberList.__options__.subTypes.test(numberList.at(0))).to.equal(true);
	            });
	
	            it("Should return a typed item for none immutable data (like custom types)", function () {
	                var arr = Typorama.Array.of(UserType).create([{ name: "avi", age: 12 }]);
	                expect(arr.at(0) instanceof UserType).to.equal(true);
	            });
	
	            it("Should always return a the same reference for wrapper", function () {
	                var arr = Typorama.Array.of(UserType).create([{ name: "avi", age: 12 }]);
	                expect(arr.at(0)).to.equal(arr.at(0));
	            });
	
	            it("Should return a typed item form multiple types if there is _type field", function () {
	                var data = [{ _type: "User", name: "avi", age: 12 }, { _type: "Address", name: "avi", age: 12 }];
	                var arr = Typorama.Array.of([UserType, AddressType]).create(data);
	                expect(arr.at(0) instanceof UserType).to.equal(true);
	                expect(arr.at(1) instanceof AddressType).to.equal(true);
	            });
	
	            it("Should modify inner complex data", function () {
	                var arrComplexType = Typorama.Array.of(UserWithAddressType).create([{}, {}, {}]);
	
	                arrComplexType.at(1).user.name = "modified user name";
	
	                expect(arrComplexType.at(1).user.name).to.equal("modified user name");
	            });
	
	            it("Should handle multi level array", function () {
	                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]]);
	                expect(arrComplexType.at(0).at(0) instanceof UserWithAddressType).to.equal(true);
	            });
	
	            it("Should change type form multi level array", function () {
	                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]]);
	                var userWithAddress = arrComplexType.at(0).at(0);
	
	                userWithAddress.user.name = "you got a new name";
	
	                expect(userWithAddress.user.name).to.equal("you got a new name");
	            });
	
	            it("Should keep read only item as read only", function () {
	                var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
	                var readOnlyData = new UserWithAddressType().$asReadOnly();
	                var arrComplexType = Typorama.Array.of(UserWithAddressType).create([readOnlyData]);
	
	                var readOnlyItemData = arrComplexType.at(0);
	
	                readOnlyItemData.user.name = "you got a new name";
	
	                expect(readOnlyItemData.user.name).to.equal(userDefaultName);
	                expect(readOnlyItemData).to.equal(readOnlyData);
	            });
	        });
	
	        describe("push()", function () {
	            it("it should add a number to an array ", function () {
	                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
	                var lengthBeforePush = numberList.length;
	                var newIndex = numberList.push(5);
	                expect(newIndex).to.equal(5);
	                expect(numberList.length).to.equal(lengthBeforePush + 1);
	                expect(numberList.at(4)).to.equal(5);
	                expect(numberList.$isInvalidated()).to.equal(true);
	            });
	
	            it("Should add a typed item for none immutable data (like custom types)", function () {
	                var arr = Typorama.Array.of(UserType).create([]);
	                arr.push({ name: "zag" });
	                expect(arr.at(0) instanceof UserType).to.equal(true);
	            });
	
	            it("Should add a typed item form multiple types if there is _type field", function () {
	                var arr = Typorama.Array.of([UserType, AddressType]).create([]);
	                arr.push({ _type: "User" });
	                arr.push({ _type: "Address" });
	                expect(arr.at(0) instanceof UserType).to.equal(true);
	                expect(arr.at(1) instanceof AddressType).to.equal(true);
	            });
	        });
	        describe("forEach", function () {
	            it("should call the method passed with item, index, arr", function () {
	                var sourceArr = [1, 2, 3];
	                var numberList = Typorama.Array.of(Typorama.Number).create(sourceArr);
	                var count = 0;
	
	                numberList.forEach(function (item, index, arr) {
	                    expect(item).to.equal(sourceArr[index]);
	                    expect(index).to.equal(count);
	                    expect(arr).to.equal(numberList);
	                    count++;
	                });
	            });
	        });
	        describe("concat", function () {
	            it("should create a new array built from the source array and all arrays passed to it", function () {
	                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2]);
	                var numberList1 = Typorama.Array.of(Typorama.Number).create([3, 4]);
	                var numberList2 = [5, 6];
	                var concatRes = numberList.concat(numberList1, numberList2);
	                expect(concatRes.length).to.equal(6);
	                for (var i = 0; i < 6; i++) {
	                    expect(concatRes.at(i)).to.equal(i + 1);
	                }
	            });
	            it("should allow subtypes allowed by all the different arrays", function () {
	                var userList = Typorama.Array.of(UserType).create([{}]);
	                var addressList = Typorama.Array.of(AddressType).create([{}]);
	                var mixedList = [{ _type: userList.displayName }, { _type: addressList.displayName }];
	                var concatRes = userList.concat(addressList, mixedList);
	                expect(concatRes.length).to.equal(4);
	                expect(concatRes.at(0) instanceof UserType).to.equal(true);
	                expect(concatRes.at(1) instanceof AddressType).to.equal(true);
	                expect(concatRes.at(2) instanceof UserType).to.equal(true);
	                expect(concatRes.at(3) instanceof AddressType).to.equal(true);
	            });
	        });
	        describe("splice()", function () {
	            it("changes the content of an array by removing existing elements and/or adding new elements", function () {
	                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
	                var removedItems = numberList.splice(1, 2, 7, 10, 13);
	                expect(numberList.length).to.equal(5);
	                expect(numberList.at(0)).to.equal(1);
	                expect(numberList.at(1)).to.equal(7);
	                expect(numberList.at(2)).to.equal(10);
	                expect(numberList.at(3)).to.equal(13);
	                expect(numberList.at(4)).to.equal(4);
	                expect(removedItems.length).to.equal(2);
	                expect(removedItems[0]).to.equal(2);
	                expect(removedItems[1]).to.equal(3);
	                expect(numberList.$isInvalidated()).to.equal(true);
	            });
	
	            it("Should wrap items for none immutable data (like custom types)", function () {
	                var arr = Typorama.Array.of(UserType).create([{ name: "aag" }, { name: "dag" }]);
	                arr.splice(0, 1, { name: "zag" });
	                expect(arr.at(1) instanceof UserType).to.equal(true);
	                expect(arr.at(0).name).to.equal("zag");
	                expect(arr.at(1).name).to.equal("dag");
	            });
	        });
	
	        describe("every", function () {
	            it("should return true if all elements pass the test provided by the callback", function () {
	                var arr = Typorama.Array.of(Typorama.String).create(["a", "a"]);
	                var areAll = arr.every(function (element) {
	                    return element === "a";
	                });
	                expect(areAll).to.equal(true);
	            });
	            it("should return false if at least one element in the array returns false from the callback", function () {
	                var arr = Typorama.Array.of(Typorama.String).create(["a", "b"]);
	                var areAll = arr.every(function (element) {
	                    return element === "a";
	                });
	                expect(areAll).to.equal(false);
	            });
	        });
	
	        describe("some", function () {
	            it("should return true if any elements pass the test provided by the callback", function () {
	                var arr = Typorama.Array.of(Typorama.String).create(["a", "b"]);
	                var areAll = arr.some(function (element) {
	                    return element === "a";
	                });
	                expect(areAll).to.equal(true);
	            });
	            it("should return false if all elements fail to pass the test provided by the callback", function () {
	                var arr = Typorama.Array.of(Typorama.String).create(["b", "b"]);
	                var areAll = arr.some(function (element) {
	                    return element === "a";
	                });
	                expect(areAll).to.equal(false);
	            });
	        });
	
	        describe("find", function () {
	            it("should return the first element that passes the callback test", function () {
	                var arr = Typorama.Array.of(UserType).create([{ name: "lando" }, { name: "mollari" }]);
	                var itemFound = arr.find(function (element) {
	                    return element.name === "mollari";
	                });
	                expect(itemFound).to.equal(arr.at(1));
	            });
	            xit("should return the first element that matches the passed object", function () {
	                var arr = Typorama.Array.of(UserType).create([{ name: "lando" }, { name: "mollari" }]);
	                var itemFound = arr.find({ name: "mollari" });
	                expect(itemFound).to.equal(arr.at(1));
	            });
	            it("should return undefined if no elements that pass the callback test", function () {
	                var arr = Typorama.Array.of(UserType).create([{ name: "lando" }, { name: "mollari" }]);
	                var itemFound = arr.find(function (element) {
	                    return element.name === "G'Kar";
	                });
	                expect(itemFound).to.equal(undefined);
	            });
	        });
	
	        describe("findIndex", function () {
	            it("should return the index of the first element that passes the callback test", function () {
	                var arr = Typorama.Array.of(UserType).create([{ name: "lando" }, { name: "mollari" }]);
	                var itemIndex = arr.findIndex(function (element) {
	                    return element.name === "mollari";
	                });
	                expect(itemIndex).to.equal(1);
	            });
	            xit("should return the index of the first element that matches the passed object", function () {
	                var arr = Typorama.Array.of(UserType).create([{ name: "lando" }, { name: "mollari" }]);
	                var itemIndex = arr.findIndex({ name: "mollari" });
	                expect(itemIndex).to.equal(1);
	            });
	            it("should return -1 if no elements pass the callback test", function () {
	                var arr = Typorama.Array.of(UserType).create([{ name: "lando" }, { name: "mollari" }]);
	                var itemIndex = arr.findIndex(function (element) {
	                    return element.name === "G'Kar";
	                });
	                expect(itemIndex).to.equal(-1);
	            });
	        });
	
	        describe("filter", function () {
	            xit("should return a new array with all elements that pass the callback test", function () {
	                var arr = Typorama.Array.of(Typorama.Number).create([42, 3, 15, 4, 7]);
	                var filterArray = arr.filter(function (element) {
	                    debugger;
	                    return element > 5;
	                });
	                expect(filterArray.length).to.equal(3);
	                expect(filterArray.valueOf()).to.equal([42, 15, 7]);
	            });
	            it("should return an empty array if no elements pass the callback test", function () {
	                var arr = Typorama.Array.of(Typorama.Numbers).create([42, 3, 15, 4, 7]);
	                var filterArray = arr.filter(function (element) {
	                    return element > 50;
	                });
	                expect(filterArray.length).to.equal(0);
	            });
	        });
	
	        describe("as field on data object", function () {
	
	            var GroupType = Typorama.define("GroupType", {
	                spec: function spec(GroupType) {
	                    return {
	                        title: Typorama.String,
	                        users: Typorama.Array.of(UserType)
	                    };
	                }
	            });
	
	            it("Should be modified from json ", function () {
	                var groupData = new GroupType();
	
	                groupData.users = [{ name: "tom", age: 25 }, { name: "omri", age: 35 }];
	
	                expect(groupData.users.at(0).name).to.equal("tom");
	                expect(groupData.users.at(0).age).to.equal(25);
	                expect(groupData.users.at(1).name).to.equal("omri");
	                expect(groupData.users.at(1).age).to.equal(35);
	            });
	        });
	    });
	
	    describe("(Read Only) instance", function () {
	
	        it("Should have default length", function () {
	            var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
	            expect(numberList.length).to.equal(4);
	        });
	
	        describe("at()", function () {
	
	            it("Should return a number for native immutable Typorama.Number", function () {
	                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
	                expect(numberList.at(0)).to.equal(1);
	            });
	
	            it("Should return a string for native immutable Typorama.String", function () {
	                var arr = Typorama.Array.of(Typorama.String).create(["123", "sdfs"]).$asReadOnly();
	                expect(arr.at(0)).to.equal("123");
	            });
	
	            it("Should return wrapped item that passes the test() of their type", function () {
	                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
	                expect(numberList.__options__.subTypes.test(numberList.at(0))).to.equal(true);
	            });
	
	            it("Should return a typed item for none immutable data (like custom types)", function () {
	                var arr = Typorama.Array.of(UserType).create([{ name: "avi", age: 12 }]).$asReadOnly();
	                expect(arr.at(0) instanceof UserType).to.equal(true);
	            });
	
	            it("Should return a typed item form multiple types if there is _type field", function () {
	                var data = [{ _type: "User", name: "avi", age: 12 }, { _type: "Address", name: "avi", age: 12 }];
	                var arr = Typorama.Array.of([UserType, AddressType]).create(data).$asReadOnly();
	                expect(arr.at(0) instanceof UserType).to.equal(true);
	                expect(arr.at(1) instanceof AddressType).to.equal(true);
	            });
	
	            it("Should not modify inner complex data", function () {
	                var userDefaultName = UserWithAddressType.getFieldsSpec().user.defaults().name;
	                var arrComplexType = Typorama.Array.of(UserWithAddressType).create([{}, {}, {}]).$asReadOnly();
	
	                arrComplexType.at(1).user.name = "modified user name";
	
	                expect(arrComplexType.at(1).user.name).to.equal(userDefaultName);
	            });
	
	            it("Should handle multi level array", function () {
	                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]], true);
	                expect(arrComplexType.at(0).at(0) instanceof UserWithAddressType).to.equal(true);
	            });
	
	            it("Should not change type from multi level array", function () {
	                var arrComplexType = Typorama.Array.of(Typorama.Array.of(UserWithAddressType)).create([[{}], [{}], [{}]], true);
	                var userWithAddress = arrComplexType.at(0).at(0);
	
	                userWithAddress.user.name = "you got a new name";
	
	                expect(userWithAddress.user.name).to.equal("");
	            });
	        });
	
	        describe("push()", function () {
	            it("should not modify an array ", function () {
	                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
	                var lengthBeforePush = numberList.length;
	                var newIndex = numberList.push(5);
	                expect(newIndex).to.equal(null);
	                expect(numberList.length).to.equal(lengthBeforePush);
	                expect(numberList.at(4)).to.equal(undefined);
	            });
	        });
	        describe("splice()", function () {
	            it("should not modify an array ", function () {
	                var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]).$asReadOnly();
	                var lengthBeforeSplice = numberList.length;
	                var removedItems = numberList.splice(1, 2, 7, 6, 5);
	                expect(removedItems).to.equal(null);
	                expect(numberList.length).to.equal(lengthBeforeSplice);
	                expect(numberList.at(0)).to.equal(1);
	                expect(numberList.at(1)).to.equal(2);
	                expect(numberList.at(2)).to.equal(3);
	                expect(numberList.at(3)).to.equal(4);
	            });
	        });
	
	        describe("Type Invalidation", function () {
	            describe("$isInvalidated()", function () {
	                it("Should return false for unmodified data", function () {
	                    var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
	                    expect(numberList.$isInvalidated()).to.equal(false);
	                });
	                xit("Should return true for modified data", function () {
	                    var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
	                    numberList.push(5);
	                    expect(numberList.$isInvalidated()).to.equal(true);
	                });
	                it("Should return true for data when a child value has changed", function () {
	                    var arr = Typorama.Array.of(UserType).create([{ name: "avi", age: 12 }]);
	                    arr.at(0).name = "gaga";
	                    expect(arr.$isInvalidated()).to.equal(true);
	                });
	                xit("Should return true for data when a child value has changed after isinvalidates was already called", function () {
	                    var arr = Typorama.Array.of(UserType).create([{ name: "avi", age: 12 }]);
	                    expect(arr.$isInvalidated()).to.equal(false);
	                    arr.at(0).name = "gaga";
	                    expect(arr.$isInvalidated()).to.equal(true);
	                });
	                it("Should return false for data when only a parent/sibling value has changed", function () {
	                    var arr = Typorama.Array.of(UserType).create([{ name: "avi", age: 12 }, { name: "shlomo", age: 15 }]);
	
	                    arr.at(0).name = "gaga";
	                    expect(arr.at(0).$isInvalidated()).to.equal(true);
	                    expect(arr.at(1).$isInvalidated()).to.equal(false);
	                    expect(arr.$isInvalidated()).to.equal(true);
	                });
	            });
	
	            describe("$revalidate()", function () {
	                xit("Should reset data invalidation", function () {
	                    var numberList = Typorama.Array.of(Typorama.Number).create([1, 2, 3, 4]);
	                    numberList.push(5);
	                    expect(numberList.$isInvalidated()).to.equal(true);
	                    numberList.$revalidate();
	                    expect(numberList.$isInvalidated()).to.equal(false);
	                });
	                it("Should reset deep data invalidation", function () {
	                    var arr = Typorama.Array.of(UserType).create([{ name: "avi", age: 12 }]);
	                    arr.at(0).name = "gaga";
	                    expect(arr.$isInvalidated()).to.equal(true);
	                    expect(arr.at(0).$isInvalidated()).to.equal(true);
	                    arr.$revalidate();
	                    expect(arr.$isInvalidated()).to.equal(false);
	                    expect(arr.at(0).$isInvalidated()).to.equal(false);
	                });
	            });
	
	            describe("$resetValidationCheck()", function () {
	                it("it Should allow isInvalidated to return true for data when a child value has changed after isinvalidates was already called", function () {
	                    var arr = Typorama.Array.of(UserType).create([{ name: "avi", age: 12 }]);
	                    expect(arr.$isInvalidated()).to.equal(false);
	                    expect(arr.at(0).$isInvalidated()).to.equal(false);
	                    arr.at(0).name = "gaga";
	                    expect(arr.$isInvalidated()).to.equal(false);
	                    arr.$resetValidationCheck();
	                    expect(arr.$isInvalidated()).to.equal(true);
	                    expect(arr.at(0).$isInvalidated()).to.equal(true);
	                });
	            });
	        });
	    });
	});

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";
	
	var _core = __webpack_require__(19)["default"];
	
	var helpers = exports["default"] = {};
	exports.__esModule = true;
	
	helpers.inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }
	
	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) subClass.__proto__ = superClass;
	};
	
	helpers.defaults = function (obj, defaults) {
	  var keys = _core.Object.getOwnPropertyNames(defaults);
	
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	
	    var value = _core.Object.getOwnPropertyDescriptor(defaults, key);
	
	    if (value && value.configurable && obj[key] === undefined) {
	      Object.defineProperty(obj, key, value);
	    }
	  }
	
	  return obj;
	};
	
	helpers.prototypeProperties = function (child, staticProps, instanceProps) {
	  if (staticProps) Object.defineProperties(child, staticProps);
	  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
	};
	
	helpers.applyConstructor = function (Constructor, args) {
	  var instance = Object.create(Constructor.prototype);
	  var result = Constructor.apply(instance, args);
	  return result != null && (typeof result == "object" || typeof result == "function") ? result : instance;
	};
	
	helpers.taggedTemplateLiteral = function (strings, raw) {
	  return _core.Object.freeze(Object.defineProperties(strings, {
	    raw: {
	      value: _core.Object.freeze(raw)
	    }
	  }));
	};
	
	helpers.taggedTemplateLiteralLoose = function (strings, raw) {
	  strings.raw = raw;
	  return strings;
	};
	
	helpers.interopRequire = function (obj) {
	  return obj && obj.__esModule ? obj["default"] : obj;
	};
	
	helpers.toArray = function (arr) {
	  return Array.isArray(arr) ? arr : _core.Array.from(arr);
	};
	
	helpers.toConsumableArray = function (arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
	
	    return arr2;
	  } else {
	    return _core.Array.from(arr);
	  }
	};
	
	helpers.slicedToArray = function (arr, i) {
	  if (Array.isArray(arr)) {
	    return arr;
	  } else if (_core.$for.isIterable(Object(arr))) {
	    var _arr = [];
	
	    for (var _iterator = _core.$for.getIterator(arr), _step; !(_step = _iterator.next()).done;) {
	      _arr.push(_step.value);
	
	      if (i && _arr.length === i) break;
	    }
	
	    return _arr;
	  } else {
	    throw new TypeError("Invalid attempt to destructure non-iterable instance");
	  }
	};
	
	helpers.objectWithoutProperties = function (obj, keys) {
	  var target = {};
	
	  for (var i in obj) {
	    if (keys.indexOf(i) >= 0) continue;
	    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
	    target[i] = obj[i];
	  }
	
	  return target;
	};
	
	helpers.hasOwn = Object.prototype.hasOwnProperty;
	helpers.slice = Array.prototype.slice;
	helpers.bind = Function.prototype.bind;
	
	helpers.defineProperty = function (obj, key, value) {
	  return Object.defineProperty(obj, key, {
	    value: value,
	    enumerable: true,
	    configurable: true,
	    writable: true
	  });
	};
	
	helpers.asyncToGenerator = function (fn) {
	  return function () {
	    var gen = fn.apply(this, arguments);
	    return new _core.Promise(function (resolve, reject) {
	      var callNext = step.bind(null, "next");
	      var callThrow = step.bind(null, "throw");
	
	      function step(key, arg) {
	        try {
	          var info = gen[key](arg);
	          var value = info.value;
	        } catch (error) {
	          reject(error);
	          return;
	        }
	
	        if (info.done) {
	          resolve(value);
	        } else {
	          _core.Promise.resolve(value).then(callNext, callThrow);
	        }
	      }
	
	      callNext();
	    });
	  };
	};
	
	helpers.interopRequireWildcard = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};
	
	helpers._typeof = function (obj) {
	  return obj && obj.constructor === _core.Symbol ? "symbol" : typeof obj;
	};
	
	helpers._extends = _core.Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];
	
	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }
	
	  return target;
	};
	
	helpers.get = function get(_x, _x2, _x3) {
	  var _again = true;
	
	  _function: while (_again) {
	    _again = false;
	    var object = _x,
	        property = _x2,
	        receiver = _x3;
	    desc = parent = getter = undefined;
	
	    var desc = _core.Object.getOwnPropertyDescriptor(object, property);
	
	    if (desc === undefined) {
	      var parent = _core.Object.getPrototypeOf(object);
	
	      if (parent === null) {
	        return undefined;
	      } else {
	        _x = parent;
	        _x2 = property;
	        _x3 = receiver;
	        _again = true;
	        continue _function;
	      }
	    } else if ("value" in desc && desc.writable) {
	      return desc.value;
	    } else {
	      var getter = desc.get;
	
	      if (getter === undefined) {
	        return undefined;
	      }
	
	      return getter.call(receiver);
	    }
	  }
	};
	
	helpers.set = function set(_x, _x2, _x3, _x4) {
	  var _again = true;
	
	  _function: while (_again) {
	    _again = false;
	    var object = _x,
	        property = _x2,
	        value = _x3,
	        receiver = _x4;
	    desc = parent = setter = undefined;
	
	    var desc = _core.Object.getOwnPropertyDescriptor(object, property);
	
	    if (desc === undefined) {
	      var parent = _core.Object.getPrototypeOf(object);
	
	      if (parent !== null) {
	        _x = parent;
	        _x2 = property;
	        _x3 = value;
	        _x4 = receiver;
	        _again = true;
	        continue _function;
	      }
	    } else if ("value" in desc && desc.writable) {
	      return desc.value = value;
	    } else {
	      var setter = desc.set;
	
	      if (setter !== undefined) {
	        return setter.call(receiver, value);
	      }
	    }
	  }
	};
	
	helpers.classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	
	helpers.objectDestructuringEmpty = function (obj) {
	  if (obj == null) throw new TypeError("Cannot destructure undefined");
	};
	
	helpers.temporalUndefined = {};
	
	helpers.temporalAssertDefined = function (val, name, undef) {
	  if (val === undef) {
	    throw new ReferenceError(name + " is not defined - temporal dead zone");
	  }
	
	  return true;
	};
	
	helpers.selfGlobal = typeof global === "undefined" ? self : global;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	// shim for using process in browser
	
	var process = module.exports = {};
	
	process.nextTick = (function () {
	    var canSetImmediate = typeof window !== 'undefined'
	    && window.setImmediate;
	    var canMutationObserver = typeof window !== 'undefined'
	    && window.MutationObserver;
	    var canPost = typeof window !== 'undefined'
	    && window.postMessage && window.addEventListener
	    ;
	
	    if (canSetImmediate) {
	        return function (f) { return window.setImmediate(f) };
	    }
	
	    var queue = [];
	
	    if (canMutationObserver) {
	        var hiddenDiv = document.createElement("div");
	        var observer = new MutationObserver(function () {
	            var queueList = queue.slice();
	            queue.length = 0;
	            queueList.forEach(function (fn) {
	                fn();
	            });
	        });
	
	        observer.observe(hiddenDiv, { attributes: true });
	
	        return function nextTick(fn) {
	            if (!queue.length) {
	                hiddenDiv.setAttribute('yes', 'no');
	            }
	            queue.push(fn);
	        };
	    }
	
	    if (canPost) {
	        window.addEventListener('message', function (ev) {
	            var source = ev.source;
	            if ((source === window || source === null) && ev.data === 'process-tick') {
	                ev.stopPropagation();
	                if (queue.length > 0) {
	                    var fn = queue.shift();
	                    fn();
	                }
	            }
	        }, true);
	
	        return function nextTick(fn) {
	            queue.push(fn);
	            window.postMessage('process-tick', '*');
	        };
	    }
	
	    return function nextTick(fn) {
	        setTimeout(fn, 0);
	    };
	})();
	
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(17);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(23)(content, {});
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		module.hot.accept(17, function() {
			var newContent = __webpack_require__(17);
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(28)();
	exports.push([module.id, "@charset \"utf-8\";\n\nbody {\n  margin:0;\n}\n\n#mocha {\n  font: 20px/1.5 \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  margin: 60px 50px;\n}\n\n#mocha ul,\n#mocha li {\n  margin: 0;\n  padding: 0;\n}\n\n#mocha ul {\n  list-style: none;\n}\n\n#mocha h1,\n#mocha h2 {\n  margin: 0;\n}\n\n#mocha h1 {\n  margin-top: 15px;\n  font-size: 1em;\n  font-weight: 200;\n}\n\n#mocha h1 a {\n  text-decoration: none;\n  color: inherit;\n}\n\n#mocha h1 a:hover {\n  text-decoration: underline;\n}\n\n#mocha .suite .suite h1 {\n  margin-top: 0;\n  font-size: .8em;\n}\n\n#mocha .hidden {\n  display: none;\n}\n\n#mocha h2 {\n  font-size: 12px;\n  font-weight: normal;\n  cursor: pointer;\n}\n\n#mocha .suite {\n  margin-left: 15px;\n}\n\n#mocha .test {\n  margin-left: 15px;\n  overflow: hidden;\n}\n\n#mocha .test.pending:hover h2::after {\n  content: '(pending)';\n  font-family: arial, sans-serif;\n}\n\n#mocha .test.pass.medium .duration {\n  background: #c09853;\n}\n\n#mocha .test.pass.slow .duration {\n  background: #b94a48;\n}\n\n#mocha .test.pass::before {\n  content: '✓';\n  font-size: 12px;\n  display: block;\n  float: left;\n  margin-right: 5px;\n  color: #00d6b2;\n}\n\n#mocha .test.pass .duration {\n  font-size: 9px;\n  margin-left: 5px;\n  padding: 2px 5px;\n  color: #fff;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.2);\n  -moz-box-shadow: inset 0 1px 1px rgba(0,0,0,.2);\n  box-shadow: inset 0 1px 1px rgba(0,0,0,.2);\n  -webkit-border-radius: 5px;\n  -moz-border-radius: 5px;\n  -ms-border-radius: 5px;\n  -o-border-radius: 5px;\n  border-radius: 5px;\n}\n\n#mocha .test.pass.fast .duration {\n  display: none;\n}\n\n#mocha .test.pending {\n  color: #0b97c4;\n}\n\n#mocha .test.pending::before {\n  content: '◦';\n  color: #0b97c4;\n}\n\n#mocha .test.fail {\n  color: #c00;\n}\n\n#mocha .test.fail pre {\n  color: black;\n}\n\n#mocha .test.fail::before {\n  content: '✖';\n  font-size: 12px;\n  display: block;\n  float: left;\n  margin-right: 5px;\n  color: #c00;\n}\n\n#mocha .test pre.error {\n  color: #c00;\n  max-height: 300px;\n  overflow: auto;\n}\n\n/**\n * (1): approximate for browsers not supporting calc\n * (2): 42 = 2*15 + 2*10 + 2*1 (padding + margin + border)\n *      ^^ seriously\n */\n#mocha .test pre {\n  display: block;\n  float: left;\n  clear: left;\n  font: 12px/1.5 monaco, monospace;\n  margin: 5px;\n  padding: 15px;\n  border: 1px solid #eee;\n  max-width: 85%; /*(1)*/\n  max-width: calc(100% - 42px); /*(2)*/\n  word-wrap: break-word;\n  border-bottom-color: #ddd;\n  -webkit-border-radius: 3px;\n  -webkit-box-shadow: 0 1px 3px #eee;\n  -moz-border-radius: 3px;\n  -moz-box-shadow: 0 1px 3px #eee;\n  border-radius: 3px;\n}\n\n#mocha .test h2 {\n  position: relative;\n}\n\n#mocha .test a.replay {\n  position: absolute;\n  top: 3px;\n  right: 0;\n  text-decoration: none;\n  vertical-align: middle;\n  display: block;\n  width: 15px;\n  height: 15px;\n  line-height: 15px;\n  text-align: center;\n  background: #eee;\n  font-size: 15px;\n  -moz-border-radius: 15px;\n  border-radius: 15px;\n  -webkit-transition: opacity 200ms;\n  -moz-transition: opacity 200ms;\n  transition: opacity 200ms;\n  opacity: 0.3;\n  color: #888;\n}\n\n#mocha .test:hover a.replay {\n  opacity: 1;\n}\n\n#mocha-report.pass .test.fail {\n  display: none;\n}\n\n#mocha-report.fail .test.pass {\n  display: none;\n}\n\n#mocha-report.pending .test.pass,\n#mocha-report.pending .test.fail {\n  display: none;\n}\n#mocha-report.pending .test.pass.pending {\n  display: block;\n}\n\n#mocha-error {\n  color: #c00;\n  font-size: 1.5em;\n  font-weight: 100;\n  letter-spacing: 1px;\n}\n\n#mocha-stats {\n  position: fixed;\n  top: 15px;\n  right: 10px;\n  font-size: 12px;\n  margin: 0;\n  color: #888;\n  z-index: 1;\n}\n\n#mocha-stats .progress {\n  float: right;\n  padding-top: 0;\n}\n\n#mocha-stats em {\n  color: black;\n}\n\n#mocha-stats a {\n  text-decoration: none;\n  color: inherit;\n}\n\n#mocha-stats a:hover {\n  border-bottom: 1px solid #eee;\n}\n\n#mocha-stats li {\n  display: inline-block;\n  margin: 0 5px;\n  list-style: none;\n  padding-top: 11px;\n}\n\n#mocha-stats canvas {\n  width: 40px;\n  height: 40px;\n}\n\n#mocha code .comment { color: #ddd; }\n#mocha code .init { color: #2f6fad; }\n#mocha code .string { color: #5890ad; }\n#mocha code .keyword { color: #8a6343; }\n#mocha code .number { color: #2f6fad; }\n\n@media screen and (max-device-width: 480px) {\n  #mocha {\n    margin: 60px 0px;\n  }\n\n  #mocha #stats {\n    position: absolute;\n  }\n}\n", ""]);

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(24)(__webpack_require__(25)+"\n\n// SCRIPT-LOADER FOOTER\n//# sourceURL=script:///c:/projects/typorama/node_modules/mocha/mocha.js")

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Core.js 0.6.1
	 * https://github.com/zloirock/core-js
	 * License: http://rock.mit-license.org
	 * © 2015 Denis Pushkarev
	 */
	!function(global, framework, undefined){
	'use strict';
	
	/******************************************************************************
	 * Module : common                                                            *
	 ******************************************************************************/
	
	  // Shortcuts for [[Class]] & property names
	var OBJECT          = 'Object'
	  , FUNCTION        = 'Function'
	  , ARRAY           = 'Array'
	  , STRING          = 'String'
	  , NUMBER          = 'Number'
	  , REGEXP          = 'RegExp'
	  , DATE            = 'Date'
	  , MAP             = 'Map'
	  , SET             = 'Set'
	  , WEAKMAP         = 'WeakMap'
	  , WEAKSET         = 'WeakSet'
	  , SYMBOL          = 'Symbol'
	  , PROMISE         = 'Promise'
	  , MATH            = 'Math'
	  , ARGUMENTS       = 'Arguments'
	  , PROTOTYPE       = 'prototype'
	  , CONSTRUCTOR     = 'constructor'
	  , TO_STRING       = 'toString'
	  , TO_STRING_TAG   = TO_STRING + 'Tag'
	  , TO_LOCALE       = 'toLocaleString'
	  , HAS_OWN         = 'hasOwnProperty'
	  , FOR_EACH        = 'forEach'
	  , ITERATOR        = 'iterator'
	  , FF_ITERATOR     = '@@' + ITERATOR
	  , PROCESS         = 'process'
	  , CREATE_ELEMENT  = 'createElement'
	  // Aliases global objects and prototypes
	  , Function        = global[FUNCTION]
	  , Object          = global[OBJECT]
	  , Array           = global[ARRAY]
	  , String          = global[STRING]
	  , Number          = global[NUMBER]
	  , RegExp          = global[REGEXP]
	  , Date            = global[DATE]
	  , Map             = global[MAP]
	  , Set             = global[SET]
	  , WeakMap         = global[WEAKMAP]
	  , WeakSet         = global[WEAKSET]
	  , Symbol          = global[SYMBOL]
	  , Math            = global[MATH]
	  , TypeError       = global.TypeError
	  , RangeError      = global.RangeError
	  , setTimeout      = global.setTimeout
	  , setImmediate    = global.setImmediate
	  , clearImmediate  = global.clearImmediate
	  , parseInt        = global.parseInt
	  , isFinite        = global.isFinite
	  , process         = global[PROCESS]
	  , nextTick        = process && process.nextTick
	  , document        = global.document
	  , html            = document && document.documentElement
	  , navigator       = global.navigator
	  , define          = global.define
	  , console         = global.console || {}
	  , ArrayProto      = Array[PROTOTYPE]
	  , ObjectProto     = Object[PROTOTYPE]
	  , FunctionProto   = Function[PROTOTYPE]
	  , Infinity        = 1 / 0
	  , DOT             = '.';
	
	// http://jsperf.com/core-js-isobject
	function isObject(it){
	  return it !== null && (typeof it == 'object' || typeof it == 'function');
	}
	function isFunction(it){
	  return typeof it == 'function';
	}
	// Native function?
	var isNative = ctx(/./.test, /\[native code\]\s*\}\s*$/, 1);
	
	// Object internal [[Class]] or toStringTag
	// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
	var toString = ObjectProto[TO_STRING];
	function setToStringTag(it, tag, stat){
	  if(it && !has(it = stat ? it : it[PROTOTYPE], SYMBOL_TAG))hidden(it, SYMBOL_TAG, tag);
	}
	function cof(it){
	  return toString.call(it).slice(8, -1);
	}
	function classof(it){
	  var O, T;
	  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
	    : typeof (T = (O = Object(it))[SYMBOL_TAG]) == 'string' ? T : cof(O);
	}
	
	// Function
	var call  = FunctionProto.call
	  , apply = FunctionProto.apply
	  , REFERENCE_GET;
	// Partial apply
	function part(/* ...args */){
	  var fn     = assertFunction(this)
	    , length = arguments.length
	    , args   = Array(length)
	    , i      = 0
	    , _      = path._
	    , holder = false;
	  while(length > i)if((args[i] = arguments[i++]) === _)holder = true;
	  return function(/* ...args */){
	    var that    = this
	      , _length = arguments.length
	      , i = 0, j = 0, _args;
	    if(!holder && !_length)return invoke(fn, args, that);
	    _args = args.slice();
	    if(holder)for(;length > i; i++)if(_args[i] === _)_args[i] = arguments[j++];
	    while(_length > j)_args.push(arguments[j++]);
	    return invoke(fn, _args, that);
	  }
	}
	// Optional / simple context binding
	function ctx(fn, that, length){
	  assertFunction(fn);
	  if(~length && that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    }
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    }
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    }
	  } return function(/* ...args */){
	      return fn.apply(that, arguments);
	  }
	}
	// Fast apply
	// http://jsperf.lnkit.com/fast-apply/5
	function invoke(fn, args, that){
	  var un = that === undefined;
	  switch(args.length | 0){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
	                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
	  } return              fn.apply(that, args);
	}
	
	// Object:
	var create           = Object.create
	  , getPrototypeOf   = Object.getPrototypeOf
	  , setPrototypeOf   = Object.setPrototypeOf
	  , defineProperty   = Object.defineProperty
	  , defineProperties = Object.defineProperties
	  , getOwnDescriptor = Object.getOwnPropertyDescriptor
	  , getKeys          = Object.keys
	  , getNames         = Object.getOwnPropertyNames
	  , getSymbols       = Object.getOwnPropertySymbols
	  , isFrozen         = Object.isFrozen
	  , has              = ctx(call, ObjectProto[HAS_OWN], 2)
	  // Dummy, fix for not array-like ES3 string in es5 module
	  , ES5Object        = Object
	  , Dict;
	function toObject(it){
	  return ES5Object(assertDefined(it));
	}
	function returnIt(it){
	  return it;
	}
	function returnThis(){
	  return this;
	}
	function get(object, key){
	  if(has(object, key))return object[key];
	}
	function ownKeys(it){
	  assertObject(it);
	  return getSymbols ? getNames(it).concat(getSymbols(it)) : getNames(it);
	}
	// 19.1.2.1 Object.assign(target, source, ...)
	var assign = Object.assign || function(target, source){
	  var T = Object(assertDefined(target))
	    , l = arguments.length
	    , i = 1;
	  while(l > i){
	    var S      = ES5Object(arguments[i++])
	      , keys   = getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)T[key = keys[j++]] = S[key];
	  }
	  return T;
	}
	function keyOf(object, el){
	  var O      = toObject(object)
	    , keys   = getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	}
	
	// Array
	// array('str1,str2,str3') => ['str1', 'str2', 'str3']
	function array(it){
	  return String(it).split(',');
	}
	var push    = ArrayProto.push
	  , unshift = ArrayProto.unshift
	  , slice   = ArrayProto.slice
	  , splice  = ArrayProto.splice
	  , indexOf = ArrayProto.indexOf
	  , forEach = ArrayProto[FOR_EACH];
	/*
	 * 0 -> forEach
	 * 1 -> map
	 * 2 -> filter
	 * 3 -> some
	 * 4 -> every
	 * 5 -> find
	 * 6 -> findIndex
	 */
	function createArrayMethod(type){
	  var isMap       = type == 1
	    , isFilter    = type == 2
	    , isSome      = type == 3
	    , isEvery     = type == 4
	    , isFindIndex = type == 6
	    , noholes     = type == 5 || isFindIndex;
	  return function(callbackfn/*, that = undefined */){
	    var O      = Object(assertDefined(this))
	      , that   = arguments[1]
	      , self   = ES5Object(O)
	      , f      = ctx(callbackfn, that, 3)
	      , length = toLength(self.length)
	      , index  = 0
	      , result = isMap ? Array(length) : isFilter ? [] : undefined
	      , val, res;
	    for(;length > index; index++)if(noholes || index in self){
	      val = self[index];
	      res = f(val, index, O);
	      if(type){
	        if(isMap)result[index] = res;             // map
	        else if(res)switch(type){
	          case 3: return true;                    // some
	          case 5: return val;                     // find
	          case 6: return index;                   // findIndex
	          case 2: result.push(val);               // filter
	        } else if(isEvery)return false;           // every
	      }
	    }
	    return isFindIndex ? -1 : isSome || isEvery ? isEvery : result;
	  }
	}
	function createArrayContains(isContains){
	  return function(el /*, fromIndex = 0 */){
	    var O      = toObject(this)
	      , length = toLength(O.length)
	      , index  = toIndex(arguments[1], length);
	    if(isContains && el != el){
	      for(;length > index; index++)if(sameNaN(O[index]))return isContains || index;
	    } else for(;length > index; index++)if(isContains || index in O){
	      if(O[index] === el)return isContains || index;
	    } return !isContains && -1;
	  }
	}
	function generic(A, B){
	  // strange IE quirks mode bug -> use typeof vs isFunction
	  return typeof A == 'function' ? A : B;
	}
	
	// Math
	var MAX_SAFE_INTEGER = 0x1fffffffffffff // pow(2, 53) - 1 == 9007199254740991
	  , pow    = Math.pow
	  , abs    = Math.abs
	  , ceil   = Math.ceil
	  , floor  = Math.floor
	  , max    = Math.max
	  , min    = Math.min
	  , random = Math.random
	  , trunc  = Math.trunc || function(it){
	      return (it > 0 ? floor : ceil)(it);
	    }
	// 20.1.2.4 Number.isNaN(number)
	function sameNaN(number){
	  return number != number;
	}
	// 7.1.4 ToInteger
	function toInteger(it){
	  return isNaN(it) ? 0 : trunc(it);
	}
	// 7.1.15 ToLength
	function toLength(it){
	  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
	}
	function toIndex(index, length){
	  var index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	}
	function lz(num){
	  return num > 9 ? num : '0' + num;
	}
	
	function createReplacer(regExp, replace, isStatic){
	  var replacer = isObject(replace) ? function(part){
	    return replace[part];
	  } : replace;
	  return function(it){
	    return String(isStatic ? it : this).replace(regExp, replacer);
	  }
	}
	function createPointAt(toString){
	  return function(pos){
	    var s = String(assertDefined(this))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return toString ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? toString ? s.charAt(i) : a
	      : toString ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  }
	}
	
	// Assertion & errors
	var REDUCE_ERROR = 'Reduce of empty object with no initial value';
	function assert(condition, msg1, msg2){
	  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
	}
	function assertDefined(it){
	  if(it == undefined)throw TypeError('Function called on null or undefined');
	  return it;
	}
	function assertFunction(it){
	  assert(isFunction(it), it, ' is not a function!');
	  return it;
	}
	function assertObject(it){
	  assert(isObject(it), it, ' is not an object!');
	  return it;
	}
	function assertInstance(it, Constructor, name){
	  assert(it instanceof Constructor, name, ": use the 'new' operator!");
	}
	
	// Property descriptors & Symbol
	function descriptor(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  }
	}
	function simpleSet(object, key, value){
	  object[key] = value;
	  return object;
	}
	function createDefiner(bitmap){
	  return DESC ? function(object, key, value){
	    return defineProperty(object, key, descriptor(bitmap, value));
	  } : simpleSet;
	}
	function uid(key){
	  return SYMBOL + '(' + key + ')_' + (++sid + random())[TO_STRING](36);
	}
	function getWellKnownSymbol(name, setter){
	  return (Symbol && Symbol[name]) || (setter ? Symbol : safeSymbol)(SYMBOL + DOT + name);
	}
	// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
	var DESC = !!function(){
	      try {
	        return defineProperty({}, 'a', {get: function(){ return 2 }}).a == 2;
	      } catch(e){}
	    }()
	  , sid    = 0
	  , hidden = createDefiner(1)
	  , set    = Symbol ? simpleSet : hidden
	  , safeSymbol = Symbol || uid;
	function assignHidden(target, src){
	  for(var key in src)hidden(target, key, src[key]);
	  return target;
	}
	
	var SYMBOL_UNSCOPABLES = getWellKnownSymbol('unscopables')
	  , ArrayUnscopables   = ArrayProto[SYMBOL_UNSCOPABLES] || {}
	  , SYMBOL_TAG         = getWellKnownSymbol(TO_STRING_TAG)
	  , SYMBOL_SPECIES     = getWellKnownSymbol('species')
	  , SYMBOL_ITERATOR;
	function setSpecies(C){
	  if(DESC && (framework || !isNative(C)))defineProperty(C, SYMBOL_SPECIES, {
	    configurable: true,
	    get: returnThis
	  });
	}
	
	/******************************************************************************
	 * Module : common.export                                                     *
	 ******************************************************************************/
	
	var NODE = cof(process) == PROCESS
	  , core = {}
	  , path = framework ? global : core
	  , old  = global.core
	  , exportGlobal
	  // type bitmap
	  , FORCED = 1
	  , GLOBAL = 2
	  , STATIC = 4
	  , PROTO  = 8
	  , BIND   = 16
	  , WRAP   = 32;
	function $define(type, name, source){
	  var key, own, out, exp
	    , isGlobal = type & GLOBAL
	    , target   = isGlobal ? global : (type & STATIC)
	        ? global[name] : (global[name] || ObjectProto)[PROTOTYPE]
	    , exports  = isGlobal ? core : core[name] || (core[name] = {});
	  if(isGlobal)source = name;
	  for(key in source){
	    // there is a similar native
	    own = !(type & FORCED) && target && key in target
	      && (!isFunction(target[key]) || isNative(target[key]));
	    // export native or passed
	    out = (own ? target : source)[key];
	    // prevent global pollution for namespaces
	    if(!framework && isGlobal && !isFunction(target[key]))exp = source[key];
	    // bind timers to global for call from export context
	    else if(type & BIND && own)exp = ctx(out, global);
	    // wrap global constructors for prevent change them in library
	    else if(type & WRAP && !framework && target[key] == out){
	      exp = function(param){
	        return this instanceof out ? new out(param) : out(param);
	      }
	      exp[PROTOTYPE] = out[PROTOTYPE];
	    } else exp = type & PROTO && isFunction(out) ? ctx(call, out) : out;
	    // extend global
	    if(framework && target && !own){
	      if(isGlobal)target[key] = out;
	      else delete target[key] && hidden(target, key, out);
	    }
	    // export
	    if(exports[key] != out)hidden(exports, key, exp);
	  }
	}
	// CommonJS export
	if(typeof module != 'undefined' && module.exports)module.exports = core;
	// RequireJS export
	else if(isFunction(define) && define.amd)define(function(){return core});
	// Export to global object
	else exportGlobal = true;
	if(exportGlobal || framework){
	  core.noConflict = function(){
	    global.core = old;
	    return core;
	  }
	  global.core = core;
	}
	
	/******************************************************************************
	 * Module : common.iterators                                                  *
	 ******************************************************************************/
	
	SYMBOL_ITERATOR = getWellKnownSymbol(ITERATOR);
	var ITER  = safeSymbol('iter')
	  , KEY   = 1
	  , VALUE = 2
	  , Iterators = {}
	  , IteratorPrototype = {}
	    // Safari has byggy iterators w/o `next`
	  , BUGGY_ITERATORS = 'keys' in ArrayProto && !('next' in [].keys());
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	setIterator(IteratorPrototype, returnThis);
	function setIterator(O, value){
	  hidden(O, SYMBOL_ITERATOR, value);
	  // Add iterator for FF iterator protocol
	  FF_ITERATOR in ArrayProto && hidden(O, FF_ITERATOR, value);
	}
	function createIterator(Constructor, NAME, next, proto){
	  Constructor[PROTOTYPE] = create(proto || IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	}
	function defineIterator(Constructor, NAME, value, DEFAULT){
	  var proto = Constructor[PROTOTYPE]
	    , iter  = get(proto, SYMBOL_ITERATOR) || get(proto, FF_ITERATOR) || (DEFAULT && get(proto, DEFAULT)) || value;
	  if(framework){
	    // Define iterator
	    setIterator(proto, iter);
	    if(iter !== value){
	      var iterProto = getPrototypeOf(iter.call(new Constructor));
	      // Set @@toStringTag to native iterators
	      setToStringTag(iterProto, NAME + ' Iterator', true);
	      // FF fix
	      has(proto, FF_ITERATOR) && setIterator(iterProto, returnThis);
	    }
	  }
	  // Plug for library
	  Iterators[NAME] = iter;
	  // FF & v8 fix
	  Iterators[NAME + ' Iterator'] = returnThis;
	  return iter;
	}
	function defineStdIterators(Base, NAME, Constructor, next, DEFAULT, IS_SET){
	  function createIter(kind){
	    return function(){
	      return new Constructor(this, kind);
	    }
	  }
	  createIterator(Constructor, NAME, next);
	  var entries = createIter(KEY+VALUE)
	    , values  = createIter(VALUE);
	  if(DEFAULT == VALUE)values = defineIterator(Base, NAME, values, 'values');
	  else entries = defineIterator(Base, NAME, entries, 'entries');
	  if(DEFAULT){
	    $define(PROTO + FORCED * BUGGY_ITERATORS, NAME, {
	      entries: entries,
	      keys: IS_SET ? values : createIter(KEY),
	      values: values
	    });
	  }
	}
	function iterResult(done, value){
	  return {value: value, done: !!done};
	}
	function isIterable(it){
	  var O      = Object(it)
	    , Symbol = global[SYMBOL]
	    , hasExt = (Symbol && Symbol[ITERATOR] || FF_ITERATOR) in O;
	  return hasExt || SYMBOL_ITERATOR in O || has(Iterators, classof(O));
	}
	function getIterator(it){
	  var Symbol  = global[SYMBOL]
	    , ext     = it[Symbol && Symbol[ITERATOR] || FF_ITERATOR]
	    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[classof(it)];
	  return assertObject(getIter.call(it));
	}
	function stepCall(fn, value, entries){
	  return entries ? invoke(fn, value) : fn(value);
	}
	function checkDangerIterClosing(fn){
	  var danger = true;
	  var O = {
	    next: function(){ throw 1 },
	    'return': function(){ danger = false }
	  };
	  O[SYMBOL_ITERATOR] = returnThis;
	  try {
	    fn(O);
	  } catch(e){}
	  return danger;
	}
	function closeIterator(iterator){
	  var ret = iterator['return'];
	  if(ret !== undefined)ret.call(iterator);
	}
	function safeIterClose(exec, iterator){
	  try {
	    exec(iterator);
	  } catch(e){
	    closeIterator(iterator);
	    throw e;
	  }
	}
	function forOf(iterable, entries, fn, that){
	  safeIterClose(function(iterator){
	    var f = ctx(fn, that, entries ? 2 : 1)
	      , step;
	    while(!(step = iterator.next()).done)if(stepCall(f, step.value, entries) === false){
	      return closeIterator(iterator);
	    }
	  }, getIterator(iterable));
	}
	
	/******************************************************************************
	 * Module : es6.symbol                                                        *
	 ******************************************************************************/
	
	// ECMAScript 6 symbols shim
	!function(TAG, SymbolRegistry, AllSymbols, setter){
	  // 19.4.1.1 Symbol([description])
	  if(!isNative(Symbol)){
	    Symbol = function(description){
	      assert(!(this instanceof Symbol), SYMBOL + ' is not a ' + CONSTRUCTOR);
	      var tag = uid(description)
	        , sym = set(create(Symbol[PROTOTYPE]), TAG, tag);
	      AllSymbols[tag] = sym;
	      DESC && setter && defineProperty(ObjectProto, tag, {
	        configurable: true,
	        set: function(value){
	          hidden(this, tag, value);
	        }
	      });
	      return sym;
	    }
	    hidden(Symbol[PROTOTYPE], TO_STRING, function(){
	      return this[TAG];
	    });
	  }
	  $define(GLOBAL + WRAP, {Symbol: Symbol});
	  
	  var symbolStatics = {
	    // 19.4.2.1 Symbol.for(key)
	    'for': function(key){
	      return has(SymbolRegistry, key += '')
	        ? SymbolRegistry[key]
	        : SymbolRegistry[key] = Symbol(key);
	    },
	    // 19.4.2.4 Symbol.iterator
	    iterator: SYMBOL_ITERATOR || getWellKnownSymbol(ITERATOR),
	    // 19.4.2.5 Symbol.keyFor(sym)
	    keyFor: part.call(keyOf, SymbolRegistry),
	    // 19.4.2.10 Symbol.species
	    species: SYMBOL_SPECIES,
	    // 19.4.2.13 Symbol.toStringTag
	    toStringTag: SYMBOL_TAG = getWellKnownSymbol(TO_STRING_TAG, true),
	    // 19.4.2.14 Symbol.unscopables
	    unscopables: SYMBOL_UNSCOPABLES,
	    pure: safeSymbol,
	    set: set,
	    useSetter: function(){setter = true},
	    useSimple: function(){setter = false}
	  };
	  // 19.4.2.2 Symbol.hasInstance
	  // 19.4.2.3 Symbol.isConcatSpreadable
	  // 19.4.2.6 Symbol.match
	  // 19.4.2.8 Symbol.replace
	  // 19.4.2.9 Symbol.search
	  // 19.4.2.11 Symbol.split
	  // 19.4.2.12 Symbol.toPrimitive
	  forEach.call(array('hasInstance,isConcatSpreadable,match,replace,search,split,toPrimitive'),
	    function(it){
	      symbolStatics[it] = getWellKnownSymbol(it);
	    }
	  );
	  $define(STATIC, SYMBOL, symbolStatics);
	  
	  setToStringTag(Symbol, SYMBOL);
	  
	  $define(STATIC + FORCED * !isNative(Symbol), OBJECT, {
	    // 19.1.2.7 Object.getOwnPropertyNames(O)
	    getOwnPropertyNames: function(it){
	      var names = getNames(toObject(it)), result = [], key, i = 0;
	      while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
	      return result;
	    },
	    // 19.1.2.8 Object.getOwnPropertySymbols(O)
	    getOwnPropertySymbols: function(it){
	      var names = getNames(toObject(it)), result = [], key, i = 0;
	      while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
	      return result;
	    }
	  });
	  
	  // 20.2.1.9 Math[@@toStringTag]
	  setToStringTag(Math, MATH, true);
	  // 24.3.3 JSON[@@toStringTag]
	  setToStringTag(global.JSON, 'JSON', true);
	}(safeSymbol('tag'), {}, {}, true);
	
	/******************************************************************************
	 * Module : es6.object.statics                                                *
	 ******************************************************************************/
	
	!function(){
	  var objectStatic = {
	    // 19.1.3.1 Object.assign(target, source)
	    assign: assign,
	    // 19.1.3.10 Object.is(value1, value2)
	    is: function(x, y){
	      return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
	    }
	  };
	  // 19.1.3.19 Object.setPrototypeOf(O, proto)
	  // Works with __proto__ only. Old v8 can't works with null proto objects.
	  '__proto__' in ObjectProto && function(buggy, set){
	    try {
	      set = ctx(call, getOwnDescriptor(ObjectProto, '__proto__').set, 2);
	      set({}, ArrayProto);
	    } catch(e){ buggy = true }
	    objectStatic.setPrototypeOf = setPrototypeOf = setPrototypeOf || function(O, proto){
	      assertObject(O);
	      assert(proto === null || isObject(proto), proto, ": can't set as prototype!");
	      if(buggy)O.__proto__ = proto;
	      else set(O, proto);
	      return O;
	    }
	  }();
	  $define(STATIC, OBJECT, objectStatic);
	}();
	
	/******************************************************************************
	 * Module : es6.object.statics-accept-primitives                              *
	 ******************************************************************************/
	
	!function(){
	  // Object static methods accept primitives
	  function wrapObjectMethod(key, MODE){
	    var fn  = Object[key]
	      , exp = core[OBJECT][key]
	      , f   = 0
	      , o   = {};
	    if(!exp || isNative(exp)){
	      o[key] = MODE == 1 ? function(it){
	        return isObject(it) ? fn(it) : it;
	      } : MODE == 2 ? function(it){
	        return isObject(it) ? fn(it) : true;
	      } : MODE == 3 ? function(it){
	        return isObject(it) ? fn(it) : false;
	      } : MODE == 4 ? function(it, key){
	        return fn(toObject(it), key);
	      } : function(it){
	        return fn(toObject(it));
	      };
	      try { fn(DOT) }
	      catch(e){ f = 1 }
	      $define(STATIC + FORCED * f, OBJECT, o);
	    }
	  }
	  wrapObjectMethod('freeze', 1);
	  wrapObjectMethod('seal', 1);
	  wrapObjectMethod('preventExtensions', 1);
	  wrapObjectMethod('isFrozen', 2);
	  wrapObjectMethod('isSealed', 2);
	  wrapObjectMethod('isExtensible', 3);
	  wrapObjectMethod('getOwnPropertyDescriptor', 4);
	  wrapObjectMethod('getPrototypeOf');
	  wrapObjectMethod('keys');
	  wrapObjectMethod('getOwnPropertyNames');
	}();
	
	/******************************************************************************
	 * Module : es6.number.statics                                                *
	 ******************************************************************************/
	
	!function(isInteger){
	  $define(STATIC, NUMBER, {
	    // 20.1.2.1 Number.EPSILON
	    EPSILON: pow(2, -52),
	    // 20.1.2.2 Number.isFinite(number)
	    isFinite: function(it){
	      return typeof it == 'number' && isFinite(it);
	    },
	    // 20.1.2.3 Number.isInteger(number)
	    isInteger: isInteger,
	    // 20.1.2.4 Number.isNaN(number)
	    isNaN: sameNaN,
	    // 20.1.2.5 Number.isSafeInteger(number)
	    isSafeInteger: function(number){
	      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
	    },
	    // 20.1.2.6 Number.MAX_SAFE_INTEGER
	    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
	    // 20.1.2.10 Number.MIN_SAFE_INTEGER
	    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
	    // 20.1.2.12 Number.parseFloat(string)
	    parseFloat: parseFloat,
	    // 20.1.2.13 Number.parseInt(string, radix)
	    parseInt: parseInt
	  });
	// 20.1.2.3 Number.isInteger(number)
	}(Number.isInteger || function(it){
	  return !isObject(it) && isFinite(it) && floor(it) === it;
	});
	
	/******************************************************************************
	 * Module : es6.math                                                          *
	 ******************************************************************************/
	
	// ECMAScript 6 shim
	!function(){
	  // 20.2.2.28 Math.sign(x)
	  var E    = Math.E
	    , exp  = Math.exp
	    , log  = Math.log
	    , sqrt = Math.sqrt
	    , sign = Math.sign || function(x){
	        return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
	      };
	  
	  // 20.2.2.5 Math.asinh(x)
	  function asinh(x){
	    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
	  }
	  // 20.2.2.14 Math.expm1(x)
	  function expm1(x){
	    return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
	  }
	    
	  $define(STATIC, MATH, {
	    // 20.2.2.3 Math.acosh(x)
	    acosh: function(x){
	      return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
	    },
	    // 20.2.2.5 Math.asinh(x)
	    asinh: asinh,
	    // 20.2.2.7 Math.atanh(x)
	    atanh: function(x){
	      return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
	    },
	    // 20.2.2.9 Math.cbrt(x)
	    cbrt: function(x){
	      return sign(x = +x) * pow(abs(x), 1 / 3);
	    },
	    // 20.2.2.11 Math.clz32(x)
	    clz32: function(x){
	      return (x >>>= 0) ? 32 - x[TO_STRING](2).length : 32;
	    },
	    // 20.2.2.12 Math.cosh(x)
	    cosh: function(x){
	      return (exp(x = +x) + exp(-x)) / 2;
	    },
	    // 20.2.2.14 Math.expm1(x)
	    expm1: expm1,
	    // 20.2.2.16 Math.fround(x)
	    // TODO: fallback for IE9-
	    fround: function(x){
	      return new Float32Array([x])[0];
	    },
	    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
	    hypot: function(value1, value2){
	      var sum  = 0
	        , len1 = arguments.length
	        , len2 = len1
	        , args = Array(len1)
	        , larg = -Infinity
	        , arg;
	      while(len1--){
	        arg = args[len1] = +arguments[len1];
	        if(arg == Infinity || arg == -Infinity)return Infinity;
	        if(arg > larg)larg = arg;
	      }
	      larg = arg || 1;
	      while(len2--)sum += pow(args[len2] / larg, 2);
	      return larg * sqrt(sum);
	    },
	    // 20.2.2.18 Math.imul(x, y)
	    imul: function(x, y){
	      var UInt16 = 0xffff
	        , xn = +x
	        , yn = +y
	        , xl = UInt16 & xn
	        , yl = UInt16 & yn;
	      return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
	    },
	    // 20.2.2.20 Math.log1p(x)
	    log1p: function(x){
	      return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
	    },
	    // 20.2.2.21 Math.log10(x)
	    log10: function(x){
	      return log(x) / Math.LN10;
	    },
	    // 20.2.2.22 Math.log2(x)
	    log2: function(x){
	      return log(x) / Math.LN2;
	    },
	    // 20.2.2.28 Math.sign(x)
	    sign: sign,
	    // 20.2.2.30 Math.sinh(x)
	    sinh: function(x){
	      return (abs(x = +x) < 1) ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
	    },
	    // 20.2.2.33 Math.tanh(x)
	    tanh: function(x){
	      var a = expm1(x = +x)
	        , b = expm1(-x);
	      return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
	    },
	    // 20.2.2.34 Math.trunc(x)
	    trunc: trunc
	  });
	}();
	
	/******************************************************************************
	 * Module : es6.string                                                        *
	 ******************************************************************************/
	
	!function(fromCharCode){
	  function assertNotRegExp(it){
	    if(cof(it) == REGEXP)throw TypeError();
	  }
	  
	  $define(STATIC, STRING, {
	    // 21.1.2.2 String.fromCodePoint(...codePoints)
	    fromCodePoint: function(x){
	      var res = []
	        , len = arguments.length
	        , i   = 0
	        , code
	      while(len > i){
	        code = +arguments[i++];
	        if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
	        res.push(code < 0x10000
	          ? fromCharCode(code)
	          : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
	        );
	      } return res.join('');
	    },
	    // 21.1.2.4 String.raw(callSite, ...substitutions)
	    raw: function(callSite){
	      var raw = toObject(callSite.raw)
	        , len = toLength(raw.length)
	        , sln = arguments.length
	        , res = []
	        , i   = 0;
	      while(len > i){
	        res.push(String(raw[i++]));
	        if(i < sln)res.push(String(arguments[i]));
	      } return res.join('');
	    }
	  });
	  
	  $define(PROTO, STRING, {
	    // 21.1.3.3 String.prototype.codePointAt(pos)
	    codePointAt: createPointAt(false),
	    // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
	    endsWith: function(searchString /*, endPosition = @length */){
	      assertNotRegExp(searchString);
	      var that = String(assertDefined(this))
	        , endPosition = arguments[1]
	        , len = toLength(that.length)
	        , end = endPosition === undefined ? len : min(toLength(endPosition), len);
	      searchString += '';
	      return that.slice(end - searchString.length, end) === searchString;
	    },
	    // 21.1.3.7 String.prototype.includes(searchString, position = 0)
	    includes: function(searchString /*, position = 0 */){
	      assertNotRegExp(searchString);
	      return !!~String(assertDefined(this)).indexOf(searchString, arguments[1]);
	    },
	    // 21.1.3.13 String.prototype.repeat(count)
	    repeat: function(count){
	      var str = String(assertDefined(this))
	        , res = ''
	        , n   = toInteger(count);
	      if(0 > n || n == Infinity)throw RangeError("Count can't be negative");
	      for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
	      return res;
	    },
	    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
	    startsWith: function(searchString /*, position = 0 */){
	      assertNotRegExp(searchString);
	      var that  = String(assertDefined(this))
	        , index = toLength(min(arguments[1], that.length));
	      searchString += '';
	      return that.slice(index, index + searchString.length) === searchString;
	    }
	  });
	}(String.fromCharCode);
	
	/******************************************************************************
	 * Module : es6.array.statics                                                 *
	 ******************************************************************************/
	
	!function(){
	  $define(STATIC + FORCED * checkDangerIterClosing(Array.from), ARRAY, {
	    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	    from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	      var O       = Object(assertDefined(arrayLike))
	        , mapfn   = arguments[1]
	        , mapping = mapfn !== undefined
	        , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
	        , index   = 0
	        , length, result, step;
	      if(isIterable(O)){
	        result = new (generic(this, Array));
	        safeIterClose(function(iterator){
	          for(; !(step = iterator.next()).done; index++){
	            result[index] = mapping ? f(step.value, index) : step.value;
	          }
	        }, getIterator(O));
	      } else {
	        result = new (generic(this, Array))(length = toLength(O.length));
	        for(; length > index; index++){
	          result[index] = mapping ? f(O[index], index) : O[index];
	        }
	      }
	      result.length = index;
	      return result;
	    }
	  });
	  
	  $define(STATIC, ARRAY, {
	    // 22.1.2.3 Array.of( ...items)
	    of: function(/* ...args */){
	      var index  = 0
	        , length = arguments.length
	        , result = new (generic(this, Array))(length);
	      while(length > index)result[index] = arguments[index++];
	      result.length = length;
	      return result;
	    }
	  });
	  
	  setSpecies(Array);
	}();
	
	/******************************************************************************
	 * Module : es6.array.prototype                                               *
	 ******************************************************************************/
	
	!function(){
	  $define(PROTO, ARRAY, {
	    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
	    copyWithin: function(target /* = 0 */, start /* = 0, end = @length */){
	      var O     = Object(assertDefined(this))
	        , len   = toLength(O.length)
	        , to    = toIndex(target, len)
	        , from  = toIndex(start, len)
	        , end   = arguments[2]
	        , fin   = end === undefined ? len : toIndex(end, len)
	        , count = min(fin - from, len - to)
	        , inc   = 1;
	      if(from < to && to < from + count){
	        inc  = -1;
	        from = from + count - 1;
	        to   = to + count - 1;
	      }
	      while(count-- > 0){
	        if(from in O)O[to] = O[from];
	        else delete O[to];
	        to += inc;
	        from += inc;
	      } return O;
	    },
	    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
	    fill: function(value /*, start = 0, end = @length */){
	      var O      = Object(assertDefined(this))
	        , length = toLength(O.length)
	        , index  = toIndex(arguments[1], length)
	        , end    = arguments[2]
	        , endPos = end === undefined ? length : toIndex(end, length);
	      while(endPos > index)O[index++] = value;
	      return O;
	    },
	    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
	    find: createArrayMethod(5),
	    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
	    findIndex: createArrayMethod(6)
	  });
	  
	  if(framework){
	    // 22.1.3.31 Array.prototype[@@unscopables]
	    forEach.call(array('find,findIndex,fill,copyWithin,entries,keys,values'), function(it){
	      ArrayUnscopables[it] = true;
	    });
	    SYMBOL_UNSCOPABLES in ArrayProto || hidden(ArrayProto, SYMBOL_UNSCOPABLES, ArrayUnscopables);
	  }
	}();
	
	/******************************************************************************
	 * Module : es6.iterators                                                     *
	 ******************************************************************************/
	
	!function(at){
	  // 22.1.3.4 Array.prototype.entries()
	  // 22.1.3.13 Array.prototype.keys()
	  // 22.1.3.29 Array.prototype.values()
	  // 22.1.3.30 Array.prototype[@@iterator]()
	  defineStdIterators(Array, ARRAY, function(iterated, kind){
	    set(this, ITER, {o: toObject(iterated), i: 0, k: kind});
	  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	  }, function(){
	    var iter  = this[ITER]
	      , O     = iter.o
	      , kind  = iter.k
	      , index = iter.i++;
	    if(!O || index >= O.length){
	      iter.o = undefined;
	      return iterResult(1);
	    }
	    if(kind == KEY)  return iterResult(0, index);
	    if(kind == VALUE)return iterResult(0, O[index]);
	                     return iterResult(0, [index, O[index]]);
	  }, VALUE);
	  
	  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	  Iterators[ARGUMENTS] = Iterators[ARRAY];
	  
	  // 21.1.3.27 String.prototype[@@iterator]()
	  defineStdIterators(String, STRING, function(iterated){
	    set(this, ITER, {o: String(iterated), i: 0});
	  // 21.1.5.2.1 %StringIteratorPrototype%.next()
	  }, function(){
	    var iter  = this[ITER]
	      , O     = iter.o
	      , index = iter.i
	      , point;
	    if(index >= O.length)return iterResult(1);
	    point = at.call(O, index);
	    iter.i += point.length;
	    return iterResult(0, point);
	  });
	}(createPointAt(true));
	
	/******************************************************************************
	 * Module : web.immediate                                                     *
	 ******************************************************************************/
	
	// setImmediate shim
	// Node.js 0.9+ & IE10+ has setImmediate, else:
	isFunction(setImmediate) && isFunction(clearImmediate) || function(ONREADYSTATECHANGE){
	  var postMessage      = global.postMessage
	    , addEventListener = global.addEventListener
	    , MessageChannel   = global.MessageChannel
	    , counter          = 0
	    , queue            = {}
	    , defer, channel, port;
	  setImmediate = function(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(isFunction(fn) ? fn : Function(fn), args);
	    }
	    defer(counter);
	    return counter;
	  }
	  clearImmediate = function(id){
	    delete queue[id];
	  }
	  function run(id){
	    if(has(queue, id)){
	      var fn = queue[id];
	      delete queue[id];
	      fn();
	    }
	  }
	  function listner(event){
	    run(event.data);
	  }
	  // Node.js 0.8-
	  if(NODE){
	    defer = function(id){
	      nextTick(part.call(run, id));
	    }
	  // Modern browsers, skip implementation for WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is object
	  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
	    defer = function(id){
	      postMessage(id, '*');
	    }
	    addEventListener('message', listner, false);
	  // WebWorkers
	  } else if(isFunction(MessageChannel)){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listner;
	    defer = ctx(port.postMessage, port, 1);
	  // IE8-
	  } else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]('script')){
	    defer = function(id){
	      html.appendChild(document[CREATE_ELEMENT]('script'))[ONREADYSTATECHANGE] = function(){
	        html.removeChild(this);
	        run(id);
	      }
	    }
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(run, 0, id);
	    }
	  }
	}('onreadystatechange');
	$define(GLOBAL + BIND, {
	  setImmediate:   setImmediate,
	  clearImmediate: clearImmediate
	});
	
	/******************************************************************************
	 * Module : es6.promise                                                       *
	 ******************************************************************************/
	
	// ES6 promises shim
	// Based on https://github.com/getify/native-promise-only/
	!function(Promise, test){
	  isFunction(Promise) && isFunction(Promise.resolve)
	  && Promise.resolve(test = new Promise(function(){})) == test
	  || function(asap, RECORD){
	    function isThenable(it){
	      var then;
	      if(isObject(it))then = it.then;
	      return isFunction(then) ? then : false;
	    }
	    function handledRejectionOrHasOnRejected(promise){
	      var record = promise[RECORD]
	        , chain  = record.c
	        , i      = 0
	        , react;
	      if(record.h)return true;
	      while(chain.length > i){
	        react = chain[i++];
	        if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
	      }
	    }
	    function notify(record, reject){
	      var chain = record.c;
	      if(reject || chain.length)asap(function(){
	        var promise = record.p
	          , value   = record.v
	          , ok      = record.s == 1
	          , i       = 0;
	        if(reject && !handledRejectionOrHasOnRejected(promise)){
	          setTimeout(function(){
	            if(!handledRejectionOrHasOnRejected(promise)){
	              if(NODE){
	                if(!process.emit('unhandledRejection', value, promise)){
	                  // default node.js behavior
	                }
	              } else if(isFunction(console.error)){
	                console.error('Unhandled promise rejection', value);
	              }
	            }
	          }, 1e3);
	        } else while(chain.length > i)!function(react){
	          var cb = ok ? react.ok : react.fail
	            , ret, then;
	          try {
	            if(cb){
	              if(!ok)record.h = true;
	              ret = cb === true ? value : cb(value);
	              if(ret === react.P){
	                react.rej(TypeError(PROMISE + '-chain cycle'));
	              } else if(then = isThenable(ret)){
	                then.call(ret, react.res, react.rej);
	              } else react.res(ret);
	            } else react.rej(value);
	          } catch(err){
	            react.rej(err);
	          }
	        }(chain[i++]);
	        chain.length = 0;
	      });
	    }
	    function resolve(value){
	      var record = this
	        , then, wrapper;
	      if(record.d)return;
	      record.d = true;
	      record = record.r || record; // unwrap
	      try {
	        if(then = isThenable(value)){
	          wrapper = {r: record, d: false}; // wrap
	          then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
	        } else {
	          record.v = value;
	          record.s = 1;
	          notify(record);
	        }
	      } catch(err){
	        reject.call(wrapper || {r: record, d: false}, err); // wrap
	      }
	    }
	    function reject(value){
	      var record = this;
	      if(record.d)return;
	      record.d = true;
	      record = record.r || record; // unwrap
	      record.v = value;
	      record.s = 2;
	      notify(record, true);
	    }
	    function getConstructor(C){
	      var S = assertObject(C)[SYMBOL_SPECIES];
	      return S != undefined ? S : C;
	    }
	    // 25.4.3.1 Promise(executor)
	    Promise = function(executor){
	      assertFunction(executor);
	      assertInstance(this, Promise, PROMISE);
	      var record = {
	        p: this,      // promise
	        c: [],        // chain
	        s: 0,         // state
	        d: false,     // done
	        v: undefined, // value
	        h: false      // handled rejection
	      };
	      hidden(this, RECORD, record);
	      try {
	        executor(ctx(resolve, record, 1), ctx(reject, record, 1));
	      } catch(err){
	        reject.call(record, err);
	      }
	    }
	    assignHidden(Promise[PROTOTYPE], {
	      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	      then: function(onFulfilled, onRejected){
	        var S = assertObject(assertObject(this)[CONSTRUCTOR])[SYMBOL_SPECIES];
	        var react = {
	          ok:   isFunction(onFulfilled) ? onFulfilled : true,
	          fail: isFunction(onRejected)  ? onRejected  : false
	        } , P = react.P = new (S != undefined ? S : Promise)(function(resolve, reject){
	          react.res = assertFunction(resolve);
	          react.rej = assertFunction(reject);
	        }), record = this[RECORD];
	        record.c.push(react);
	        record.s && notify(record);
	        return P;
	      },
	      // 25.4.5.1 Promise.prototype.catch(onRejected)
	      'catch': function(onRejected){
	        return this.then(undefined, onRejected);
	      }
	    });
	    assignHidden(Promise, {
	      // 25.4.4.1 Promise.all(iterable)
	      all: function(iterable){
	        var Promise = getConstructor(this)
	          , values  = [];
	        return new Promise(function(resolve, reject){
	          forOf(iterable, false, push, values);
	          var remaining = values.length
	            , results   = Array(remaining);
	          if(remaining)forEach.call(values, function(promise, index){
	            Promise.resolve(promise).then(function(value){
	              results[index] = value;
	              --remaining || resolve(results);
	            }, reject);
	          });
	          else resolve(results);
	        });
	      },
	      // 25.4.4.4 Promise.race(iterable)
	      race: function(iterable){
	        var Promise = getConstructor(this);
	        return new Promise(function(resolve, reject){
	          forOf(iterable, false, function(promise){
	            Promise.resolve(promise).then(resolve, reject);
	          });
	        });
	      },
	      // 25.4.4.5 Promise.reject(r)
	      reject: function(r){
	        return new (getConstructor(this))(function(resolve, reject){
	          reject(r);
	        });
	      },
	      // 25.4.4.6 Promise.resolve(x)
	      resolve: function(x){
	        return isObject(x) && RECORD in x && getPrototypeOf(x) === this[PROTOTYPE]
	          ? x : new (getConstructor(this))(function(resolve, reject){
	            resolve(x);
	          });
	      }
	    });
	  }(nextTick || setImmediate, safeSymbol('record'));
	  setToStringTag(Promise, PROMISE);
	  setSpecies(Promise);
	  $define(GLOBAL + FORCED * !isNative(Promise), {Promise: Promise});
	}(global[PROMISE]);
	
	/******************************************************************************
	 * Module : es6.collections                                                   *
	 ******************************************************************************/
	
	// ECMAScript 6 collections shim
	!function(){
	  var UID   = safeSymbol('uid')
	    , O1    = safeSymbol('O1')
	    , WEAK  = safeSymbol('weak')
	    , LEAK  = safeSymbol('leak')
	    , LAST  = safeSymbol('last')
	    , FIRST = safeSymbol('first')
	    , SIZE  = DESC ? safeSymbol('size') : 'size'
	    , uid   = 0
	    , tmp   = {};
	  
	  function getCollection(C, NAME, methods, commonMethods, isMap, isWeak){
	    var ADDER = isMap ? 'set' : 'add'
	      , proto = C && C[PROTOTYPE]
	      , O     = {};
	    function initFromIterable(that, iterable){
	      if(iterable != undefined)forOf(iterable, isMap, that[ADDER], that);
	      return that;
	    }
	    function fixSVZ(key, chain){
	      var method = proto[key];
	      if(framework)proto[key] = function(a, b){
	        var result = method.call(this, a === 0 ? 0 : a, b);
	        return chain ? this : result;
	      };
	    }
	    if(!isNative(C) || !(isWeak || (!BUGGY_ITERATORS && has(proto, FOR_EACH) && has(proto, 'entries')))){
	      // create collection constructor
	      C = isWeak
	        ? function(iterable){
	            assertInstance(this, C, NAME);
	            set(this, UID, uid++);
	            initFromIterable(this, iterable);
	          }
	        : function(iterable){
	            var that = this;
	            assertInstance(that, C, NAME);
	            set(that, O1, create(null));
	            set(that, SIZE, 0);
	            set(that, LAST, undefined);
	            set(that, FIRST, undefined);
	            initFromIterable(that, iterable);
	          };
	      assignHidden(assignHidden(C[PROTOTYPE], methods), commonMethods);
	      isWeak || !DESC || defineProperty(C[PROTOTYPE], 'size', {get: function(){
	        return assertDefined(this[SIZE]);
	      }});
	    } else {
	      var Native = C
	        , inst   = new C
	        , chain  = inst[ADDER](isWeak ? {} : -0, 1)
	        , buggyZero;
	      // wrap to init collections from iterable
	      if(checkDangerIterClosing(function(O){ new C(O) })){
	        C = function(iterable){
	          assertInstance(this, C, NAME);
	          return initFromIterable(new Native, iterable);
	        }
	        C[PROTOTYPE] = proto;
	        if(framework)proto[CONSTRUCTOR] = C;
	      }
	      isWeak || inst[FOR_EACH](function(val, key){
	        buggyZero = 1 / key === -Infinity;
	      });
	      // fix converting -0 key to +0
	      if(buggyZero){
	        fixSVZ('delete');
	        fixSVZ('has');
	        isMap && fixSVZ('get');
	      }
	      // + fix .add & .set for chaining
	      if(buggyZero || chain !== inst)fixSVZ(ADDER, true);
	    }
	    setToStringTag(C, NAME);
	    setSpecies(C);
	    
	    O[NAME] = C;
	    $define(GLOBAL + WRAP + FORCED * !isNative(C), O);
	    
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    isWeak || defineStdIterators(C, NAME, function(iterated, kind){
	      set(this, ITER, {o: iterated, k: kind});
	    }, function(){
	      var iter  = this[ITER]
	        , kind  = iter.k
	        , entry = iter.l;
	      // revert to the last existing entry
	      while(entry && entry.r)entry = entry.p;
	      // get next entry
	      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
	        // or finish the iteration
	        iter.o = undefined;
	        return iterResult(1);
	      }
	      // return step by kind
	      if(kind == KEY)  return iterResult(0, entry.k);
	      if(kind == VALUE)return iterResult(0, entry.v);
	                       return iterResult(0, [entry.k, entry.v]);   
	    }, isMap ? KEY+VALUE : VALUE, !isMap);
	    
	    return C;
	  }
	  
	  function fastKey(it, create){
	    // return primitive with prefix
	    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
	    // can't set id to frozen object
	    if(isFrozen(it))return 'F';
	    if(!has(it, UID)){
	      // not necessary to add id
	      if(!create)return 'E';
	      // add missing object id
	      hidden(it, UID, ++uid);
	    // return object id with prefix
	    } return 'O' + it[UID];
	  }
	  function getEntry(that, key){
	    // fast case
	    var index = fastKey(key), entry;
	    if(index != 'F')return that[O1][index];
	    // frozen object case
	    for(entry = that[FIRST]; entry; entry = entry.n){
	      if(entry.k == key)return entry;
	    }
	  }
	  function def(that, key, value){
	    var entry = getEntry(that, key)
	      , prev, index;
	    // change existing entry
	    if(entry)entry.v = value;
	    // create new entry
	    else {
	      that[LAST] = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that[LAST],          // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if(!that[FIRST])that[FIRST] = entry;
	      if(prev)prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if(index != 'F')that[O1][index] = entry;
	    } return that;
	  }
	
	  var collectionMethods = {
	    // 23.1.3.1 Map.prototype.clear()
	    // 23.2.3.2 Set.prototype.clear()
	    clear: function(){
	      for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
	        entry.r = true;
	        if(entry.p)entry.p = entry.p.n = undefined;
	        delete data[entry.i];
	      }
	      that[FIRST] = that[LAST] = undefined;
	      that[SIZE] = 0;
	    },
	    // 23.1.3.3 Map.prototype.delete(key)
	    // 23.2.3.4 Set.prototype.delete(value)
	    'delete': function(key){
	      var that  = this
	        , entry = getEntry(that, key);
	      if(entry){
	        var next = entry.n
	          , prev = entry.p;
	        delete that[O1][entry.i];
	        entry.r = true;
	        if(prev)prev.n = next;
	        if(next)next.p = prev;
	        if(that[FIRST] == entry)that[FIRST] = next;
	        if(that[LAST] == entry)that[LAST] = prev;
	        that[SIZE]--;
	      } return !!entry;
	    },
	    // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	    // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	    forEach: function(callbackfn /*, that = undefined */){
	      var f = ctx(callbackfn, arguments[1], 3)
	        , entry;
	      while(entry = entry ? entry.n : this[FIRST]){
	        f(entry.v, entry.k, this);
	        // revert to the last existing entry
	        while(entry && entry.r)entry = entry.p;
	      }
	    },
	    // 23.1.3.7 Map.prototype.has(key)
	    // 23.2.3.7 Set.prototype.has(value)
	    has: function(key){
	      return !!getEntry(this, key);
	    }
	  }
	  
	  // 23.1 Map Objects
	  Map = getCollection(Map, MAP, {
	    // 23.1.3.6 Map.prototype.get(key)
	    get: function(key){
	      var entry = getEntry(this, key);
	      return entry && entry.v;
	    },
	    // 23.1.3.9 Map.prototype.set(key, value)
	    set: function(key, value){
	      return def(this, key === 0 ? 0 : key, value);
	    }
	  }, collectionMethods, true);
	  
	  // 23.2 Set Objects
	  Set = getCollection(Set, SET, {
	    // 23.2.3.1 Set.prototype.add(value)
	    add: function(value){
	      return def(this, value = value === 0 ? 0 : value, value);
	    }
	  }, collectionMethods);
	  
	  function defWeak(that, key, value){
	    if(isFrozen(assertObject(key)))leakStore(that).set(key, value);
	    else {
	      has(key, WEAK) || hidden(key, WEAK, {});
	      key[WEAK][that[UID]] = value;
	    } return that;
	  }
	  function leakStore(that){
	    return that[LEAK] || hidden(that, LEAK, new Map)[LEAK];
	  }
	  
	  var weakMethods = {
	    // 23.3.3.2 WeakMap.prototype.delete(key)
	    // 23.4.3.3 WeakSet.prototype.delete(value)
	    'delete': function(key){
	      if(!isObject(key))return false;
	      if(isFrozen(key))return leakStore(this)['delete'](key);
	      return has(key, WEAK) && has(key[WEAK], this[UID]) && delete key[WEAK][this[UID]];
	    },
	    // 23.3.3.4 WeakMap.prototype.has(key)
	    // 23.4.3.4 WeakSet.prototype.has(value)
	    has: function(key){
	      if(!isObject(key))return false;
	      if(isFrozen(key))return leakStore(this).has(key);
	      return has(key, WEAK) && has(key[WEAK], this[UID]);
	    }
	  };
	  
	  // 23.3 WeakMap Objects
	  WeakMap = getCollection(WeakMap, WEAKMAP, {
	    // 23.3.3.3 WeakMap.prototype.get(key)
	    get: function(key){
	      if(isObject(key)){
	        if(isFrozen(key))return leakStore(this).get(key);
	        if(has(key, WEAK))return key[WEAK][this[UID]];
	      }
	    },
	    // 23.3.3.5 WeakMap.prototype.set(key, value)
	    set: function(key, value){
	      return defWeak(this, key, value);
	    }
	  }, weakMethods, true, true);
	  
	  // IE11 WeakMap frozen keys fix
	  if(framework && new WeakMap().set(Object.freeze(tmp), 7).get(tmp) != 7){
	    forEach.call(array('delete,has,get,set'), function(key){
	      var method = WeakMap[PROTOTYPE][key];
	      WeakMap[PROTOTYPE][key] = function(a, b){
	        // store frozen objects on leaky map
	        if(isObject(a) && isFrozen(a)){
	          var result = leakStore(this)[key](a, b);
	          return key == 'set' ? this : result;
	        // store all the rest on native weakmap
	        } return method.call(this, a, b);
	      };
	    });
	  }
	  
	  // 23.4 WeakSet Objects
	  WeakSet = getCollection(WeakSet, WEAKSET, {
	    // 23.4.3.1 WeakSet.prototype.add(value)
	    add: function(value){
	      return defWeak(this, value, true);
	    }
	  }, weakMethods, false, true);
	}();
	
	/******************************************************************************
	 * Module : es6.reflect                                                       *
	 ******************************************************************************/
	
	!function(){
	  function Enumerate(iterated){
	    var keys = [], key;
	    for(key in iterated)keys.push(key);
	    set(this, ITER, {o: iterated, a: keys, i: 0});
	  }
	  createIterator(Enumerate, OBJECT, function(){
	    var iter = this[ITER]
	      , keys = iter.a
	      , key;
	    do {
	      if(iter.i >= keys.length)return iterResult(1);
	    } while(!((key = keys[iter.i++]) in iter.o));
	    return iterResult(0, key);
	  });
	  
	  function wrap(fn){
	    return function(it){
	      assertObject(it);
	      try {
	        return fn.apply(undefined, arguments), true;
	      } catch(e){
	        return false;
	      }
	    }
	  }
	  
	  function reflectGet(target, propertyKey/*, receiver*/){
	    var receiver = arguments.length < 3 ? target : arguments[2]
	      , desc = getOwnDescriptor(assertObject(target), propertyKey), proto;
	    if(desc)return has(desc, 'value')
	      ? desc.value
	      : desc.get === undefined
	        ? undefined
	        : desc.get.call(receiver);
	    return isObject(proto = getPrototypeOf(target))
	      ? reflectGet(proto, propertyKey, receiver)
	      : undefined;
	  }
	  function reflectSet(target, propertyKey, V/*, receiver*/){
	    var receiver = arguments.length < 4 ? target : arguments[3]
	      , ownDesc  = getOwnDescriptor(assertObject(target), propertyKey)
	      , existingDescriptor, proto;
	    if(!ownDesc){
	      if(isObject(proto = getPrototypeOf(target))){
	        return reflectSet(proto, propertyKey, V, receiver);
	      }
	      ownDesc = descriptor(0);
	    }
	    if(has(ownDesc, 'value')){
	      if(ownDesc.writable === false || !isObject(receiver))return false;
	      existingDescriptor = getOwnDescriptor(receiver, propertyKey) || descriptor(0);
	      existingDescriptor.value = V;
	      return defineProperty(receiver, propertyKey, existingDescriptor), true;
	    }
	    return ownDesc.set === undefined
	      ? false
	      : (ownDesc.set.call(receiver, V), true);
	  }
	  var isExtensible = Object.isExtensible || returnIt;
	  
	  var reflect = {
	    // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
	    apply: ctx(call, apply, 3),
	    // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
	    construct: function(target, argumentsList /*, newTarget*/){
	      var proto    = assertFunction(arguments.length < 3 ? target : arguments[2])[PROTOTYPE]
	        , instance = create(isObject(proto) ? proto : ObjectProto)
	        , result   = apply.call(target, instance, argumentsList);
	      return isObject(result) ? result : instance;
	    },
	    // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
	    defineProperty: wrap(defineProperty),
	    // 26.1.4 Reflect.deleteProperty(target, propertyKey)
	    deleteProperty: function(target, propertyKey){
	      var desc = getOwnDescriptor(assertObject(target), propertyKey);
	      return desc && !desc.configurable ? false : delete target[propertyKey];
	    },
	    // 26.1.5 Reflect.enumerate(target)
	    enumerate: function(target){
	      return new Enumerate(assertObject(target));
	    },
	    // 26.1.6 Reflect.get(target, propertyKey [, receiver])
	    get: reflectGet,
	    // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
	    getOwnPropertyDescriptor: function(target, propertyKey){
	      return getOwnDescriptor(assertObject(target), propertyKey);
	    },
	    // 26.1.8 Reflect.getPrototypeOf(target)
	    getPrototypeOf: function(target){
	      return getPrototypeOf(assertObject(target));
	    },
	    // 26.1.9 Reflect.has(target, propertyKey)
	    has: function(target, propertyKey){
	      return propertyKey in target;
	    },
	    // 26.1.10 Reflect.isExtensible(target)
	    isExtensible: function(target){
	      return !!isExtensible(assertObject(target));
	    },
	    // 26.1.11 Reflect.ownKeys(target)
	    ownKeys: ownKeys,
	    // 26.1.12 Reflect.preventExtensions(target)
	    preventExtensions: wrap(Object.preventExtensions || returnIt),
	    // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
	    set: reflectSet
	  }
	  // 26.1.14 Reflect.setPrototypeOf(target, proto)
	  if(setPrototypeOf)reflect.setPrototypeOf = function(target, proto){
	    return setPrototypeOf(assertObject(target), proto), true;
	  };
	  
	  $define(GLOBAL, {Reflect: {}});
	  $define(STATIC, 'Reflect', reflect);
	}();
	
	/******************************************************************************
	 * Module : es7.proposals                                                     *
	 ******************************************************************************/
	
	!function(){
	  $define(PROTO, ARRAY, {
	    // https://github.com/domenic/Array.prototype.includes
	    includes: createArrayContains(true)
	  });
	  $define(PROTO, STRING, {
	    // https://github.com/mathiasbynens/String.prototype.at
	    at: createPointAt(true)
	  });
	  
	  function createObjectToArray(isEntries){
	    return function(object){
	      var O      = toObject(object)
	        , keys   = getKeys(object)
	        , length = keys.length
	        , i      = 0
	        , result = Array(length)
	        , key;
	      if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
	      else while(length > i)result[i] = O[keys[i++]];
	      return result;
	    }
	  }
	  $define(STATIC, OBJECT, {
	    // https://gist.github.com/WebReflection/9353781
	    getOwnPropertyDescriptors: function(object){
	      var O      = toObject(object)
	        , result = {};
	      forEach.call(ownKeys(O), function(key){
	        defineProperty(result, key, descriptor(0, getOwnDescriptor(O, key)));
	      });
	      return result;
	    },
	    // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues
	    values:  createObjectToArray(false),
	    entries: createObjectToArray(true)
	  });
	  $define(STATIC, REGEXP, {
	    // https://gist.github.com/kangax/9698100
	    escape: createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
	  });
	}();
	
	/******************************************************************************
	 * Module : es7.abstract-refs                                                 *
	 ******************************************************************************/
	
	// https://github.com/zenparsing/es-abstract-refs
	!function(REFERENCE){
	  REFERENCE_GET = getWellKnownSymbol(REFERENCE+'Get', true);
	  var REFERENCE_SET = getWellKnownSymbol(REFERENCE+SET, true)
	    , REFERENCE_DELETE = getWellKnownSymbol(REFERENCE+'Delete', true);
	  
	  $define(STATIC, SYMBOL, {
	    referenceGet: REFERENCE_GET,
	    referenceSet: REFERENCE_SET,
	    referenceDelete: REFERENCE_DELETE
	  });
	  
	  hidden(FunctionProto, REFERENCE_GET, returnThis);
	  
	  function setMapMethods(Constructor){
	    if(Constructor){
	      var MapProto = Constructor[PROTOTYPE];
	      hidden(MapProto, REFERENCE_GET, MapProto.get);
	      hidden(MapProto, REFERENCE_SET, MapProto.set);
	      hidden(MapProto, REFERENCE_DELETE, MapProto['delete']);
	    }
	  }
	  setMapMethods(Map);
	  setMapMethods(WeakMap);
	}('reference');
	
	/******************************************************************************
	 * Module : core.dict                                                         *
	 ******************************************************************************/
	
	!function(DICT){
	  Dict = function(iterable){
	    var dict = create(null);
	    if(iterable != undefined){
	      if(isIterable(iterable)){
	        forOf(iterable, true, function(key, value){
	          dict[key] = value;
	        });
	      } else assign(dict, iterable);
	    }
	    return dict;
	  }
	  Dict[PROTOTYPE] = null;
	  
	  function DictIterator(iterated, kind){
	    set(this, ITER, {o: toObject(iterated), a: getKeys(iterated), i: 0, k: kind});
	  }
	  createIterator(DictIterator, DICT, function(){
	    var iter = this[ITER]
	      , O    = iter.o
	      , keys = iter.a
	      , kind = iter.k
	      , key;
	    do {
	      if(iter.i >= keys.length){
	        iter.o = undefined;
	        return iterResult(1);
	      }
	    } while(!has(O, key = keys[iter.i++]));
	    if(kind == KEY)  return iterResult(0, key);
	    if(kind == VALUE)return iterResult(0, O[key]);
	                     return iterResult(0, [key, O[key]]);
	  });
	  function createDictIter(kind){
	    return function(it){
	      return new DictIterator(it, kind);
	    }
	  }
	  
	  /*
	   * 0 -> forEach
	   * 1 -> map
	   * 2 -> filter
	   * 3 -> some
	   * 4 -> every
	   * 5 -> find
	   * 6 -> findKey
	   * 7 -> mapPairs
	   */
	  function createDictMethod(type){
	    var isMap    = type == 1
	      , isEvery  = type == 4;
	    return function(object, callbackfn, that /* = undefined */){
	      var f      = ctx(callbackfn, that, 3)
	        , O      = toObject(object)
	        , result = isMap || type == 7 || type == 2 ? new (generic(this, Dict)) : undefined
	        , key, val, res;
	      for(key in O)if(has(O, key)){
	        val = O[key];
	        res = f(val, key, object);
	        if(type){
	          if(isMap)result[key] = res;             // map
	          else if(res)switch(type){
	            case 2: result[key] = val; break      // filter
	            case 3: return true;                  // some
	            case 5: return val;                   // find
	            case 6: return key;                   // findKey
	            case 7: result[res[0]] = res[1];      // mapPairs
	          } else if(isEvery)return false;         // every
	        }
	      }
	      return type == 3 || isEvery ? isEvery : result;
	    }
	  }
	  function createDictReduce(isTurn){
	    return function(object, mapfn, init){
	      assertFunction(mapfn);
	      var O      = toObject(object)
	        , keys   = getKeys(O)
	        , length = keys.length
	        , i      = 0
	        , memo, key, result;
	      if(isTurn)memo = init == undefined ? new (generic(this, Dict)) : Object(init);
	      else if(arguments.length < 3){
	        assert(length, REDUCE_ERROR);
	        memo = O[keys[i++]];
	      } else memo = Object(init);
	      while(length > i)if(has(O, key = keys[i++])){
	        result = mapfn(memo, O[key], key, object);
	        if(isTurn){
	          if(result === false)break;
	        } else memo = result;
	      }
	      return memo;
	    }
	  }
	  var findKey = createDictMethod(6);
	  function includes(object, el){
	    return (el == el ? keyOf(object, el) : findKey(object, sameNaN)) !== undefined;
	  }
	  
	  var dictMethods = {
	    keys:    createDictIter(KEY),
	    values:  createDictIter(VALUE),
	    entries: createDictIter(KEY+VALUE),
	    forEach: createDictMethod(0),
	    map:     createDictMethod(1),
	    filter:  createDictMethod(2),
	    some:    createDictMethod(3),
	    every:   createDictMethod(4),
	    find:    createDictMethod(5),
	    findKey: findKey,
	    mapPairs:createDictMethod(7),
	    reduce:  createDictReduce(false),
	    turn:    createDictReduce(true),
	    keyOf:   keyOf,
	    includes:includes,
	    // Has / get / set own property
	    has: has,
	    get: get,
	    set: createDefiner(0),
	    isDict: function(it){
	      return isObject(it) && getPrototypeOf(it) === Dict[PROTOTYPE];
	    }
	  };
	  
	  if(REFERENCE_GET)for(var key in dictMethods)!function(fn){
	    function method(){
	      for(var args = [this], i = 0; i < arguments.length;)args.push(arguments[i++]);
	      return invoke(fn, args);
	    }
	    fn[REFERENCE_GET] = function(){
	      return method;
	    }
	  }(dictMethods[key]);
	  
	  $define(GLOBAL + FORCED, {Dict: assignHidden(Dict, dictMethods)});
	}('Dict');
	
	/******************************************************************************
	 * Module : core.$for                                                         *
	 ******************************************************************************/
	
	!function(ENTRIES, FN){  
	  function $for(iterable, entries){
	    if(!(this instanceof $for))return new $for(iterable, entries);
	    this[ITER]    = getIterator(iterable);
	    this[ENTRIES] = !!entries;
	  }
	  
	  createIterator($for, 'Wrapper', function(){
	    return this[ITER].next();
	  });
	  var $forProto = $for[PROTOTYPE];
	  setIterator($forProto, function(){
	    return this[ITER]; // unwrap
	  });
	  
	  function createChainIterator(next){
	    function Iter(I, fn, that){
	      this[ITER]    = getIterator(I);
	      this[ENTRIES] = I[ENTRIES];
	      this[FN]      = ctx(fn, that, I[ENTRIES] ? 2 : 1);
	    }
	    createIterator(Iter, 'Chain', next, $forProto);
	    setIterator(Iter[PROTOTYPE], returnThis); // override $forProto iterator
	    return Iter;
	  }
	  
	  var MapIter = createChainIterator(function(){
	    var step = this[ITER].next();
	    return step.done ? step : iterResult(0, stepCall(this[FN], step.value, this[ENTRIES]));
	  });
	  
	  var FilterIter = createChainIterator(function(){
	    for(;;){
	      var step = this[ITER].next();
	      if(step.done || stepCall(this[FN], step.value, this[ENTRIES]))return step;
	    }
	  });
	  
	  assignHidden($forProto, {
	    of: function(fn, that){
	      forOf(this, this[ENTRIES], fn, that);
	    },
	    array: function(fn, that){
	      var result = [];
	      forOf(fn != undefined ? this.map(fn, that) : this, false, push, result);
	      return result;
	    },
	    filter: function(fn, that){
	      return new FilterIter(this, fn, that);
	    },
	    map: function(fn, that){
	      return new MapIter(this, fn, that);
	    }
	  });
	  
	  $for.isIterable  = isIterable;
	  $for.getIterator = getIterator;
	  
	  $define(GLOBAL + FORCED, {$for: $for});
	}('entries', safeSymbol('fn'));
	
	/******************************************************************************
	 * Module : core.delay                                                        *
	 ******************************************************************************/
	
	// https://esdiscuss.org/topic/promise-returning-delay-function
	$define(GLOBAL + FORCED, {
	  delay: function(time){
	    return new Promise(function(resolve){
	      setTimeout(resolve, time, true);
	    });
	  }
	});
	
	/******************************************************************************
	 * Module : core.binding                                                      *
	 ******************************************************************************/
	
	!function(_, toLocaleString){
	  // Placeholder
	  core._ = path._ = path._ || {};
	
	  $define(PROTO + FORCED, FUNCTION, {
	    part: part,
	    only: function(numberArguments, that /* = @ */){
	      var fn     = assertFunction(this)
	        , n      = toLength(numberArguments)
	        , isThat = arguments.length > 1;
	      return function(/* ...args */){
	        var length = min(n, arguments.length)
	          , args   = Array(length)
	          , i      = 0;
	        while(length > i)args[i] = arguments[i++];
	        return invoke(fn, args, isThat ? that : this);
	      }
	    }
	  });
	  
	  function tie(key){
	    var that  = this
	      , bound = {};
	    return hidden(that, _, function(key){
	      if(key === undefined || !(key in that))return toLocaleString.call(that);
	      return has(bound, key) ? bound[key] : (bound[key] = ctx(that[key], that, -1));
	    })[_](key);
	  }
	  
	  hidden(path._, TO_STRING, function(){
	    return _;
	  });
	  
	  hidden(ObjectProto, _, tie);
	  DESC || hidden(ArrayProto, _, tie);
	  // IE8- dirty hack - redefined toLocaleString is not enumerable
	}(DESC ? uid('tie') : TO_LOCALE, ObjectProto[TO_LOCALE]);
	
	/******************************************************************************
	 * Module : core.object                                                       *
	 ******************************************************************************/
	
	!function(){
	  function define(target, mixin){
	    var keys   = ownKeys(toObject(mixin))
	      , length = keys.length
	      , i = 0, key;
	    while(length > i)defineProperty(target, key = keys[i++], getOwnDescriptor(mixin, key));
	    return target;
	  };
	  $define(STATIC + FORCED, OBJECT, {
	    isObject: isObject,
	    classof: classof,
	    define: define,
	    make: function(proto, mixin){
	      return define(create(proto), mixin);
	    }
	  });
	}();
	
	/******************************************************************************
	 * Module : core.array                                                        *
	 ******************************************************************************/
	
	$define(PROTO + FORCED, ARRAY, {
	  turn: function(fn, target /* = [] */){
	    assertFunction(fn);
	    var memo   = target == undefined ? [] : Object(target)
	      , O      = ES5Object(this)
	      , length = toLength(O.length)
	      , index  = 0;
	    while(length > index)if(fn(memo, O[index], index++, this) === false)break;
	    return memo;
	  }
	});
	if(framework)ArrayUnscopables.turn = true;
	
	/******************************************************************************
	 * Module : core.number                                                       *
	 ******************************************************************************/
	
	!function(numberMethods){  
	  function NumberIterator(iterated){
	    set(this, ITER, {l: toLength(iterated), i: 0});
	  }
	  createIterator(NumberIterator, NUMBER, function(){
	    var iter = this[ITER]
	      , i    = iter.i++;
	    return i < iter.l ? iterResult(0, i) : iterResult(1);
	  });
	  defineIterator(Number, NUMBER, function(){
	    return new NumberIterator(this);
	  });
	  
	  numberMethods.random = function(lim /* = 0 */){
	    var a = +this
	      , b = lim == undefined ? 0 : +lim
	      , m = min(a, b);
	    return random() * (max(a, b) - m) + m;
	  };
	
	  forEach.call(array(
	      // ES3:
	      'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
	      // ES6:
	      'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
	    ), function(key){
	      var fn = Math[key];
	      if(fn)numberMethods[key] = function(/* ...args */){
	        // ie9- dont support strict mode & convert `this` to object -> convert it to number
	        var args = [+this]
	          , i    = 0;
	        while(arguments.length > i)args.push(arguments[i++]);
	        return invoke(fn, args);
	      }
	    }
	  );
	  
	  $define(PROTO + FORCED, NUMBER, numberMethods);
	}({});
	
	/******************************************************************************
	 * Module : core.string                                                       *
	 ******************************************************************************/
	
	!function(){
	  var escapeHTMLDict = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&apos;'
	  }, unescapeHTMLDict = {}, key;
	  for(key in escapeHTMLDict)unescapeHTMLDict[escapeHTMLDict[key]] = key;
	  $define(PROTO + FORCED, STRING, {
	    escapeHTML:   createReplacer(/[&<>"']/g, escapeHTMLDict),
	    unescapeHTML: createReplacer(/&(?:amp|lt|gt|quot|apos);/g, unescapeHTMLDict)
	  });
	}();
	
	/******************************************************************************
	 * Module : core.date                                                         *
	 ******************************************************************************/
	
	!function(formatRegExp, flexioRegExp, locales, current, SECONDS, MINUTES, HOURS, MONTH, YEAR){
	  function createFormat(prefix){
	    return function(template, locale /* = current */){
	      var that = this
	        , dict = locales[has(locales, locale) ? locale : current];
	      function get(unit){
	        return that[prefix + unit]();
	      }
	      return String(template).replace(formatRegExp, function(part){
	        switch(part){
	          case 's'  : return get(SECONDS);                  // Seconds : 0-59
	          case 'ss' : return lz(get(SECONDS));              // Seconds : 00-59
	          case 'm'  : return get(MINUTES);                  // Minutes : 0-59
	          case 'mm' : return lz(get(MINUTES));              // Minutes : 00-59
	          case 'h'  : return get(HOURS);                    // Hours   : 0-23
	          case 'hh' : return lz(get(HOURS));                // Hours   : 00-23
	          case 'D'  : return get(DATE);                     // Date    : 1-31
	          case 'DD' : return lz(get(DATE));                 // Date    : 01-31
	          case 'W'  : return dict[0][get('Day')];           // Day     : Понедельник
	          case 'N'  : return get(MONTH) + 1;                // Month   : 1-12
	          case 'NN' : return lz(get(MONTH) + 1);            // Month   : 01-12
	          case 'M'  : return dict[2][get(MONTH)];           // Month   : Январь
	          case 'MM' : return dict[1][get(MONTH)];           // Month   : Января
	          case 'Y'  : return get(YEAR);                     // Year    : 2014
	          case 'YY' : return lz(get(YEAR) % 100);           // Year    : 14
	        } return part;
	      });
	    }
	  }
	  function addLocale(lang, locale){
	    function split(index){
	      var result = [];
	      forEach.call(array(locale.months), function(it){
	        result.push(it.replace(flexioRegExp, '$' + index));
	      });
	      return result;
	    }
	    locales[lang] = [array(locale.weekdays), split(1), split(2)];
	    return core;
	  }
	  $define(PROTO + FORCED, DATE, {
	    format:    createFormat('get'),
	    formatUTC: createFormat('getUTC')
	  });
	  addLocale(current, {
	    weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
	    months: 'January,February,March,April,May,June,July,August,September,October,November,December'
	  });
	  addLocale('ru', {
	    weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
	    months: 'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,' +
	            'Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
	  });
	  core.locale = function(locale){
	    return has(locales, locale) ? current = locale : current;
	  };
	  core.addLocale = addLocale;
	}(/\b\w\w?\b/g, /:(.*)\|(.*)$/, {}, 'en', 'Seconds', 'Minutes', 'Hours', 'Month', 'FullYear');
	
	/******************************************************************************
	 * Module : core.global                                                       *
	 ******************************************************************************/
	
	$define(GLOBAL + FORCED, {global: global});
	
	/******************************************************************************
	 * Module : js.array.statics                                                  *
	 ******************************************************************************/
	
	// JavaScript 1.6 / Strawman array statics shim
	!function(arrayStatics){
	  function setArrayStatics(keys, length){
	    forEach.call(array(keys), function(key){
	      if(key in ArrayProto)arrayStatics[key] = ctx(call, ArrayProto[key], length);
	    });
	  }
	  setArrayStatics('pop,reverse,shift,keys,values,entries', 1);
	  setArrayStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
	  setArrayStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
	                  'reduce,reduceRight,copyWithin,fill,turn');
	  $define(STATIC, ARRAY, arrayStatics);
	}({});
	
	/******************************************************************************
	 * Module : web.dom.itarable                                                  *
	 ******************************************************************************/
	
	!function(NodeList){
	  if(framework && NodeList && !(SYMBOL_ITERATOR in NodeList[PROTOTYPE])){
	    hidden(NodeList[PROTOTYPE], SYMBOL_ITERATOR, Iterators[ARRAY]);
	  }
	  Iterators.NodeList = Iterators[ARRAY];
	}(global.NodeList);
	
	/******************************************************************************
	 * Module : core.log                                                          *
	 ******************************************************************************/
	
	!function(log, enabled){
	  // Methods from https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
	  forEach.call(array('assert,clear,count,debug,dir,dirxml,error,exception,' +
	      'group,groupCollapsed,groupEnd,info,isIndependentlyComposed,log,' +
	      'markTimeline,profile,profileEnd,table,time,timeEnd,timeline,' +
	      'timelineEnd,timeStamp,trace,warn'), function(key){
	    log[key] = function(){
	      if(enabled && key in console)return apply.call(console[key], console, arguments);
	    };
	  });
	  $define(GLOBAL + FORCED, {log: assign(log.log, log, {
	    enable: function(){
	      enabled = true;
	    },
	    disable: function(){
	      enabled = false;
	    }
	  })});
	}({}, true);
	}(typeof self != 'undefined' && self.Math === Math ? self : Function('return this')(), false);
	module.exports = { "default": module.exports, __esModule: true };


/***/ },
/* 20 */,
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";var _core=__webpack_require__(19)["default"];(function(modules){var parentHotUpdateCallback=this.webpackHotUpdate;this.webpackHotUpdate = function webpackHotUpdateCallback(chunkId, moreModules){hotAddUpdateChunk(chunkId, moreModules);if(parentHotUpdateCallback)parentHotUpdateCallback(chunkId, moreModules);};function hotDownloadUpdateChunk(chunkId){var head=document.getElementsByTagName("head")[0];var script=document.createElement("script");script.type = "text/javascript";script.charset = "utf-8";script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";head.appendChild(script);}function hotDownloadManifest(callback){if(typeof XMLHttpRequest === "undefined"){return callback(new Error("No browser support"));}try{var request=new XMLHttpRequest();var requestPath=__webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";request.open("GET", requestPath, true);request.timeout = 10000;request.send(null);}catch(err) {return callback(err);}request.onreadystatechange = function(){if(request.readyState !== 4)return;if(request.status === 0){callback(new Error("Manifest request to " + requestPath + " timed out."));}else if(request.status === 404){callback();}else if(request.status !== 200 && request.status !== 304){callback(new Error("Manifest request to " + requestPath + " failed."));}else {try{var update=JSON.parse(request.responseText);}catch(e) {callback(e);return;}callback(null, update);}};}var hotApplyOnUpdate=true;var hotCurrentHash="4c61c2335501ced812ec";var hotCurrentModuleData={};var hotCurrentParents=[];function hotCreateRequire(moduleId){var me=installedModules[moduleId];if(!me){return __webpack_require__;}var fn=function fn(request){if(me.hot.active){if(installedModules[request]){if(installedModules[request].parents.indexOf(moduleId) < 0)installedModules[request].parents.push(moduleId);if(me.children.indexOf(request) < 0)me.children.push(request);}else hotCurrentParents = [moduleId];}else {console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);hotCurrentParents = [];}return __webpack_require__(request);};for(var name in __webpack_require__) {if(Object.prototype.hasOwnProperty.call(__webpack_require__, name)){fn[name] = __webpack_require__[name];}}fn.e = function(chunkId, callback){if(hotStatus === "ready")hotSetStatus("prepare");hotChunksLoading++;__webpack_require__.e(chunkId, function(){try{callback.call(null, fn);}finally {finishChunkLoading();}function finishChunkLoading(){hotChunksLoading--;if(hotStatus === "prepare"){if(!hotWaitingFilesMap[chunkId]){hotEnsureUpdateChunk(chunkId);}if(hotChunksLoading === 0 && hotWaitingFiles === 0){hotUpdateDownloaded();}}}});};return fn;}function hotCreateModule(moduleId){var hot={_acceptedDependencies:{}, _declinedDependencies:{}, _selfAccepted:false, _selfDeclined:false, _disposeHandlers:[], active:true, accept:function accept(dep, callback){if(typeof dep === "undefined")hot._selfAccepted = true;else if(typeof dep === "function")hot._selfAccepted = dep;else if(typeof dep === "number")hot._acceptedDependencies[dep] = callback;else for(var i=0; i < dep.length; i++) hot._acceptedDependencies[dep[i]] = callback;}, decline:function decline(dep){if(typeof dep === "undefined")hot._selfDeclined = true;else if(typeof dep === "number")hot._declinedDependencies[dep] = true;else for(var i=0; i < dep.length; i++) hot._declinedDependencies[dep[i]] = true;}, dispose:function dispose(callback){hot._disposeHandlers.push(callback);}, addDisposeHandler:function addDisposeHandler(callback){hot._disposeHandlers.push(callback);}, removeDisposeHandler:function removeDisposeHandler(callback){var idx=hot._disposeHandlers.indexOf(callback);if(idx >= 0)hot._disposeHandlers.splice(idx, 1);}, check:hotCheck, apply:hotApply, status:function status(l){if(!l){return hotStatus;}hotStatusHandlers.push(l);}, addStatusHandler:function addStatusHandler(l){hotStatusHandlers.push(l);}, removeStatusHandler:function removeStatusHandler(l){var idx=hotStatusHandlers.indexOf(l);if(idx >= 0)hotStatusHandlers.splice(idx, 1);}, data:hotCurrentModuleData[moduleId]};return hot;}var hotStatusHandlers=[];var hotStatus="idle";function hotSetStatus(newStatus){hotStatus = newStatus;for(var i=0; i < hotStatusHandlers.length; i++) hotStatusHandlers[i].call(null, newStatus);}var hotWaitingFiles=0;var hotChunksLoading=0;var hotWaitingFilesMap={};var hotRequestedFilesMap={};var hotAvailibleFilesMap={};var hotCallback;var hotUpdate, hotUpdateNewHash;function hotCheck(apply, callback){if(hotStatus !== "idle")throw new Error("check() is only allowed in idle status");if(typeof apply === "function"){hotApplyOnUpdate = false;callback = apply;}else {hotApplyOnUpdate = apply;callback = callback || function(err){if(err)throw err;};}hotSetStatus("check");hotDownloadManifest(function(err, update){if(err)return callback(err);if(!update){hotSetStatus("idle");callback(null, null);return;}hotRequestedFilesMap = {};hotAvailibleFilesMap = {};hotWaitingFilesMap = {};for(var i=0; i < update.c.length; i++) hotAvailibleFilesMap[update.c[i]] = true;hotUpdateNewHash = update.h;hotSetStatus("prepare");hotCallback = callback;hotUpdate = {};var chunkId=1;{hotEnsureUpdateChunk(chunkId);}if(hotChunksLoading === 0 && hotWaitingFiles === 0){hotUpdateDownloaded();}});}function hotAddUpdateChunk(chunkId, moreModules){if(!hotAvailibleFilesMap[chunkId] || !hotRequestedFilesMap[chunkId]){return;}hotRequestedFilesMap[chunkId] = false;for(var moduleId in moreModules) {if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)){hotUpdate[moduleId] = moreModules[moduleId];}}if(--hotWaitingFiles === 0 && hotChunksLoading === 0){hotUpdateDownloaded();}}function hotEnsureUpdateChunk(chunkId){if(!hotAvailibleFilesMap[chunkId]){hotWaitingFilesMap[chunkId] = true;}else {hotRequestedFilesMap[chunkId] = true;hotWaitingFiles++;hotDownloadUpdateChunk(chunkId);}}function hotUpdateDownloaded(){hotSetStatus("ready");var callback=hotCallback;hotCallback = null;if(!callback){return;}if(hotApplyOnUpdate){hotApply(hotApplyOnUpdate, callback);}else {var outdatedModules=[];for(var id in hotUpdate) {if(Object.prototype.hasOwnProperty.call(hotUpdate, id)){outdatedModules.push(+id);}}callback(null, outdatedModules);}}function hotApply(options, callback){if(hotStatus !== "ready")throw new Error("apply() is only allowed in ready status");if(typeof options === "function"){callback = options;options = {};}else if(options && typeof options === "object"){callback = callback || function(err){if(err)throw err;};}else {options = {};callback = callback || function(err){if(err)throw err;};}function getAffectedStuff(module){var outdatedModules=[module];var outdatedDependencies={};var queue=outdatedModules.slice();while(queue.length > 0) {var moduleId=queue.pop();var module=installedModules[moduleId];if(!module || module.hot._selfAccepted)continue;if(module.hot._selfDeclined){return new Error("Aborted because of self decline: " + moduleId);}if(moduleId === 0){return;}for(var i=0; i < module.parents.length; i++) {var parentId=module.parents[i];var parent=installedModules[parentId];if(parent.hot._declinedDependencies[moduleId]){return new Error("Aborted because of declined dependency: " + moduleId + " in " + parentId);}if(outdatedModules.indexOf(parentId) >= 0)continue;if(parent.hot._acceptedDependencies[moduleId]){if(!outdatedDependencies[parentId])outdatedDependencies[parentId] = [];addAllToSet(outdatedDependencies[parentId], [moduleId]);continue;}delete outdatedDependencies[parentId];outdatedModules.push(parentId);queue.push(parentId);}}return [outdatedModules, outdatedDependencies];}function addAllToSet(a, b){for(var i=0; i < b.length; i++) {var item=b[i];if(a.indexOf(item) < 0)a.push(item);}}var outdatedDependencies={};var outdatedModules=[];var appliedUpdate={};for(var id in hotUpdate) {if(Object.prototype.hasOwnProperty.call(hotUpdate, id)){var moduleId=+id;var result=getAffectedStuff(moduleId);if(!result){if(options.ignoreUnaccepted)continue;hotSetStatus("abort");return callback(new Error("Aborted because " + moduleId + " is not accepted"));}if(result instanceof Error){hotSetStatus("abort");return callback(result);}appliedUpdate[moduleId] = hotUpdate[moduleId];addAllToSet(outdatedModules, result[0]);for(var moduleId in result[1]) {if(Object.prototype.hasOwnProperty.call(result[1], moduleId)){if(!outdatedDependencies[moduleId])outdatedDependencies[moduleId] = [];addAllToSet(outdatedDependencies[moduleId], result[1][moduleId]);}}}}var outdatedSelfAcceptedModules=[];for(var i=0; i < outdatedModules.length; i++) {var moduleId=outdatedModules[i];if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)outdatedSelfAcceptedModules.push({module:moduleId, errorHandler:installedModules[moduleId].hot._selfAccepted});}hotSetStatus("dispose");var queue=outdatedModules.slice();while(queue.length > 0) {var moduleId=queue.pop();var module=installedModules[moduleId];if(!module)continue;var data={};var disposeHandlers=module.hot._disposeHandlers;for(var j=0; j < disposeHandlers.length; j++) {var cb=disposeHandlers[j];cb(data);}hotCurrentModuleData[moduleId] = data;module.hot.active = false;delete installedModules[moduleId];for(var j=0; j < module.children.length; j++) {var child=installedModules[module.children[j]];if(!child)continue;var idx=child.parents.indexOf(moduleId);if(idx >= 0){child.parents.splice(idx, 1);if(child.parents.length === 0 && child.hot && child.hot._disposeHandlers && child.hot._disposeHandlers.length > 0){queue.push(child.id);}}}}for(var moduleId in outdatedDependencies) {if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)){var module=installedModules[moduleId];var moduleOutdatedDependencies=outdatedDependencies[moduleId];for(var j=0; j < moduleOutdatedDependencies.length; j++) {var dependency=moduleOutdatedDependencies[j];var idx=module.children.indexOf(dependency);if(idx >= 0)module.children.splice(idx, 1);}}}hotSetStatus("apply");hotCurrentHash = hotUpdateNewHash;for(var moduleId in appliedUpdate) {if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)){modules[moduleId] = appliedUpdate[moduleId];}}var error=null;for(var moduleId in outdatedDependencies) {if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)){var module=installedModules[moduleId];var moduleOutdatedDependencies=outdatedDependencies[moduleId];var callbacks=[];for(var i=0; i < moduleOutdatedDependencies.length; i++) {var dependency=moduleOutdatedDependencies[i];var cb=module.hot._acceptedDependencies[dependency];if(callbacks.indexOf(cb) >= 0)continue;callbacks.push(cb);}for(var i=0; i < callbacks.length; i++) {var cb=callbacks[i];try{cb(outdatedDependencies);}catch(err) {if(!error)error = err;}}}}for(var i=0; i < outdatedSelfAcceptedModules.length; i++) {var item=outdatedSelfAcceptedModules[i];var moduleId=item.module;hotCurrentParents = [moduleId];try{__webpack_require__(moduleId);}catch(err) {if(typeof item.errorHandler === "function"){try{item.errorHandler(err);}catch(err) {if(!error)error = err;}}else if(!error)error = err;}}if(error){hotSetStatus("fail");return callback(error);}hotSetStatus("idle");callback(null, outdatedModules);}var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId]){return installedModules[moduleId].exports;}var module=installedModules[moduleId] = {exports:{}, id:moduleId, loaded:false, hot:hotCreateModule(moduleId), parents:hotCurrentParents, children:[]};modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));module.loaded = true;return module.exports;}__webpack_require__.m = modules;__webpack_require__.c = installedModules;__webpack_require__.p = "";__webpack_require__.h = function(){return hotCurrentHash;};return hotCreateRequire(0)(0);})([function(module, exports, __webpack_require__){module.exports = __webpack_require__(2);},, function(module, exports, __webpack_require__){"use strict";var _babelHelpers=__webpack_require__(14)["default"];var defineType=_babelHelpers.interopRequire(__webpack_require__(7));var BaseType=_babelHelpers.interopRequire(__webpack_require__(8));var stringType=_babelHelpers.interopRequire(__webpack_require__(9));var numberType=_babelHelpers.interopRequire(__webpack_require__(10));var arrayType=_babelHelpers.interopRequire(__webpack_require__(11));module.exports = {define:defineType, BaseType:BaseType, String:stringType, Number:numberType, Array:arrayType};},,,,, function(module, exports, __webpack_require__){"use strict";var _babelHelpers=__webpack_require__(14)["default"];var _=_babelHelpers.interopRequire(__webpack_require__(25));var defineTypeUtils=_babelHelpers.interopRequireWildcard(__webpack_require__(19));var BaseType=_babelHelpers.interopRequire(__webpack_require__(8));module.exports = function(displayName, typeDefinition, TypeConstructor){TypeConstructor = TypeConstructor || function Type(value, isReadOnly, options){BaseType.call(this, value, isReadOnly, options);};TypeConstructor.displayName = displayName;TypeConstructor.type = TypeConstructor;TypeConstructor.test = TypeConstructor.test || defineTypeUtils.generateTest();TypeConstructor.withDefault = TypeConstructor.withDefault || defineTypeUtils.generateWithDefault();TypeConstructor.defaults = TypeConstructor.defaults || defineTypeUtils.generateGetDefaultValue();TypeConstructor.create = BaseType.create;if(!BaseType.prototype.isPrototypeOf(TypeConstructor.prototype)){TypeConstructor.prototype = Object.create(BaseType.prototype);TypeConstructor.prototype.constructor = TypeConstructor;}TypeConstructor.getFieldsSpec = typeDefinition.spec.bind(null, TypeConstructor);TypeConstructor._spec = typeDefinition.spec(TypeConstructor);TypeConstructor.wrapValue = TypeConstructor.wrapValue || BaseType.wrapValue;defineTypeUtils.generateFieldsOn(TypeConstructor.prototype, TypeConstructor._spec);return TypeConstructor;};}, function(module, exports, __webpack_require__){"use strict";var _babelHelpers=__webpack_require__(14)["default"];var _core=__webpack_require__(20)["default"];var _=_babelHelpers.interopRequire(__webpack_require__(25));var BaseType=(function(){function BaseType(value){var isReadOnly=arguments[1] === undefined?false:arguments[1];var options=arguments[2] === undefined?{}:arguments[2];_babelHelpers.classCallCheck(this, BaseType);this.__isReadOnly__ = !!isReadOnly;this.__readOnlyInstance__ = this.__isReadOnly__?this:null;this.__isInvalidated__ = -1;this.__options__ = options;this.__value__ = this.constructor.wrapValue(value === undefined?this.constructor.defaults():value, this.constructor._spec, this.__isReadOnly__, options);}_babelHelpers.prototypeProperties(BaseType, {create:{value:function create(value, isReadOnly, options){return new this(value, isReadOnly, options);}, writable:true, configurable:true}, wrapValue:{value:function wrapValue(value, spec, isReadOnly, options){_core.Object.keys(spec).forEach(function(key){var fieldValue=value[key] !== undefined?value[key]:spec[key].defaults();value[key] = spec[key].type.create(fieldValue, isReadOnly, spec[key].options);});return value;}, writable:true, configurable:true}}, {setValue:{value:function setValue(newValue){var _this=this;this.__isInvalidated__ = true;if(newValue instanceof BaseType){newValue = newValue.toJSON();}_.forEach(newValue, function(fieldValue, fieldName){_this[fieldName] = fieldValue;});}, writable:true, configurable:true}, $asReadOnly:{value:function $asReadOnly(){if(!this.__readOnlyInstance__){this.__readOnlyInstance__ = this.constructor.type.create(this.__value__, true, this.__options__);}return this.__readOnlyInstance__;}, writable:true, configurable:true}, $isInvalidated:{value:function $isInvalidated(){var _this=this;if(this.__isInvalidated__ === -1){var invalidatedField=_.find(this.constructor._spec, function(fieldDef, fieldName){if(fieldDef.type.prototype instanceof BaseType){return _this.__value__[fieldName].$isInvalidated();}});if(invalidatedField){this.__isInvalidated__ = true;}else {this.__isInvalidated__ = false;}}return this.__isInvalidated__;}, writable:true, configurable:true}, $revalidate:{value:function $revalidate(){var _this=this;this.__isInvalidated__ = -1;_.forEach(this.constructor._spec, function(fieldDef, fieldName){if(fieldDef.type.prototype instanceof BaseType){_this.__value__[fieldName].$revalidate();}});}, writable:true, configurable:true}, $resetValidationCheck:{value:function $resetValidationCheck(){var _this=this;this.__isInvalidated__ = this.__isInvalidated__ || -1;_.forEach(this.constructor._spec, function(fieldDef, fieldName){if(fieldDef.type.prototype instanceof BaseType){_this.__value__[fieldName].$resetValidationCheck();}});}, writable:true, configurable:true}, toJSON:{value:function toJSON(){var _this=this;return _core.Object.keys(this.constructor._spec).reduce(function(json, key){var fieldValue=_this.__value__[key];json[key] = fieldValue.toJSON?fieldValue.toJSON():fieldValue;return json;}, {});}, writable:true, configurable:true}});return BaseType;})();module.exports = BaseType;}, function(module, exports, __webpack_require__){"use strict";var _babelHelpers=__webpack_require__(14)["default"];var generateWithDefaultForSysImmutable=__webpack_require__(19).generateWithDefaultForSysImmutable;var _String=(function(){function _String(value){_babelHelpers.classCallCheck(this, _String);return String(value);}_babelHelpers.prototypeProperties(_String, {defaults:{value:function defaults(){return "";}, writable:true, configurable:true}, test:{value:function test(v){return typeof v === "string";}, writable:true, configurable:true}});return _String;})();module.exports = _String;_String.type = _String;_String.create = String;_String.withDefault = generateWithDefaultForSysImmutable(String);}, function(module, exports, __webpack_require__){"use strict";var _babelHelpers=__webpack_require__(14)["default"];var generateWithDefaultForSysImmutable=__webpack_require__(19).generateWithDefaultForSysImmutable;var _Number=(function(){function _Number(value){_babelHelpers.classCallCheck(this, _Number);return Number(value);}_babelHelpers.prototypeProperties(_Number, {defaults:{value:function defaults(){return 0;}, writable:true, configurable:true}, test:{value:function test(v){return typeof v === "number";}, writable:true, configurable:true}});return _Number;})();module.exports = _Number;_Number.type = _Number;_Number.create = Number;_Number.withDefault = generateWithDefaultForSysImmutable(Number);}, function(module, exports, __webpack_require__){"use strict";var _babelHelpers=__webpack_require__(14)["default"];var _=_babelHelpers.interopRequire(__webpack_require__(25));var defineType=_babelHelpers.interopRequire(__webpack_require__(7));var BaseType=_babelHelpers.interopRequire(__webpack_require__(8));var number=_babelHelpers.interopRequire(__webpack_require__(10));var generateWithDefault=__webpack_require__(19).generateWithDefault;var _Array=(function(BaseType){function _Array(){var value=arguments[0] === undefined?[]:arguments[0];var isReadOnly=arguments[1] === undefined?false:arguments[1];var options=arguments[2] === undefined?{}:arguments[2];_babelHelpers.classCallCheck(this, _Array);if(options.subTypes && _.isArray(options.subTypes)){var subTypesObj={};options.subTypes.forEach(function(item){subTypesObj[item.displayName] = item;});options.subTypes = subTypesObj;}BaseType.call(this, value, isReadOnly, options);}_babelHelpers.inherits(_Array, BaseType);_babelHelpers.prototypeProperties(_Array, {defaults:{value:function defaults(){return [];}, writable:true, configurable:true}, test:{value:function test(value){return Array.isArray(value);}, writable:true, configurable:true}, wrapValue:{value:function wrapValue(value, spec, isReadOnly, options){var _this=this;return value.reduce(function(wrappedList, itemValue){wrappedList.push(_this._wrapSingleItem(itemValue, isReadOnly, options));return wrappedList;}, []);}, writable:true, configurable:true}, _wrapSingleItem:{value:function _wrapSingleItem(itemValue, isReadOnly, options){if(itemValue instanceof BaseType){return itemValue;}else if(typeof options.subTypes === "function"){return options.subTypes.create(itemValue, isReadOnly, options.subTypes.options);}else if(typeof options.subTypes === "object"){var subType=options.subTypes[itemValue._type];return subType.create(itemValue, isReadOnly, subType.options);}}, writable:true, configurable:true}, of:{value:function of(subTypes, defaults, test){return this.withDefault(defaults, test, {subTypes:subTypes});}, writable:true, configurable:true}}, {at:{value:function at(index){var item=this.__value__[index];return this.__isReadOnly__ && item instanceof BaseType?item.$asReadOnly():item;}, writable:true, configurable:true}, push:{value:function push(newItem){if(this.__isReadOnly__){return null;}this.__isInvalidated__ = true;return this.__value__.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__));}, writable:true, configurable:true}, forEach:{value:function forEach(cb){var that=this;this.__value__.forEach(function(item, index, arr){cb(item, index, that);});}, writable:true, configurable:true}, splice:{value:function splice(index, removeCount){for(var _len=arguments.length, addedItems=Array(_len > 2?_len - 2:0), _key=2; _key < _len; _key++) {addedItems[_key - 2] = arguments[_key];}if(this.__isReadOnly__){return null;}this.__isInvalidated__ = true;var spliceParams=[index, removeCount];addedItems.forEach((function(newItem){spliceParams.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__));}).bind(this));return this.__value__.splice.apply(this.__value__, spliceParams);}, writable:true, configurable:true}, concat:{value:function concat(){for(var _len=arguments.length, addedArrays=Array(_len), _key=0; _key < _len; _key++) {addedArrays[_key] = arguments[_key];}var items=[];var subTypes=[];var addSubTypes=function addSubTypes(arr){var subs=arr.__options__ && arr.__options__.subTypes;if(subs === undefined){}else if(_.isFunction(subs)){subTypes.push(subs);}else {subTypes = subTypes.concat(subs);}};addSubTypes(this);addedArrays.forEach(function(arr){arr.forEach(function(item){items.push(item);});addSubTypes(arr);});subTypes = _.uniq(subTypes);return new this.constructor(items, false, {subTypes:subTypes});}, writable:true, configurable:true}, every:{value:function every(cb){var self=this;return this.__value__.every(function(element, index, array){return cb(element, index, self);});}, writable:true, configurable:true}, some:{value:function some(cb){var self=this;return this.__value__.some(function(element, index, array){return cb(element, index, self);});}, writable:true, configurable:true}, find:{value:function find(cb){var self=this;return _.find(this.__value__, function(element, index, array){return cb(element, index, self);});return _.find(this.__value__, cb);}, writable:true, configurable:true}, findIndex:{value:function findIndex(cb){var self=this;return _.findIndex(this.__value__, function(element, index, array){return cb(element, index, self);});return _.findIndex(this.__value__, cb);}, writable:true, configurable:true}, filter:{value:function filter(cb){var self=this;var filteredArray=this.__value__.filter(function(element, index, array){return cb(element, index, self);});return new this.constructor(filteredArray, false, this.__options__);}, writable:true, configurable:true}, setValue:{value:function setValue(newValue){var _this=this;if(newValue instanceof _Array){newValue = newValue.toJSON();}if(_.isArray(newValue)){this.__value__ = [];_.forEach(newValue, function(itemValue){_this.push(itemValue);});}}, writable:true, configurable:true}, $asReadOnly:{value:function $asReadOnly(){if(!this.__readOnlyInstance__){this.__readOnlyInstance__ = this.constructor.type.create(this.__value__, true, this.__options__);}return this.__readOnlyInstance__;}, writable:true, configurable:true}, $isInvalidated:{value:function $isInvalidated(){if(this.__isInvalidated__ == -1){var invalidatedField=_.find(this.__value__, function(item, index){if(item instanceof BaseType){return item.$isInvalidated();}});if(invalidatedField){this.__isInvalidated__ = true;}else {this.__isInvalidated__ = false;}}return this.__isInvalidated__;}, writable:true, configurable:true}, $revalidate:{value:function $revalidate(){this.__isInvalidated__ = -1;_.forEach(this.__value__, function(item, index){if(item instanceof BaseType){item.$revalidate();}});}, writable:true, configurable:true}, $resetValidationCheck:{value:function $resetValidationCheck(){this.__isInvalidated__ = this.__isInvalidated__ || -1;_.forEach(this.__value__, function(item, index){if(item instanceof BaseType){item.$resetValidationCheck();}});}, writable:true, configurable:true}});return _Array;})(BaseType);module.exports = _Array;_Array.withDefault = generateWithDefault();defineType("Array", {spec:function spec(){return {length:number.withDefault(0)};}}, _Array);},,, function(module, exports, __webpack_require__){(function(global){"use strict";var _core=__webpack_require__(20)["default"];var helpers=exports["default"] = {};exports.__esModule = true;helpers.inherits = function(subClass, superClass){if(typeof superClass !== "function" && superClass !== null){throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;};helpers.defaults = function(obj, defaults){var keys=_core.Object.getOwnPropertyNames(defaults);for(var i=0; i < keys.length; i++) {var key=keys[i];var value=_core.Object.getOwnPropertyDescriptor(defaults, key);if(value && value.configurable && obj[key] === undefined){Object.defineProperty(obj, key, value);}}return obj;};helpers.prototypeProperties = function(child, staticProps, instanceProps){if(staticProps)Object.defineProperties(child, staticProps);if(instanceProps)Object.defineProperties(child.prototype, instanceProps);};helpers.applyConstructor = function(Constructor, args){var instance=Object.create(Constructor.prototype);var result=Constructor.apply(instance, args);return result != null && (typeof result == "object" || typeof result == "function")?result:instance;};helpers.taggedTemplateLiteral = function(strings, raw){return _core.Object.freeze(Object.defineProperties(strings, {raw:{value:_core.Object.freeze(raw)}}));};helpers.taggedTemplateLiteralLoose = function(strings, raw){strings.raw = raw;return strings;};helpers.interopRequire = function(obj){return obj && obj.__esModule?obj["default"]:obj;};helpers.toArray = function(arr){return Array.isArray(arr)?arr:_core.Array.from(arr);};helpers.toConsumableArray = function(arr){if(Array.isArray(arr)){for(var i=0, arr2=Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;}else {return _core.Array.from(arr);}};helpers.slicedToArray = function(arr, i){if(Array.isArray(arr)){return arr;}else if(_core.$for.isIterable(Object(arr))){var _arr=[];for(var _iterator=_core.$for.getIterator(arr), _step; !(_step = _iterator.next()).done;) {_arr.push(_step.value);if(i && _arr.length === i)break;}return _arr;}else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};helpers.objectWithoutProperties = function(obj, keys){var target={};for(var i in obj) {if(keys.indexOf(i) >= 0)continue;if(!Object.prototype.hasOwnProperty.call(obj, i))continue;target[i] = obj[i];}return target;};helpers.hasOwn = Object.prototype.hasOwnProperty;helpers.slice = Array.prototype.slice;helpers.bind = Function.prototype.bind;helpers.defineProperty = function(obj, key, value){return Object.defineProperty(obj, key, {value:value, enumerable:true, configurable:true, writable:true});};helpers.asyncToGenerator = function(fn){return function(){var gen=fn.apply(this, arguments);return new _core.Promise(function(resolve, reject){var callNext=step.bind(null, "next");var callThrow=step.bind(null, "throw");function step(key, arg){try{var info=gen[key](arg);var value=info.value;}catch(error) {reject(error);return;}if(info.done){resolve(value);}else {_core.Promise.resolve(value).then(callNext, callThrow);}}callNext();});};};helpers.interopRequireWildcard = function(obj){return obj && obj.__esModule?obj:{"default":obj};};helpers._typeof = function(obj){return obj && obj.constructor === _core.Symbol?"symbol":typeof obj;};helpers._extends = _core.Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};helpers.get = function get(_x, _x2, _x3){var _again=true;_function: while(_again) {_again = false;var object=_x, property=_x2, receiver=_x3;desc = parent = getter = undefined;var desc=_core.Object.getOwnPropertyDescriptor(object, property);if(desc === undefined){var parent=_core.Object.getPrototypeOf(object);if(parent === null){return undefined;}else {_x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;}}else if("value" in desc && desc.writable){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}}};helpers.set = function set(_x, _x2, _x3, _x4){var _again=true;_function: while(_again) {_again = false;var object=_x, property=_x2, value=_x3, receiver=_x4;desc = parent = setter = undefined;var desc=_core.Object.getOwnPropertyDescriptor(object, property);if(desc === undefined){var parent=_core.Object.getPrototypeOf(object);if(parent !== null){_x = parent;_x2 = property;_x3 = value;_x4 = receiver;_again = true;continue _function;}}else if("value" in desc && desc.writable){return desc.value = value;}else {var setter=desc.set;if(setter !== undefined){return setter.call(receiver, value);}}}};helpers.classCallCheck = function(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}};helpers.objectDestructuringEmpty = function(obj){if(obj == null)throw new TypeError("Cannot destructure undefined");};helpers.temporalUndefined = {};helpers.temporalAssertDefined = function(val, name, undef){if(val === undef){throw new ReferenceError(name + " is not defined - temporal dead zone");}return true;};helpers.selfGlobal = typeof global === "undefined"?self:global;}).call(exports, (function(){return this;})());},,,,, function(module, exports, __webpack_require__){"use strict";var _core=__webpack_require__(20)["default"];var _babelHelpers=__webpack_require__(14)["default"];exports.generateTest = generateTest;exports.generateFieldsOn = generateFieldsOn;exports.generateWithDefault = generateWithDefault;exports.generateWithDefaultForSysImmutable = generateWithDefaultForSysImmutable;exports.generateGetDefaultValue = generateGetDefaultValue;var _=_babelHelpers.interopRequire(__webpack_require__(25));var BaseType=_babelHelpers.interopRequire(__webpack_require__(8));function generateTest(){return function(val){return _core.Object.keys(this._spec).every(function(key){return this._spec[key].test(val[key]);}, this);};}function generateFieldsOn(obj, fieldsDefinition){_.forEach(fieldsDefinition, function(fieldDef, fieldName){if(obj[fieldName]){throw new Error("fields that starts with $ character are reserved \"" + obj.constructor.displayName + "." + fieldName + "\".");}Object.defineProperty(obj, fieldName, {get:function get(){return this.__value__[fieldName];}, set:function set(newValue){this.__isInvalidated__ = true;if(this.__isReadOnly__){console.warn("try to set value to readonly field: ", this.constructor.displayName + "." + fieldName, "=", newValue);}else if(fieldDef.type.prototype instanceof BaseType){this.__value__[fieldName].setValue(newValue);}else {this.__value__[fieldName] = newValue;}}, enumerable:true, configurable:false});});}function generateWithDefault(){return function withDefault(defaults, test, options){var def=this.defaults;if(defaults !== undefined){def = typeof defaults === "function"?defaults:function(){return _.clone(defaults, true);};}function typeWithDefault(value, isReadOnly, options){return typeWithDefault.type.create(value, isReadOnly, typeWithDefault.options || options);}typeWithDefault.type = this;typeWithDefault.test = test || this.test;typeWithDefault.withDefault = withDefault.bind(this);typeWithDefault.defaults = def;typeWithDefault.options = options;typeWithDefault.wrapValue = this.wrapValue;typeWithDefault.create = this.create;return typeWithDefault;};}function generateWithDefaultForSysImmutable(Type){return function withDefault(defaults, test){var def=this.defaults;if(defaults !== undefined){def = typeof defaults === "function"?defaults:function(){return defaults;};}function typeWithDefault(value, isReadOnly){return Type(value);}typeWithDefault.type = this.type;typeWithDefault.test = test || this.test;typeWithDefault.withDefault = this.withDefault.bind(this);typeWithDefault.defaults = def;typeWithDefault.wrapValue = Type;typeWithDefault.create = this.create;return typeWithDefault;};}function generateGetDefaultValue(){return function(){var spec=this._spec;var args=arguments;return _core.Object.keys(this._spec).reduce(function(val, key){var fieldSpec=spec[key];val[key] = fieldSpec.defaults.apply(fieldSpec, args);return val;}, {});};}Object.defineProperty(exports, "__esModule", {value:true});}, function(module, exports, __webpack_require__){!(function(global, framework, undefined){"use strict";var OBJECT="Object", FUNCTION="Function", ARRAY="Array", STRING="String", NUMBER="Number", REGEXP="RegExp", DATE="Date", MAP="Map", SET="Set", WEAKMAP="WeakMap", WEAKSET="WeakSet", SYMBOL="Symbol", PROMISE="Promise", MATH="Math", ARGUMENTS="Arguments", PROTOTYPE="prototype", CONSTRUCTOR="constructor", TO_STRING="toString", TO_STRING_TAG=TO_STRING + "Tag", TO_LOCALE="toLocaleString", HAS_OWN="hasOwnProperty", FOR_EACH="forEach", ITERATOR="iterator", FF_ITERATOR="@@" + ITERATOR, PROCESS="process", CREATE_ELEMENT="createElement", Function=global[FUNCTION], Object=global[OBJECT], Array=global[ARRAY], String=global[STRING], Number=global[NUMBER], RegExp=global[REGEXP], Date=global[DATE], Map=global[MAP], Set=global[SET], WeakMap=global[WEAKMAP], WeakSet=global[WEAKSET], Symbol=global[SYMBOL], Math=global[MATH], TypeError=global.TypeError, RangeError=global.RangeError, setTimeout=global.setTimeout, setImmediate=global.setImmediate, clearImmediate=global.clearImmediate, parseInt=global.parseInt, isFinite=global.isFinite, process=global[PROCESS], nextTick=process && process.nextTick, document=global.document, html=document && document.documentElement, navigator=global.navigator, define=global.define, console=global.console || {}, ArrayProto=Array[PROTOTYPE], ObjectProto=Object[PROTOTYPE], FunctionProto=Function[PROTOTYPE], Infinity=1 / 0, DOT=".";function isObject(it){return it !== null && (typeof it == "object" || typeof it == "function");}function isFunction(it){return typeof it == "function";}var isNative=ctx(/./.test, /\[native code\]\s*\}\s*$/, 1);var toString=ObjectProto[TO_STRING];function setToStringTag(it, tag, stat){if(it && !has(it = stat?it:it[PROTOTYPE], SYMBOL_TAG))hidden(it, SYMBOL_TAG, tag);}function cof(it){return toString.call(it).slice(8, -1);}function classof(it){var O, T;return it == undefined?it === undefined?"Undefined":"Null":typeof (T = (O = Object(it))[SYMBOL_TAG]) == "string"?T:cof(O);}var call=FunctionProto.call, apply=FunctionProto.apply, REFERENCE_GET;function part(){var fn=assertFunction(this), length=arguments.length, args=Array(length), i=0, _=path._, holder=false;while(length > i) if((args[i] = arguments[i++]) === _)holder = true;return function(){var that=this, _length=arguments.length, i=0, j=0, _args;if(!holder && !_length)return invoke(fn, args, that);_args = args.slice();if(holder)for(; length > i; i++) if(_args[i] === _)_args[i] = arguments[j++];while(_length > j) _args.push(arguments[j++]);return invoke(fn, _args, that);};}function ctx(fn, that, length){assertFunction(fn);if(~length && that === undefined){return fn;}switch(length){case 1:return function(a){return fn.call(that, a);};case 2:return function(a, b){return fn.call(that, a, b);};case 3:return function(a, b, c){return fn.call(that, a, b, c);};}return function(){return fn.apply(that, arguments);};}function invoke(fn, args, that){var un=that === undefined;switch(args.length | 0){case 0:return un?fn():fn.call(that);case 1:return un?fn(args[0]):fn.call(that, args[0]);case 2:return un?fn(args[0], args[1]):fn.call(that, args[0], args[1]);case 3:return un?fn(args[0], args[1], args[2]):fn.call(that, args[0], args[1], args[2]);case 4:return un?fn(args[0], args[1], args[2], args[3]):fn.call(that, args[0], args[1], args[2], args[3]);case 5:return un?fn(args[0], args[1], args[2], args[3], args[4]):fn.call(that, args[0], args[1], args[2], args[3], args[4]);}return fn.apply(that, args);}var create=Object.create, getPrototypeOf=Object.getPrototypeOf, setPrototypeOf=Object.setPrototypeOf, defineProperty=Object.defineProperty, defineProperties=Object.defineProperties, getOwnDescriptor=Object.getOwnPropertyDescriptor, getKeys=Object.keys, getNames=Object.getOwnPropertyNames, getSymbols=Object.getOwnPropertySymbols, isFrozen=Object.isFrozen, has=ctx(call, ObjectProto[HAS_OWN], 2), ES5Object=Object, Dict;function toObject(it){return ES5Object(assertDefined(it));}function returnIt(it){return it;}function returnThis(){return this;}function get(object, key){if(has(object, key)){return object[key];}}function ownKeys(it){assertObject(it);return getSymbols?getNames(it).concat(getSymbols(it)):getNames(it);}var assign=Object.assign || function(target, source){var T=Object(assertDefined(target)), l=arguments.length, i=1;while(l > i) {var S=ES5Object(arguments[i++]), keys=getKeys(S), length=keys.length, j=0, key;while(length > j) T[key = keys[j++]] = S[key];}return T;};function keyOf(object, el){var O=toObject(object), keys=getKeys(O), length=keys.length, index=0, key;while(length > index) if(O[key = keys[index++]] === el){return key;}}function array(it){return String(it).split(",");}var push=ArrayProto.push, unshift=ArrayProto.unshift, slice=ArrayProto.slice, splice=ArrayProto.splice, indexOf=ArrayProto.indexOf, forEach=ArrayProto[FOR_EACH];function createArrayMethod(type){var isMap=type == 1, isFilter=type == 2, isSome=type == 3, isEvery=type == 4, isFindIndex=type == 6, noholes=type == 5 || isFindIndex;return function(callbackfn){var O=Object(assertDefined(this)), that=arguments[1], self=ES5Object(O), f=ctx(callbackfn, that, 3), length=toLength(self.length), index=0, result=isMap?Array(length):isFilter?[]:undefined, val, res;for(; length > index; index++) if(noholes || index in self){val = self[index];res = f(val, index, O);if(type){if(isMap)result[index] = res;else if(res)switch(type){case 3:return true;case 5:return val;case 6:return index;case 2:result.push(val);}else if(isEvery)return false;}}return isFindIndex?-1:isSome || isEvery?isEvery:result;};}function createArrayContains(isContains){return function(el){var O=toObject(this), length=toLength(O.length), index=toIndex(arguments[1], length);if(isContains && el != el){for(; length > index; index++) if(sameNaN(O[index]))return isContains || index;}else for(; length > index; index++) if(isContains || index in O){if(O[index] === el)return isContains || index;}return !isContains && -1;};}function generic(A, B){return typeof A == "function"?A:B;}var MAX_SAFE_INTEGER=9007199254740991, pow=Math.pow, abs=Math.abs, ceil=Math.ceil, floor=Math.floor, max=Math.max, min=Math.min, random=Math.random, trunc=Math.trunc || function(it){return (it > 0?floor:ceil)(it);};function sameNaN(number){return number != number;}function toInteger(it){return isNaN(it)?0:trunc(it);}function toLength(it){return it > 0?min(toInteger(it), MAX_SAFE_INTEGER):0;}function toIndex(index, length){var index=toInteger(index);return index < 0?max(index + length, 0):min(index, length);}function lz(num){return num > 9?num:"0" + num;}function createReplacer(regExp, replace, isStatic){var replacer=isObject(replace)?function(part){return replace[part];}:replace;return function(it){return String(isStatic?it:this).replace(regExp, replacer);};}function createPointAt(toString){return function(pos){var s=String(assertDefined(this)), i=toInteger(pos), l=s.length, a, b;if(i < 0 || i >= l)return toString?"":undefined;a = s.charCodeAt(i);return a < 55296 || a > 56319 || i + 1 === l || (b = s.charCodeAt(i + 1)) < 56320 || b > 57343?toString?s.charAt(i):a:toString?s.slice(i, i + 2):(a - 55296 << 10) + (b - 56320) + 65536;};}var REDUCE_ERROR="Reduce of empty object with no initial value";function assert(condition, msg1, msg2){if(!condition)throw TypeError(msg2?msg1 + msg2:msg1);}function assertDefined(it){if(it == undefined)throw TypeError("Function called on null or undefined");return it;}function assertFunction(it){assert(isFunction(it), it, " is not a function!");return it;}function assertObject(it){assert(isObject(it), it, " is not an object!");return it;}function assertInstance(it, Constructor, name){assert(it instanceof Constructor, name, ": use the 'new' operator!");}function descriptor(bitmap, value){return {enumerable:!(bitmap & 1), configurable:!(bitmap & 2), writable:!(bitmap & 4), value:value};}function simpleSet(object, key, value){object[key] = value;return object;}function createDefiner(bitmap){return DESC?function(object, key, value){return defineProperty(object, key, descriptor(bitmap, value));}:simpleSet;}function uid(key){return SYMBOL + "(" + key + ")_" + (++sid + random())[TO_STRING](36);}function getWellKnownSymbol(name, setter){return Symbol && Symbol[name] || (setter?Symbol:safeSymbol)(SYMBOL + DOT + name);}var DESC=!!(function(){try{return defineProperty({}, "a", {get:function get(){return 2;}}).a == 2;}catch(e) {}})(), sid=0, hidden=createDefiner(1), set=Symbol?simpleSet:hidden, safeSymbol=Symbol || uid;function assignHidden(target, src){for(var key in src) hidden(target, key, src[key]);return target;}var SYMBOL_UNSCOPABLES=getWellKnownSymbol("unscopables"), ArrayUnscopables=ArrayProto[SYMBOL_UNSCOPABLES] || {}, SYMBOL_TAG=getWellKnownSymbol(TO_STRING_TAG), SYMBOL_SPECIES=getWellKnownSymbol("species"), SYMBOL_ITERATOR;function setSpecies(C){if(DESC && (framework || !isNative(C)))defineProperty(C, SYMBOL_SPECIES, {configurable:true, get:returnThis});}var NODE=cof(process) == PROCESS, core={}, path=framework?global:core, old=global.core, exportGlobal, FORCED=1, GLOBAL=2, STATIC=4, PROTO=8, BIND=16, WRAP=32;function $define(type, name, source){var key, own, out, exp, isGlobal=type & GLOBAL, target=isGlobal?global:type & STATIC?global[name]:(global[name] || ObjectProto)[PROTOTYPE], exports=isGlobal?core:core[name] || (core[name] = {});if(isGlobal)source = name;for(key in source) {own = !(type & FORCED) && target && key in target && (!isFunction(target[key]) || isNative(target[key]));out = (own?target:source)[key];if(!framework && isGlobal && !isFunction(target[key]))exp = source[key];else if(type & BIND && own)exp = ctx(out, global);else if(type & WRAP && !framework && target[key] == out){exp = function(param){return this instanceof out?new out(param):out(param);};exp[PROTOTYPE] = out[PROTOTYPE];}else exp = type & PROTO && isFunction(out)?ctx(call, out):out;if(framework && target && !own){if(isGlobal)target[key] = out;else delete target[key] && hidden(target, key, out);}if(exports[key] != out)hidden(exports, key, exp);}}if(typeof module != "undefined" && module.exports)module.exports = core;else if(isFunction(define) && define.amd)define(function(){return core;});else exportGlobal = true;if(exportGlobal || framework){core.noConflict = function(){global.core = old;return core;};global.core = core;}SYMBOL_ITERATOR = getWellKnownSymbol(ITERATOR);var ITER=safeSymbol("iter"), KEY=1, VALUE=2, Iterators={}, IteratorPrototype={}, BUGGY_ITERATORS="keys" in ArrayProto && !("next" in [].keys());setIterator(IteratorPrototype, returnThis);function setIterator(O, value){hidden(O, SYMBOL_ITERATOR, value);FF_ITERATOR in ArrayProto && hidden(O, FF_ITERATOR, value);}function createIterator(Constructor, NAME, next, proto){Constructor[PROTOTYPE] = create(proto || IteratorPrototype, {next:descriptor(1, next)});setToStringTag(Constructor, NAME + " Iterator");}function defineIterator(Constructor, NAME, value, DEFAULT){var proto=Constructor[PROTOTYPE], iter=get(proto, SYMBOL_ITERATOR) || get(proto, FF_ITERATOR) || DEFAULT && get(proto, DEFAULT) || value;if(framework){setIterator(proto, iter);if(iter !== value){var iterProto=getPrototypeOf(iter.call(new Constructor()));setToStringTag(iterProto, NAME + " Iterator", true);has(proto, FF_ITERATOR) && setIterator(iterProto, returnThis);}}Iterators[NAME] = iter;Iterators[NAME + " Iterator"] = returnThis;return iter;}function defineStdIterators(Base, NAME, Constructor, next, DEFAULT, IS_SET){function createIter(kind){return function(){return new Constructor(this, kind);};}createIterator(Constructor, NAME, next);var entries=createIter(KEY + VALUE), values=createIter(VALUE);if(DEFAULT == VALUE)values = defineIterator(Base, NAME, values, "values");else entries = defineIterator(Base, NAME, entries, "entries");if(DEFAULT){$define(PROTO + FORCED * BUGGY_ITERATORS, NAME, {entries:entries, keys:IS_SET?values:createIter(KEY), values:values});}}function iterResult(done, value){return {value:value, done:!!done};}function isIterable(it){var O=Object(it), Symbol=global[SYMBOL], hasExt=((Symbol && Symbol[ITERATOR] || FF_ITERATOR) in O);return hasExt || SYMBOL_ITERATOR in O || has(Iterators, classof(O));}function getIterator(it){var Symbol=global[SYMBOL], ext=it[Symbol && Symbol[ITERATOR] || FF_ITERATOR], getIter=ext || it[SYMBOL_ITERATOR] || Iterators[classof(it)];return assertObject(getIter.call(it));}function stepCall(fn, value, entries){return entries?invoke(fn, value):fn(value);}function checkDangerIterClosing(fn){var danger=true;var O={next:function next(){throw 1;}, "return":function(){danger = false;}};O[SYMBOL_ITERATOR] = returnThis;try{fn(O);}catch(e) {}return danger;}function closeIterator(iterator){var ret=iterator["return"];if(ret !== undefined)ret.call(iterator);}function safeIterClose(exec, iterator){try{exec(iterator);}catch(e) {closeIterator(iterator);throw e;}}function forOf(iterable, entries, fn, that){safeIterClose(function(iterator){var f=ctx(fn, that, entries?2:1), step;while(!(step = iterator.next()).done) if(stepCall(f, step.value, entries) === false){return closeIterator(iterator);}}, getIterator(iterable));}!(function(TAG, SymbolRegistry, AllSymbols, setter){if(!isNative(Symbol)){Symbol = function(description){assert(!(this instanceof Symbol), SYMBOL + " is not a " + CONSTRUCTOR);var tag=uid(description), sym=set(create(Symbol[PROTOTYPE]), TAG, tag);AllSymbols[tag] = sym;DESC && setter && defineProperty(ObjectProto, tag, {configurable:true, set:function set(value){hidden(this, tag, value);}});return sym;};hidden(Symbol[PROTOTYPE], TO_STRING, function(){return this[TAG];});}$define(GLOBAL + WRAP, {Symbol:Symbol});var symbolStatics={"for":function(key){return has(SymbolRegistry, key += "")?SymbolRegistry[key]:SymbolRegistry[key] = Symbol(key);}, iterator:SYMBOL_ITERATOR || getWellKnownSymbol(ITERATOR), keyFor:part.call(keyOf, SymbolRegistry), species:SYMBOL_SPECIES, toStringTag:SYMBOL_TAG = getWellKnownSymbol(TO_STRING_TAG, true), unscopables:SYMBOL_UNSCOPABLES, pure:safeSymbol, set:set, useSetter:function useSetter(){setter = true;}, useSimple:function useSimple(){setter = false;}};forEach.call(array("hasInstance,isConcatSpreadable,match,replace,search,split,toPrimitive"), function(it){symbolStatics[it] = getWellKnownSymbol(it);});$define(STATIC, SYMBOL, symbolStatics);setToStringTag(Symbol, SYMBOL);$define(STATIC + FORCED * !isNative(Symbol), OBJECT, {getOwnPropertyNames:function getOwnPropertyNames(it){var names=getNames(toObject(it)), result=[], key, i=0;while(names.length > i) has(AllSymbols, key = names[i++]) || result.push(key);return result;}, getOwnPropertySymbols:function getOwnPropertySymbols(it){var names=getNames(toObject(it)), result=[], key, i=0;while(names.length > i) has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);return result;}});setToStringTag(Math, MATH, true);setToStringTag(global.JSON, "JSON", true);})(safeSymbol("tag"), {}, {}, true);!(function(){var objectStatic={assign:assign, is:function is(x, y){return x === y?x !== 0 || 1 / x === 1 / y:x != x && y != y;}};"__proto__" in ObjectProto && (function(buggy, set){try{set = ctx(call, getOwnDescriptor(ObjectProto, "__proto__").set, 2);set({}, ArrayProto);}catch(e) {buggy = true;}objectStatic.setPrototypeOf = setPrototypeOf = setPrototypeOf || function(O, proto){assertObject(O);assert(proto === null || isObject(proto), proto, ": can't set as prototype!");if(buggy)O.__proto__ = proto;else set(O, proto);return O;};})();$define(STATIC, OBJECT, objectStatic);})();!(function(){function wrapObjectMethod(key, MODE){var fn=Object[key], exp=core[OBJECT][key], f=0, o={};if(!exp || isNative(exp)){o[key] = MODE == 1?function(it){return isObject(it)?fn(it):it;}:MODE == 2?function(it){return isObject(it)?fn(it):true;}:MODE == 3?function(it){return isObject(it)?fn(it):false;}:MODE == 4?function(it, key){return fn(toObject(it), key);}:function(it){return fn(toObject(it));};try{fn(DOT);}catch(e) {f = 1;}$define(STATIC + FORCED * f, OBJECT, o);}}wrapObjectMethod("freeze", 1);wrapObjectMethod("seal", 1);wrapObjectMethod("preventExtensions", 1);wrapObjectMethod("isFrozen", 2);wrapObjectMethod("isSealed", 2);wrapObjectMethod("isExtensible", 3);wrapObjectMethod("getOwnPropertyDescriptor", 4);wrapObjectMethod("getPrototypeOf");wrapObjectMethod("keys");wrapObjectMethod("getOwnPropertyNames");})();!(function(isInteger){$define(STATIC, NUMBER, {EPSILON:pow(2, -52), isFinite:(function(_isFinite){var _isFiniteWrapper=function isFinite(_x){return _isFinite.apply(this, arguments);};_isFiniteWrapper.toString = function(){return _isFinite.toString();};return _isFiniteWrapper;})(function(it){return typeof it == "number" && isFinite(it);}), isInteger:isInteger, isNaN:sameNaN, isSafeInteger:function isSafeInteger(number){return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;}, MAX_SAFE_INTEGER:MAX_SAFE_INTEGER, MIN_SAFE_INTEGER:-MAX_SAFE_INTEGER, parseFloat:parseFloat, parseInt:parseInt});})(Number.isInteger || function(it){return !isObject(it) && isFinite(it) && floor(it) === it;});!(function(){var E=Math.E, exp=Math.exp, log=Math.log, sqrt=Math.sqrt, sign=Math.sign || function(x){return (x = +x) == 0 || x != x?x:x < 0?-1:1;};function asinh(x){return !isFinite(x = +x) || x == 0?x:x < 0?-asinh(-x):log(x + sqrt(x * x + 1));}function expm1(x){return (x = +x) == 0?x:x > -0.000001 && x < 0.000001?x + x * x / 2:exp(x) - 1;}$define(STATIC, MATH, {acosh:function acosh(x){return (x = +x) < 1?NaN:isFinite(x)?log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1:x;}, asinh:asinh, atanh:function atanh(x){return (x = +x) == 0?x:log((1 + x) / (1 - x)) / 2;}, cbrt:function cbrt(x){return sign(x = +x) * pow(abs(x), 1 / 3);}, clz32:function clz32(x){return (x >>>= 0)?32 - x[TO_STRING](2).length:32;}, cosh:function cosh(x){return (exp(x = +x) + exp(-x)) / 2;}, expm1:expm1, fround:function fround(x){return new Float32Array([x])[0];}, hypot:function hypot(value1, value2){var sum=0, len1=arguments.length, len2=len1, args=Array(len1), larg=-Infinity, arg;while(len1--) {arg = args[len1] = +arguments[len1];if(arg == Infinity || arg == -Infinity){return Infinity;}if(arg > larg)larg = arg;}larg = arg || 1;while(len2--) sum += pow(args[len2] / larg, 2);return larg * sqrt(sum);}, imul:function imul(x, y){var UInt16=65535, xn=+x, yn=+y, xl=UInt16 & xn, yl=UInt16 & yn;return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);}, log1p:function log1p(x){return (x = +x) > -1e-8 && x < 1e-8?x - x * x / 2:log(1 + x);}, log10:function log10(x){return log(x) / Math.LN10;}, log2:function log2(x){return log(x) / Math.LN2;}, sign:sign, sinh:function sinh(x){return abs(x = +x) < 1?(expm1(x) - expm1(-x)) / 2:(exp(x - 1) - exp(-x - 1)) * (E / 2);}, tanh:function tanh(x){var a=expm1(x = +x), b=expm1(-x);return a == Infinity?1:b == Infinity?-1:(a - b) / (exp(x) + exp(-x));}, trunc:trunc});})();!(function(fromCharCode){function assertNotRegExp(it){if(cof(it) == REGEXP)throw TypeError();}$define(STATIC, STRING, {fromCodePoint:function fromCodePoint(x){var res=[], len=arguments.length, i=0, code;while(len > i) {code = +arguments[i++];if(toIndex(code, 1114111) !== code)throw RangeError(code + " is not a valid code point");res.push(code < 65536?fromCharCode(code):fromCharCode(((code -= 65536) >> 10) + 55296, code % 1024 + 56320));}return res.join("");}, raw:(function(_raw){var _rawWrapper=function raw(_x){return _raw.apply(this, arguments);};_rawWrapper.toString = function(){return _raw.toString();};return _rawWrapper;})(function(callSite){var raw=toObject(callSite.raw), len=toLength(raw.length), sln=arguments.length, res=[], i=0;while(len > i) {res.push(String(raw[i++]));if(i < sln)res.push(String(arguments[i]));}return res.join("");})});$define(PROTO, STRING, {codePointAt:createPointAt(false), endsWith:function endsWith(searchString){assertNotRegExp(searchString);var that=String(assertDefined(this)), endPosition=arguments[1], len=toLength(that.length), end=endPosition === undefined?len:min(toLength(endPosition), len);searchString += "";return that.slice(end - searchString.length, end) === searchString;}, includes:function includes(searchString){assertNotRegExp(searchString);return !! ~String(assertDefined(this)).indexOf(searchString, arguments[1]);}, repeat:function repeat(count){var str=String(assertDefined(this)), res="", n=toInteger(count);if(0 > n || n == Infinity)throw RangeError("Count can't be negative");for(; n > 0; (n >>>= 1) && (str += str)) if(n & 1)res += str;return res;}, startsWith:function startsWith(searchString){assertNotRegExp(searchString);var that=String(assertDefined(this)), index=toLength(min(arguments[1], that.length));searchString += "";return that.slice(index, index + searchString.length) === searchString;}});})(String.fromCharCode);!(function(){$define(STATIC + FORCED * checkDangerIterClosing(Array.from), ARRAY, {from:function from(arrayLike){var O=Object(assertDefined(arrayLike)), mapfn=arguments[1], mapping=mapfn !== undefined, f=mapping?ctx(mapfn, arguments[2], 2):undefined, index=0, length, result, step;if(isIterable(O)){result = new (generic(this, Array))();safeIterClose(function(iterator){for(; !(step = iterator.next()).done; index++) {result[index] = mapping?f(step.value, index):step.value;}}, getIterator(O));}else {result = new (generic(this, Array))(length = toLength(O.length));for(; length > index; index++) {result[index] = mapping?f(O[index], index):O[index];}}result.length = index;return result;}});$define(STATIC, ARRAY, {of:function of(){var index=0, length=arguments.length, result=new (generic(this, Array))(length);while(length > index) result[index] = arguments[index++];result.length = length;return result;}});setSpecies(Array);})();!(function(){$define(PROTO, ARRAY, {copyWithin:function copyWithin(target, start){var O=Object(assertDefined(this)), len=toLength(O.length), to=toIndex(target, len), from=toIndex(start, len), end=arguments[2], fin=end === undefined?len:toIndex(end, len), count=min(fin - from, len - to), inc=1;if(from < to && to < from + count){inc = -1;from = from + count - 1;to = to + count - 1;}while(count-- > 0) {if(from in O)O[to] = O[from];else delete O[to];to += inc;from += inc;}return O;}, fill:function fill(value){var O=Object(assertDefined(this)), length=toLength(O.length), index=toIndex(arguments[1], length), end=arguments[2], endPos=end === undefined?length:toIndex(end, length);while(endPos > index) O[index++] = value;return O;}, find:createArrayMethod(5), findIndex:createArrayMethod(6)});if(framework){forEach.call(array("find,findIndex,fill,copyWithin,entries,keys,values"), function(it){ArrayUnscopables[it] = true;});SYMBOL_UNSCOPABLES in ArrayProto || hidden(ArrayProto, SYMBOL_UNSCOPABLES, ArrayUnscopables);}})();!(function(at){defineStdIterators(Array, ARRAY, function(iterated, kind){set(this, ITER, {o:toObject(iterated), i:0, k:kind});}, function(){var iter=this[ITER], O=iter.o, kind=iter.k, index=iter.i++;if(!O || index >= O.length){iter.o = undefined;return iterResult(1);}if(kind == KEY)return iterResult(0, index);if(kind == VALUE)return iterResult(0, O[index]);return iterResult(0, [index, O[index]]);}, VALUE);Iterators[ARGUMENTS] = Iterators[ARRAY];defineStdIterators(String, STRING, function(iterated){set(this, ITER, {o:String(iterated), i:0});}, function(){var iter=this[ITER], O=iter.o, index=iter.i, point;if(index >= O.length)return iterResult(1);point = at.call(O, index);iter.i += point.length;return iterResult(0, point);});})(createPointAt(true));isFunction(setImmediate) && isFunction(clearImmediate) || (function(ONREADYSTATECHANGE){var postMessage=global.postMessage, addEventListener=global.addEventListener, MessageChannel=global.MessageChannel, counter=0, queue={}, defer, channel, port;setImmediate = function(fn){var args=[], i=1;while(arguments.length > i) args.push(arguments[i++]);queue[++counter] = function(){invoke(isFunction(fn)?fn:Function(fn), args);};defer(counter);return counter;};clearImmediate = function(id){delete queue[id];};function run(id){if(has(queue, id)){var fn=queue[id];delete queue[id];fn();}}function listner(event){run(event.data);}if(NODE){defer = function(id){nextTick(part.call(run, id));};}else if(addEventListener && isFunction(postMessage) && !global.importScripts){defer = function(id){postMessage(id, "*");};addEventListener("message", listner, false);}else if(isFunction(MessageChannel)){channel = new MessageChannel();port = channel.port2;channel.port1.onmessage = listner;defer = ctx(port.postMessage, port, 1);}else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]("script")){defer = function(id){html.appendChild(document[CREATE_ELEMENT]("script"))[ONREADYSTATECHANGE] = function(){html.removeChild(this);run(id);};};}else {defer = function(id){setTimeout(run, 0, id);};}})("onreadystatechange");$define(GLOBAL + BIND, {setImmediate:setImmediate, clearImmediate:clearImmediate});!(function(Promise, test){isFunction(Promise) && isFunction(Promise.resolve) && Promise.resolve(test = new Promise(function(){})) == test || (function(asap, RECORD){function isThenable(it){var then;if(isObject(it))then = it.then;return isFunction(then)?then:false;}function handledRejectionOrHasOnRejected(promise){var record=promise[RECORD], chain=record.c, i=0, react;if(record.h){return true;}while(chain.length > i) {react = chain[i++];if(react.fail || handledRejectionOrHasOnRejected(react.P)){return true;}}}function notify(record, reject){var chain=record.c;if(reject || chain.length)asap(function(){var promise=record.p, value=record.v, ok=record.s == 1, i=0;if(reject && !handledRejectionOrHasOnRejected(promise)){setTimeout(function(){if(!handledRejectionOrHasOnRejected(promise)){if(NODE){if(!process.emit("unhandledRejection", value, promise)){}}else if(isFunction(console.error)){console.error("Unhandled promise rejection", value);}}}, 1000);}else while(chain.length > i) !(function(react){var cb=ok?react.ok:react.fail, ret, then;try{if(cb){if(!ok)record.h = true;ret = cb === true?value:cb(value);if(ret === react.P){react.rej(TypeError(PROMISE + "-chain cycle"));}else if(then = isThenable(ret)){then.call(ret, react.res, react.rej);}else react.res(ret);}else react.rej(value);}catch(err) {react.rej(err);}})(chain[i++]);chain.length = 0;});}function resolve(value){var record=this, then, wrapper;if(record.d){return;}record.d = true;record = record.r || record;try{if(then = isThenable(value)){wrapper = {r:record, d:false};then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));}else {record.v = value;record.s = 1;notify(record);}}catch(err) {reject.call(wrapper || {r:record, d:false}, err);}}function reject(value){var record=this;if(record.d){return;}record.d = true;record = record.r || record;record.v = value;record.s = 2;notify(record, true);}function getConstructor(C){var S=assertObject(C)[SYMBOL_SPECIES];return S != undefined?S:C;}Promise = function(executor){assertFunction(executor);assertInstance(this, Promise, PROMISE);var record={p:this, c:[], s:0, d:false, v:undefined, h:false};hidden(this, RECORD, record);try{executor(ctx(resolve, record, 1), ctx(reject, record, 1));}catch(err) {reject.call(record, err);}};assignHidden(Promise[PROTOTYPE], {then:function then(onFulfilled, onRejected){var S=assertObject(assertObject(this)[CONSTRUCTOR])[SYMBOL_SPECIES];var react={ok:isFunction(onFulfilled)?onFulfilled:true, fail:isFunction(onRejected)?onRejected:false}, P=react.P = new (S != undefined?S:Promise)(function(resolve, reject){react.res = assertFunction(resolve);react.rej = assertFunction(reject);}), record=this[RECORD];record.c.push(react);record.s && notify(record);return P;}, "catch":function(onRejected){return this.then(undefined, onRejected);}});assignHidden(Promise, {all:function all(iterable){var Promise=getConstructor(this), values=[];return new Promise(function(resolve, reject){forOf(iterable, false, push, values);var remaining=values.length, results=Array(remaining);if(remaining)forEach.call(values, function(promise, index){Promise.resolve(promise).then(function(value){results[index] = value;--remaining || resolve(results);}, reject);});else resolve(results);});}, race:function race(iterable){var Promise=getConstructor(this);return new Promise(function(resolve, reject){forOf(iterable, false, function(promise){Promise.resolve(promise).then(resolve, reject);});});}, reject:function reject(r){return new (getConstructor(this))(function(resolve, reject){reject(r);});}, resolve:function resolve(x){return isObject(x) && RECORD in x && getPrototypeOf(x) === this[PROTOTYPE]?x:new (getConstructor(this))(function(resolve, reject){resolve(x);});}});})(nextTick || setImmediate, safeSymbol("record"));setToStringTag(Promise, PROMISE);setSpecies(Promise);$define(GLOBAL + FORCED * !isNative(Promise), {Promise:Promise});})(global[PROMISE]);!(function(){var UID=safeSymbol("uid"), O1=safeSymbol("O1"), WEAK=safeSymbol("weak"), LEAK=safeSymbol("leak"), LAST=safeSymbol("last"), FIRST=safeSymbol("first"), SIZE=DESC?safeSymbol("size"):"size", uid=0, tmp={};function getCollection(C, NAME, methods, commonMethods, isMap, isWeak){var ADDER=isMap?"set":"add", proto=C && C[PROTOTYPE], O={};function initFromIterable(that, iterable){if(iterable != undefined)forOf(iterable, isMap, that[ADDER], that);return that;}function fixSVZ(key, chain){var method=proto[key];if(framework)proto[key] = function(a, b){var result=method.call(this, a === 0?0:a, b);return chain?this:result;};}if(!isNative(C) || !(isWeak || !BUGGY_ITERATORS && has(proto, FOR_EACH) && has(proto, "entries"))){C = isWeak?function(iterable){assertInstance(this, C, NAME);set(this, UID, uid++);initFromIterable(this, iterable);}:function(iterable){var that=this;assertInstance(that, C, NAME);set(that, O1, create(null));set(that, SIZE, 0);set(that, LAST, undefined);set(that, FIRST, undefined);initFromIterable(that, iterable);};assignHidden(assignHidden(C[PROTOTYPE], methods), commonMethods);isWeak || !DESC || defineProperty(C[PROTOTYPE], "size", {get:function get(){return assertDefined(this[SIZE]);}});}else {var Native=C, inst=new C(), chain=inst[ADDER](isWeak?{}:-0, 1), buggyZero;if(checkDangerIterClosing(function(O){new C(O);})){C = function(iterable){assertInstance(this, C, NAME);return initFromIterable(new Native(), iterable);};C[PROTOTYPE] = proto;if(framework)proto[CONSTRUCTOR] = C;}isWeak || inst[FOR_EACH](function(val, key){buggyZero = 1 / key === -Infinity;});if(buggyZero){fixSVZ("delete");fixSVZ("has");isMap && fixSVZ("get");}if(buggyZero || chain !== inst)fixSVZ(ADDER, true);}setToStringTag(C, NAME);setSpecies(C);O[NAME] = C;$define(GLOBAL + WRAP + FORCED * !isNative(C), O);isWeak || defineStdIterators(C, NAME, function(iterated, kind){set(this, ITER, {o:iterated, k:kind});}, function(){var iter=this[ITER], kind=iter.k, entry=iter.l;while(entry && entry.r) entry = entry.p;if(!iter.o || !(iter.l = entry = entry?entry.n:iter.o[FIRST])){iter.o = undefined;return iterResult(1);}if(kind == KEY)return iterResult(0, entry.k);if(kind == VALUE)return iterResult(0, entry.v);return iterResult(0, [entry.k, entry.v]);}, isMap?KEY + VALUE:VALUE, !isMap);return C;}function fastKey(it, create){if(!isObject(it)){return (typeof it == "string"?"S":"P") + it;}if(isFrozen(it)){return "F";}if(!has(it, UID)){if(!create){return "E";}hidden(it, UID, ++uid);}return "O" + it[UID];}function getEntry(that, key){var index=fastKey(key), entry;if(index != "F"){return that[O1][index];}for(entry = that[FIRST]; entry; entry = entry.n) {if(entry.k == key){return entry;}}}function def(that, key, value){var entry=getEntry(that, key), prev, index;if(entry)entry.v = value;else {that[LAST] = entry = {i:index = fastKey(key, true), k:key, v:value, p:prev = that[LAST], n:undefined, r:false};if(!that[FIRST])that[FIRST] = entry;if(prev)prev.n = entry;that[SIZE]++;if(index != "F")that[O1][index] = entry;}return that;}var collectionMethods={clear:function clear(){for(var that=this, data=that[O1], entry=that[FIRST]; entry; entry = entry.n) {entry.r = true;if(entry.p)entry.p = entry.p.n = undefined;delete data[entry.i];}that[FIRST] = that[LAST] = undefined;that[SIZE] = 0;}, "delete":function(key){var that=this, entry=getEntry(that, key);if(entry){var next=entry.n, prev=entry.p;delete that[O1][entry.i];entry.r = true;if(prev)prev.n = next;if(next)next.p = prev;if(that[FIRST] == entry)that[FIRST] = next;if(that[LAST] == entry)that[LAST] = prev;that[SIZE]--;}return !!entry;}, forEach:function forEach(callbackfn){var f=ctx(callbackfn, arguments[1], 3), entry;while(entry = entry?entry.n:this[FIRST]) {f(entry.v, entry.k, this);while(entry && entry.r) entry = entry.p;}}, has:function has(key){return !!getEntry(this, key);}};Map = getCollection(Map, MAP, {get:function get(key){var entry=getEntry(this, key);return entry && entry.v;}, set:function set(key, value){return def(this, key === 0?0:key, value);}}, collectionMethods, true);Set = getCollection(Set, SET, {add:function add(value){return def(this, value = value === 0?0:value, value);}}, collectionMethods);function defWeak(that, key, value){if(isFrozen(assertObject(key)))leakStore(that).set(key, value);else {has(key, WEAK) || hidden(key, WEAK, {});key[WEAK][that[UID]] = value;}return that;}function leakStore(that){return that[LEAK] || hidden(that, LEAK, new Map())[LEAK];}var weakMethods={"delete":function(key){if(!isObject(key))return false;if(isFrozen(key))return leakStore(this)["delete"](key);return has(key, WEAK) && has(key[WEAK], this[UID]) && delete key[WEAK][this[UID]];}, has:(function(_has){var _hasWrapper=function has(_x){return _has.apply(this, arguments);};_hasWrapper.toString = function(){return _has.toString();};return _hasWrapper;})(function(key){if(!isObject(key))return false;if(isFrozen(key))return leakStore(this).has(key);return has(key, WEAK) && has(key[WEAK], this[UID]);})};WeakMap = getCollection(WeakMap, WEAKMAP, {get:function get(key){if(isObject(key)){if(isFrozen(key)){return leakStore(this).get(key);}if(has(key, WEAK)){return key[WEAK][this[UID]];}}}, set:function set(key, value){return defWeak(this, key, value);}}, weakMethods, true, true);if(framework && new WeakMap().set(Object.freeze(tmp), 7).get(tmp) != 7){forEach.call(array("delete,has,get,set"), function(key){var method=WeakMap[PROTOTYPE][key];WeakMap[PROTOTYPE][key] = function(a, b){if(isObject(a) && isFrozen(a)){var result=leakStore(this)[key](a, b);return key == "set"?this:result;}return method.call(this, a, b);};});}WeakSet = getCollection(WeakSet, WEAKSET, {add:function add(value){return defWeak(this, value, true);}}, weakMethods, false, true);})();!(function(){function Enumerate(iterated){var keys=[], key;for(key in iterated) keys.push(key);set(this, ITER, {o:iterated, a:keys, i:0});}createIterator(Enumerate, OBJECT, function(){var iter=this[ITER], keys=iter.a, key;do{if(iter.i >= keys.length)return iterResult(1);}while(!((key = keys[iter.i++]) in iter.o));return iterResult(0, key);});function wrap(fn){return function(it){assertObject(it);try{return (fn.apply(undefined, arguments), true);}catch(e) {return false;}};}function reflectGet(_x, _x2){var _arguments=arguments;var _again=true;_function2: while(_again) {_again = false;var target=_x, propertyKey=_x2;receiver = desc = proto = undefined;var receiver=_arguments.length < 3?target:_arguments[2], desc=getOwnDescriptor(assertObject(target), propertyKey), proto;if(desc){return has(desc, "value")?desc.value:desc.get === undefined?undefined:desc.get.call(receiver);}if(isObject(proto = getPrototypeOf(target))){_arguments = [_x = proto, _x2 = propertyKey, receiver];_again = true;continue _function2;}else {return undefined;}}}function reflectSet(_x, _x2, _x3){var _arguments=arguments;var _again=true;_function2: while(_again) {_again = false;var target=_x, propertyKey=_x2, V=_x3;receiver = ownDesc = existingDescriptor = proto = undefined;var receiver=_arguments.length < 4?target:_arguments[3], ownDesc=getOwnDescriptor(assertObject(target), propertyKey), existingDescriptor, proto;if(!ownDesc){if(isObject(proto = getPrototypeOf(target))){_arguments = [_x = proto, _x2 = propertyKey, _x3 = V, receiver];_again = true;continue _function2;}ownDesc = descriptor(0);}if(has(ownDesc, "value")){if(ownDesc.writable === false || !isObject(receiver)){return false;}existingDescriptor = getOwnDescriptor(receiver, propertyKey) || descriptor(0);existingDescriptor.value = V;return (defineProperty(receiver, propertyKey, existingDescriptor), true);}return ownDesc.set === undefined?false:(ownDesc.set.call(receiver, V), true);}}var isExtensible=Object.isExtensible || returnIt;var reflect={apply:ctx(call, apply, 3), construct:function construct(target, argumentsList){var proto=assertFunction(arguments.length < 3?target:arguments[2])[PROTOTYPE], instance=create(isObject(proto)?proto:ObjectProto), result=apply.call(target, instance, argumentsList);return isObject(result)?result:instance;}, defineProperty:wrap(defineProperty), deleteProperty:function deleteProperty(target, propertyKey){var desc=getOwnDescriptor(assertObject(target), propertyKey);return desc && !desc.configurable?false:delete target[propertyKey];}, enumerate:function enumerate(target){return new Enumerate(assertObject(target));}, get:reflectGet, getOwnPropertyDescriptor:function getOwnPropertyDescriptor(target, propertyKey){return getOwnDescriptor(assertObject(target), propertyKey);}, getPrototypeOf:(function(_getPrototypeOf){var _getPrototypeOfWrapper=function getPrototypeOf(_x){return _getPrototypeOf.apply(this, arguments);};_getPrototypeOfWrapper.toString = function(){return _getPrototypeOf.toString();};return _getPrototypeOfWrapper;})(function(target){return getPrototypeOf(assertObject(target));}), has:function has(target, propertyKey){return propertyKey in target;}, isExtensible:(function(_isExtensible){var _isExtensibleWrapper=function isExtensible(_x){return _isExtensible.apply(this, arguments);};_isExtensibleWrapper.toString = function(){return _isExtensible.toString();};return _isExtensibleWrapper;})(function(target){return !!isExtensible(assertObject(target));}), ownKeys:ownKeys, preventExtensions:wrap(Object.preventExtensions || returnIt), set:reflectSet};if(setPrototypeOf)reflect.setPrototypeOf = function(target, proto){return (setPrototypeOf(assertObject(target), proto), true);};$define(GLOBAL, {Reflect:{}});$define(STATIC, "Reflect", reflect);})();!(function(){$define(PROTO, ARRAY, {includes:createArrayContains(true)});$define(PROTO, STRING, {at:createPointAt(true)});function createObjectToArray(isEntries){return function(object){var O=toObject(object), keys=getKeys(object), length=keys.length, i=0, result=Array(length), key;if(isEntries)while(length > i) result[i] = [key = keys[i++], O[key]];else while(length > i) result[i] = O[keys[i++]];return result;};}$define(STATIC, OBJECT, {getOwnPropertyDescriptors:function getOwnPropertyDescriptors(object){var O=toObject(object), result={};forEach.call(ownKeys(O), function(key){defineProperty(result, key, descriptor(0, getOwnDescriptor(O, key)));});return result;}, values:createObjectToArray(false), entries:createObjectToArray(true)});$define(STATIC, REGEXP, {escape:createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, "\\$1", true)});})();!(function(REFERENCE){REFERENCE_GET = getWellKnownSymbol(REFERENCE + "Get", true);var REFERENCE_SET=getWellKnownSymbol(REFERENCE + SET, true), REFERENCE_DELETE=getWellKnownSymbol(REFERENCE + "Delete", true);$define(STATIC, SYMBOL, {referenceGet:REFERENCE_GET, referenceSet:REFERENCE_SET, referenceDelete:REFERENCE_DELETE});hidden(FunctionProto, REFERENCE_GET, returnThis);function setMapMethods(Constructor){if(Constructor){var MapProto=Constructor[PROTOTYPE];hidden(MapProto, REFERENCE_GET, MapProto.get);hidden(MapProto, REFERENCE_SET, MapProto.set);hidden(MapProto, REFERENCE_DELETE, MapProto["delete"]);}}setMapMethods(Map);setMapMethods(WeakMap);})("reference");!(function(DICT){Dict = function(iterable){var dict=create(null);if(iterable != undefined){if(isIterable(iterable)){forOf(iterable, true, function(key, value){dict[key] = value;});}else assign(dict, iterable);}return dict;};Dict[PROTOTYPE] = null;function DictIterator(iterated, kind){set(this, ITER, {o:toObject(iterated), a:getKeys(iterated), i:0, k:kind});}createIterator(DictIterator, DICT, function(){var iter=this[ITER], O=iter.o, keys=iter.a, kind=iter.k, key;do{if(iter.i >= keys.length){iter.o = undefined;return iterResult(1);}}while(!has(O, key = keys[iter.i++]));if(kind == KEY)return iterResult(0, key);if(kind == VALUE)return iterResult(0, O[key]);return iterResult(0, [key, O[key]]);});function createDictIter(kind){return function(it){return new DictIterator(it, kind);};}function createDictMethod(type){var isMap=type == 1, isEvery=type == 4;return function(object, callbackfn, that){var f=ctx(callbackfn, that, 3), O=toObject(object), result=isMap || type == 7 || type == 2?new (generic(this, Dict))():undefined, key, val, res;for(key in O) if(has(O, key)){val = O[key];res = f(val, key, object);if(type){if(isMap)result[key] = res;else if(res)switch(type){case 2:result[key] = val;break;case 3:return true;case 5:return val;case 6:return key;case 7:result[res[0]] = res[1];}else if(isEvery)return false;}}return type == 3 || isEvery?isEvery:result;};}function createDictReduce(isTurn){return function(object, mapfn, init){assertFunction(mapfn);var O=toObject(object), keys=getKeys(O), length=keys.length, i=0, memo, key, result;if(isTurn)memo = init == undefined?new (generic(this, Dict))():Object(init);else if(arguments.length < 3){assert(length, REDUCE_ERROR);memo = O[keys[i++]];}else memo = Object(init);while(length > i) if(has(O, key = keys[i++])){result = mapfn(memo, O[key], key, object);if(isTurn){if(result === false)break;}else memo = result;}return memo;};}var findKey=createDictMethod(6);function includes(object, el){return (el == el?keyOf(object, el):findKey(object, sameNaN)) !== undefined;}var dictMethods={keys:createDictIter(KEY), values:createDictIter(VALUE), entries:createDictIter(KEY + VALUE), forEach:createDictMethod(0), map:createDictMethod(1), filter:createDictMethod(2), some:createDictMethod(3), every:createDictMethod(4), find:createDictMethod(5), findKey:findKey, mapPairs:createDictMethod(7), reduce:createDictReduce(false), turn:createDictReduce(true), keyOf:keyOf, includes:includes, has:has, get:get, set:createDefiner(0), isDict:function isDict(it){return isObject(it) && getPrototypeOf(it) === Dict[PROTOTYPE];}};if(REFERENCE_GET)for(var key in dictMethods) !(function(fn){function method(){for(var args=[this], i=0; i < arguments.length;) args.push(arguments[i++]);return invoke(fn, args);}fn[REFERENCE_GET] = function(){return method;};})(dictMethods[key]);$define(GLOBAL + FORCED, {Dict:assignHidden(Dict, dictMethods)});})("Dict");!(function(ENTRIES, FN){function $for(iterable, entries){if(!(this instanceof $for)){return new $for(iterable, entries);}this[ITER] = getIterator(iterable);this[ENTRIES] = !!entries;}createIterator($for, "Wrapper", function(){return this[ITER].next();});var $forProto=$for[PROTOTYPE];setIterator($forProto, function(){return this[ITER];});function createChainIterator(next){function Iter(I, fn, that){this[ITER] = getIterator(I);this[ENTRIES] = I[ENTRIES];this[FN] = ctx(fn, that, I[ENTRIES]?2:1);}createIterator(Iter, "Chain", next, $forProto);setIterator(Iter[PROTOTYPE], returnThis);return Iter;}var MapIter=createChainIterator(function(){var step=this[ITER].next();return step.done?step:iterResult(0, stepCall(this[FN], step.value, this[ENTRIES]));});var FilterIter=createChainIterator(function(){for(;;) {var step=this[ITER].next();if(step.done || stepCall(this[FN], step.value, this[ENTRIES]))return step;}});assignHidden($forProto, {of:function of(fn, that){forOf(this, this[ENTRIES], fn, that);}, array:function array(fn, that){var result=[];forOf(fn != undefined?this.map(fn, that):this, false, push, result);return result;}, filter:function filter(fn, that){return new FilterIter(this, fn, that);}, map:function map(fn, that){return new MapIter(this, fn, that);}});$for.isIterable = isIterable;$for.getIterator = getIterator;$define(GLOBAL + FORCED, {$for:$for});})("entries", safeSymbol("fn"));$define(GLOBAL + FORCED, {delay:function delay(time){return new _core.Promise(function(resolve){setTimeout(resolve, time, true);});}});!(function(_, toLocaleString){core._ = path._ = path._ || {};$define(PROTO + FORCED, FUNCTION, {part:part, only:function only(numberArguments, that){var fn=assertFunction(this), n=toLength(numberArguments), isThat=arguments.length > 1;return function(){var length=min(n, arguments.length), args=Array(length), i=0;while(length > i) args[i] = arguments[i++];return invoke(fn, args, isThat?that:this);};}});function tie(key){var that=this, bound={};return hidden(that, _, function(key){if(key === undefined || !(key in that))return toLocaleString.call(that);return has(bound, key)?bound[key]:bound[key] = ctx(that[key], that, -1);})[_](key);}hidden(path._, TO_STRING, function(){return _;});hidden(ObjectProto, _, tie);DESC || hidden(ArrayProto, _, tie);})(DESC?uid("tie"):TO_LOCALE, ObjectProto[TO_LOCALE]);!(function(){function define(target, mixin){var keys=ownKeys(toObject(mixin)), length=keys.length, i=0, key;while(length > i) defineProperty(target, key = keys[i++], getOwnDescriptor(mixin, key));return target;};$define(STATIC + FORCED, OBJECT, {isObject:isObject, classof:classof, define:define, make:function make(proto, mixin){return define(create(proto), mixin);}});})();$define(PROTO + FORCED, ARRAY, {turn:function turn(fn, target){assertFunction(fn);var memo=target == undefined?[]:Object(target), O=ES5Object(this), length=toLength(O.length), index=0;while(length > index) if(fn(memo, O[index], index++, this) === false)break;return memo;}});if(framework)ArrayUnscopables.turn = true;!(function(numberMethods){function NumberIterator(iterated){set(this, ITER, {l:toLength(iterated), i:0});}createIterator(NumberIterator, NUMBER, function(){var iter=this[ITER], i=iter.i++;return i < iter.l?iterResult(0, i):iterResult(1);});defineIterator(Number, NUMBER, function(){return new NumberIterator(this);});numberMethods.random = function(lim){var a=+this, b=lim == undefined?0:+lim, m=min(a, b);return random() * (max(a, b) - m) + m;};forEach.call(array("round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2," + "acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc"), function(key){var fn=Math[key];if(fn)numberMethods[key] = function(){var args=[+this], i=0;while(arguments.length > i) args.push(arguments[i++]);return invoke(fn, args);};});$define(PROTO + FORCED, NUMBER, numberMethods);})({});!(function(){var escapeHTMLDict={"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&apos;"}, unescapeHTMLDict={}, key;for(key in escapeHTMLDict) unescapeHTMLDict[escapeHTMLDict[key]] = key;$define(PROTO + FORCED, STRING, {escapeHTML:createReplacer(/[&<>"']/g, escapeHTMLDict), unescapeHTML:createReplacer(/&(?:amp|lt|gt|quot|apos);/g, unescapeHTMLDict)});})();!(function(formatRegExp, flexioRegExp, locales, current, SECONDS, MINUTES, HOURS, MONTH, YEAR){function createFormat(prefix){return function(template, locale){var that=this, dict=locales[has(locales, locale)?locale:current];function get(unit){return that[prefix + unit]();}return String(template).replace(formatRegExp, function(part){switch(part){case "s":return get(SECONDS);case "ss":return lz(get(SECONDS));case "m":return get(MINUTES);case "mm":return lz(get(MINUTES));case "h":return get(HOURS);case "hh":return lz(get(HOURS));case "D":return get(DATE);case "DD":return lz(get(DATE));case "W":return dict[0][get("Day")];case "N":return get(MONTH) + 1;case "NN":return lz(get(MONTH) + 1);case "M":return dict[2][get(MONTH)];case "MM":return dict[1][get(MONTH)];case "Y":return get(YEAR);case "YY":return lz(get(YEAR) % 100);}return part;});};}function addLocale(lang, locale){function split(index){var result=[];forEach.call(array(locale.months), function(it){result.push(it.replace(flexioRegExp, "$" + index));});return result;}locales[lang] = [array(locale.weekdays), split(1), split(2)];return core;}$define(PROTO + FORCED, DATE, {format:createFormat("get"), formatUTC:createFormat("getUTC")});addLocale(current, {weekdays:"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday", months:"January,February,March,April,May,June,July,August,September,October,November,December"});addLocale("ru", {weekdays:"Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота", months:"Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь," + "Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь"});core.locale = function(locale){return has(locales, locale)?current = locale:current;};core.addLocale = addLocale;})(/\b\w\w?\b/g, /:(.*)\|(.*)$/, {}, "en", "Seconds", "Minutes", "Hours", "Month", "FullYear");$define(GLOBAL + FORCED, {global:global});!(function(arrayStatics){function setArrayStatics(keys, length){forEach.call(array(keys), function(key){if(key in ArrayProto)arrayStatics[key] = ctx(call, ArrayProto[key], length);});}setArrayStatics("pop,reverse,shift,keys,values,entries", 1);setArrayStatics("indexOf,every,some,forEach,map,filter,find,findIndex,includes", 3);setArrayStatics("join,slice,concat,push,splice,unshift,sort,lastIndexOf," + "reduce,reduceRight,copyWithin,fill,turn");$define(STATIC, ARRAY, arrayStatics);})({});!(function(NodeList){if(framework && NodeList && !(SYMBOL_ITERATOR in NodeList[PROTOTYPE])){hidden(NodeList[PROTOTYPE], SYMBOL_ITERATOR, Iterators[ARRAY]);}Iterators.NodeList = Iterators[ARRAY];})(global.NodeList);!(function(log, enabled){forEach.call(array("assert,clear,count,debug,dir,dirxml,error,exception," + "group,groupCollapsed,groupEnd,info,isIndependentlyComposed,log," + "markTimeline,profile,profileEnd,table,time,timeEnd,timeline," + "timelineEnd,timeStamp,trace,warn"), function(key){log[key] = function(){if(enabled && key in console)return apply.call(console[key], console, arguments);};});$define(GLOBAL + FORCED, {log:assign(log.log, log, {enable:function enable(){enabled = true;}, disable:function disable(){enabled = false;}})});})({}, true);})(typeof self != "undefined" && self.Math === Math?self:Function("return this")(), false);module.exports = {"default":module.exports, __esModule:true};},,,,, function(module, exports, __webpack_require__){var __WEBPACK_AMD_DEFINE_RESULT__;(function(module, global){;(function(){var undefined;var VERSION="3.3.1";var BIND_FLAG=1, BIND_KEY_FLAG=2, CURRY_BOUND_FLAG=4, CURRY_FLAG=8, CURRY_RIGHT_FLAG=16, PARTIAL_FLAG=32, PARTIAL_RIGHT_FLAG=64, REARG_FLAG=128, ARY_FLAG=256;var DEFAULT_TRUNC_LENGTH=30, DEFAULT_TRUNC_OMISSION="...";var HOT_COUNT=150, HOT_SPAN=16;var LAZY_FILTER_FLAG=0, LAZY_MAP_FLAG=1, LAZY_WHILE_FLAG=2;var FUNC_ERROR_TEXT="Expected a function";var PLACEHOLDER="__lodash_placeholder__";var argsTag="[object Arguments]", arrayTag="[object Array]", boolTag="[object Boolean]", dateTag="[object Date]", errorTag="[object Error]", funcTag="[object Function]", mapTag="[object Map]", numberTag="[object Number]", objectTag="[object Object]", regexpTag="[object RegExp]", setTag="[object Set]", stringTag="[object String]", weakMapTag="[object WeakMap]";var arrayBufferTag="[object ArrayBuffer]", float32Tag="[object Float32Array]", float64Tag="[object Float64Array]", int8Tag="[object Int8Array]", int16Tag="[object Int16Array]", int32Tag="[object Int32Array]", uint8Tag="[object Uint8Array]", uint8ClampedTag="[object Uint8ClampedArray]", uint16Tag="[object Uint16Array]", uint32Tag="[object Uint32Array]";var reEmptyStringLeading=/\b__p \+= '';/g, reEmptyStringMiddle=/\b(__p \+=) '' \+/g, reEmptyStringTrailing=/(__e\(.*?\)|\b__t\)) \+\n'';/g;var reEscapedHtml=/&(?:amp|lt|gt|quot|#39|#96);/g, reUnescapedHtml=/[&<>"'`]/g, reHasEscapedHtml=RegExp(reEscapedHtml.source), reHasUnescapedHtml=RegExp(reUnescapedHtml.source);var reEscape=/<%-([\s\S]+?)%>/g, reEvaluate=/<%([\s\S]+?)%>/g, reInterpolate=/<%=([\s\S]+?)%>/g;var reEsTemplate=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;var reFlags=/\w*$/;var reFuncName=/^\s*function[ \n\r\t]+\w/;var reHexPrefix=/^0[xX]/;var reHostCtor=/^\[object .+?Constructor\]$/;var reLatin1=/[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g;var reNoMatch=/($^)/;var reRegExpChars=/[.*+?^${}()|[\]\/\\]/g, reHasRegExpChars=RegExp(reRegExpChars.source);var reThis=/\bthis\b/;var reUnescapedString=/['\n\r\u2028\u2029\\]/g;var reWords=(function(){var upper="[A-Z\\xc0-\\xd6\\xd8-\\xde]", lower="[a-z\\xdf-\\xf6\\xf8-\\xff]+";return RegExp(upper + "{2,}(?=" + upper + lower + ")|" + upper + "?" + lower + "|" + upper + "+|[0-9]+", "g");})();var whitespace=" \t\u000b\f ﻿" + "\n\r\u2028\u2029" + " ᠎             　";var contextProps=["Array", "ArrayBuffer", "Date", "Error", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Math", "Number", "Object", "RegExp", "Set", "String", "_", "clearTimeout", "document", "isFinite", "parseInt", "setTimeout", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap", "window", "WinRTError"];var templateCounter=-1;var typedArrayTags={};typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;var cloneableTags={};cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[stringTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[mapTag] = cloneableTags[setTag] = cloneableTags[weakMapTag] = false;var debounceOptions={leading:false, maxWait:0, trailing:false};var deburredLetters={À:"A", Á:"A", Â:"A", Ã:"A", Ä:"A", Å:"A", à:"a", á:"a", â:"a", ã:"a", ä:"a", å:"a", Ç:"C", ç:"c", Ð:"D", ð:"d", È:"E", É:"E", Ê:"E", Ë:"E", è:"e", é:"e", ê:"e", ë:"e", Ì:"I", Í:"I", Î:"I", Ï:"I", ì:"i", í:"i", î:"i", ï:"i", Ñ:"N", ñ:"n", Ò:"O", Ó:"O", Ô:"O", Õ:"O", Ö:"O", Ø:"O", ò:"o", ó:"o", ô:"o", õ:"o", ö:"o", ø:"o", Ù:"U", Ú:"U", Û:"U", Ü:"U", ù:"u", ú:"u", û:"u", ü:"u", Ý:"Y", ý:"y", ÿ:"y", Æ:"Ae", æ:"ae", Þ:"Th", þ:"th", ß:"ss"};var htmlEscapes={"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;", "`":"&#96;"};var htmlUnescapes={"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":"\"", "&#39;":"'", "&#96;":"`"};var objectTypes={"function":true, object:true};var stringEscapes={"\\":"\\", "'":"'", "\n":"n", "\r":"r", "\u2028":"u2028", "\u2029":"u2029"};var root=objectTypes[typeof window] && window !== (this && this.window)?window:this;var freeExports=objectTypes[typeof exports] && exports && !exports.nodeType && exports;var freeModule=objectTypes[typeof module] && module && !module.nodeType && module;var freeGlobal=freeExports && freeModule && typeof global == "object" && global;if(freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)){root = freeGlobal;}var moduleExports=freeModule && freeModule.exports === freeExports && freeExports;function baseCompareAscending(value, other){if(value !== other){var valIsReflexive=value === value, othIsReflexive=other === other;if(value > other || !valIsReflexive || typeof value == "undefined" && othIsReflexive){return 1;}if(value < other || !othIsReflexive || typeof other == "undefined" && valIsReflexive){return -1;}}return 0;}function baseIndexOf(array, value, fromIndex){if(value !== value){return indexOfNaN(array, fromIndex);}var index=(fromIndex || 0) - 1, length=array.length;while(++index < length) {if(array[index] === value){return index;}}return -1;}function baseIsFunction(value){return typeof value == "function" || false;}function baseSortBy(array, comparer){var length=array.length;array.sort(comparer);while(length--) {array[length] = array[length].value;}return array;}function baseToString(value){if(typeof value == "string"){return value;}return value == null?"":value + "";}function charAtCallback(string){return string.charCodeAt(0);}function charsLeftIndex(string, chars){var index=-1, length=string.length;while(++index < length && chars.indexOf(string.charAt(index)) > -1) {}return index;}function charsRightIndex(string, chars){var index=string.length;while(index-- && chars.indexOf(string.charAt(index)) > -1) {}return index;}function compareAscending(object, other){return baseCompareAscending(object.criteria, other.criteria) || object.index - other.index;}function compareMultipleAscending(object, other){var index=-1, objCriteria=object.criteria, othCriteria=other.criteria, length=objCriteria.length;while(++index < length) {var result=baseCompareAscending(objCriteria[index], othCriteria[index]);if(result){return result;}}return object.index - other.index;}function deburrLetter(letter){return deburredLetters[letter];}function escapeHtmlChar(chr){return htmlEscapes[chr];}function escapeStringChar(chr){return "\\" + stringEscapes[chr];}function indexOfNaN(array, fromIndex, fromRight){var length=array.length, index=fromRight?fromIndex || length:(fromIndex || 0) - 1;while(fromRight?index--:++index < length) {var other=array[index];if(other !== other){return index;}}return -1;}function isObjectLike(value){return value && typeof value == "object" || false;}function isSpace(charCode){return charCode <= 160 && (charCode >= 9 && charCode <= 13) || charCode == 32 || charCode == 160 || charCode == 5760 || charCode == 6158 || charCode >= 8192 && (charCode <= 8202 || charCode == 8232 || charCode == 8233 || charCode == 8239 || charCode == 8287 || charCode == 12288 || charCode == 65279);}function replaceHolders(array, placeholder){var index=-1, length=array.length, resIndex=-1, result=[];while(++index < length) {if(array[index] === placeholder){array[index] = PLACEHOLDER;result[++resIndex] = index;}}return result;}function sortedUniq(array, iteratee){var seen, index=-1, length=array.length, resIndex=-1, result=[];while(++index < length) {var value=array[index], computed=iteratee?iteratee(value, index, array):value;if(!index || seen !== computed){seen = computed;result[++resIndex] = value;}}return result;}function trimmedLeftIndex(string){var index=-1, length=string.length;while(++index < length && isSpace(string.charCodeAt(index))) {}return index;}function trimmedRightIndex(string){var index=string.length;while(index-- && isSpace(string.charCodeAt(index))) {}return index;}function unescapeHtmlChar(chr){return htmlUnescapes[chr];}function runInContext(context){context = context?_.defaults(root.Object(), context, _.pick(root, contextProps)):root;var Array=context.Array, Date=context.Date, Error=context.Error, Function=context.Function, Math=context.Math, Number=context.Number, Object=context.Object, RegExp=context.RegExp, String=context.String, TypeError=context.TypeError;var arrayProto=Array.prototype, objectProto=Object.prototype;var document=(document = context.window) && document.document;var fnToString=Function.prototype.toString;var getLength=baseProperty("length");var hasOwnProperty=objectProto.hasOwnProperty;var idCounter=0;var objToString=objectProto.toString;var oldDash=context._;var reNative=RegExp("^" + escapeRegExp(objToString).replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");var ArrayBuffer=isNative(ArrayBuffer = context.ArrayBuffer) && ArrayBuffer, bufferSlice=isNative(bufferSlice = ArrayBuffer && new ArrayBuffer(0).slice) && bufferSlice, ceil=Math.ceil, clearTimeout=context.clearTimeout, floor=Math.floor, getPrototypeOf=isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf, push=arrayProto.push, propertyIsEnumerable=objectProto.propertyIsEnumerable, Set=isNative(Set = context.Set) && Set, setTimeout=context.setTimeout, splice=arrayProto.splice, Uint8Array=isNative(Uint8Array = context.Uint8Array) && Uint8Array, WeakMap=isNative(WeakMap = context.WeakMap) && WeakMap;var Float64Array=(function(){try{var func=isNative(func = context.Float64Array) && func, result=new func(new ArrayBuffer(10), 0, 1) && func;}catch(e) {}return result;})();var nativeIsArray=isNative(nativeIsArray = Array.isArray) && nativeIsArray, nativeCreate=isNative(nativeCreate = Object.create) && nativeCreate, nativeIsFinite=context.isFinite, nativeKeys=isNative(nativeKeys = Object.keys) && nativeKeys, nativeMax=Math.max, nativeMin=Math.min, nativeNow=isNative(nativeNow = Date.now) && nativeNow, nativeNumIsFinite=isNative(nativeNumIsFinite = Number.isFinite) && nativeNumIsFinite, nativeParseInt=context.parseInt, nativeRandom=Math.random;var NEGATIVE_INFINITY=Number.NEGATIVE_INFINITY, POSITIVE_INFINITY=Number.POSITIVE_INFINITY;var MAX_ARRAY_LENGTH=Math.pow(2, 32) - 1, MAX_ARRAY_INDEX=MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH=MAX_ARRAY_LENGTH >>> 1;var FLOAT64_BYTES_PER_ELEMENT=Float64Array?Float64Array.BYTES_PER_ELEMENT:0;var MAX_SAFE_INTEGER=Math.pow(2, 53) - 1;var metaMap=WeakMap && new WeakMap();function lodash(value){if(isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)){if(value instanceof LodashWrapper){return value;}if(hasOwnProperty.call(value, "__chain__") && hasOwnProperty.call(value, "__wrapped__")){return wrapperClone(value);}}return new LodashWrapper(value);}function baseLodash(){}function LodashWrapper(value, chainAll, actions){this.__wrapped__ = value;this.__actions__ = actions || [];this.__chain__ = !!chainAll;}var support=lodash.support = {};(function(x){support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);support.funcNames = typeof Function.name == "string";try{support.dom = document.createDocumentFragment().nodeType === 11;}catch(e) {support.dom = false;}try{support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);}catch(e) {support.nonEnumArgs = true;}})(0, 0);lodash.templateSettings = {escape:reEscape, evaluate:reEvaluate, interpolate:reInterpolate, variable:"", imports:{_:lodash}};function LazyWrapper(value){this.__wrapped__ = value;this.__actions__ = null;this.__dir__ = 1;this.__dropCount__ = 0;this.__filtered__ = false;this.__iteratees__ = null;this.__takeCount__ = POSITIVE_INFINITY;this.__views__ = null;}function lazyClone(){var actions=this.__actions__, iteratees=this.__iteratees__, views=this.__views__, result=new LazyWrapper(this.__wrapped__);result.__actions__ = actions?arrayCopy(actions):null;result.__dir__ = this.__dir__;result.__dropCount__ = this.__dropCount__;result.__filtered__ = this.__filtered__;result.__iteratees__ = iteratees?arrayCopy(iteratees):null;result.__takeCount__ = this.__takeCount__;result.__views__ = views?arrayCopy(views):null;return result;}function lazyReverse(){if(this.__filtered__){var result=new LazyWrapper(this);result.__dir__ = -1;result.__filtered__ = true;}else {result = this.clone();result.__dir__ *= -1;}return result;}function lazyValue(){var array=this.__wrapped__.value();if(!isArray(array)){return baseWrapperValue(array, this.__actions__);}var dir=this.__dir__, isRight=dir < 0, view=getView(0, array.length, this.__views__), start=view.start, end=view.end, length=end - start, dropCount=this.__dropCount__, takeCount=nativeMin(length, this.__takeCount__), index=isRight?end:start - 1, iteratees=this.__iteratees__, iterLength=iteratees?iteratees.length:0, resIndex=0, result=[];outer: while(length-- && resIndex < takeCount) {index += dir;var iterIndex=-1, value=array[index];while(++iterIndex < iterLength) {var data=iteratees[iterIndex], iteratee=data.iteratee, computed=iteratee(value, index, array), type=data.type;if(type == LAZY_MAP_FLAG){value = computed;}else if(!computed){if(type == LAZY_FILTER_FLAG){continue outer;}else {break outer;}}}if(dropCount){dropCount--;}else {result[resIndex++] = value;}}return result;}function MapCache(){this.__data__ = {};}function mapDelete(key){return this.has(key) && delete this.__data__[key];}function mapGet(key){return key == "__proto__"?undefined:this.__data__[key];}function mapHas(key){return key != "__proto__" && hasOwnProperty.call(this.__data__, key);}function mapSet(key, value){if(key != "__proto__"){this.__data__[key] = value;}return this;}function SetCache(values){var length=values?values.length:0;this.data = {hash:nativeCreate(null), set:new Set()};while(length--) {this.push(values[length]);}}function cacheIndexOf(cache, value){var data=cache.data, result=typeof value == "string" || isObject(value)?data.set.has(value):data.hash[value];return result?0:-1;}function cachePush(value){var data=this.data;if(typeof value == "string" || isObject(value)){data.set.add(value);}else {data.hash[value] = true;}}function arrayCopy(source, array){var index=-1, length=source.length;array || (array = Array(length));while(++index < length) {array[index] = source[index];}return array;}function arrayEach(array, iteratee){var index=-1, length=array.length;while(++index < length) {if(iteratee(array[index], index, array) === false){break;}}return array;}function arrayEachRight(array, iteratee){var length=array.length;while(length--) {if(iteratee(array[length], length, array) === false){break;}}return array;}function arrayEvery(array, predicate){var index=-1, length=array.length;while(++index < length) {if(!predicate(array[index], index, array)){return false;}}return true;}function arrayFilter(array, predicate){var index=-1, length=array.length, resIndex=-1, result=[];while(++index < length) {var value=array[index];if(predicate(value, index, array)){result[++resIndex] = value;}}return result;}function arrayMap(array, iteratee){var index=-1, length=array.length, result=Array(length);while(++index < length) {result[index] = iteratee(array[index], index, array);}return result;}function arrayMax(array){var index=-1, length=array.length, result=NEGATIVE_INFINITY;while(++index < length) {var value=array[index];if(value > result){result = value;}}return result;}function arrayMin(array){var index=-1, length=array.length, result=POSITIVE_INFINITY;while(++index < length) {var value=array[index];if(value < result){result = value;}}return result;}function arrayReduce(array, iteratee, accumulator, initFromArray){var index=-1, length=array.length;if(initFromArray && length){accumulator = array[++index];}while(++index < length) {accumulator = iteratee(accumulator, array[index], index, array);}return accumulator;}function arrayReduceRight(array, iteratee, accumulator, initFromArray){var length=array.length;if(initFromArray && length){accumulator = array[--length];}while(length--) {accumulator = iteratee(accumulator, array[length], length, array);}return accumulator;}function arraySome(array, predicate){var index=-1, length=array.length;while(++index < length) {if(predicate(array[index], index, array)){return true;}}return false;}function assignDefaults(objectValue, sourceValue){return typeof objectValue == "undefined"?sourceValue:objectValue;}function assignOwnDefaults(objectValue, sourceValue, key, object){return typeof objectValue == "undefined" || !hasOwnProperty.call(object, key)?sourceValue:objectValue;}function baseAssign(object, source, customizer){var props=keys(source);if(!customizer){return baseCopy(source, object, props);}var index=-1, length=props.length;while(++index < length) {var key=props[index], value=object[key], result=customizer(value, source[key], key, object, source);if((result === result?result !== value:value === value) || typeof value == "undefined" && !(key in object)){object[key] = result;}}return object;}function baseAt(collection, props){var index=-1, length=collection.length, isArr=isLength(length), propsLength=props.length, result=Array(propsLength);while(++index < propsLength) {var key=props[index];if(isArr){key = parseFloat(key);result[index] = isIndex(key, length)?collection[key]:undefined;}else {result[index] = collection[key];}}return result;}function baseCopy(source, object, props){if(!props){props = object;object = {};}var index=-1, length=props.length;while(++index < length) {var key=props[index];object[key] = source[key];}return object;}function baseBindAll(object, methodNames){var index=-1, length=methodNames.length;while(++index < length) {var key=methodNames[index];object[key] = createWrapper(object[key], BIND_FLAG, object);}return object;}function baseCallback(func, thisArg, argCount){var type=typeof func;if(type == "function"){return typeof thisArg != "undefined" && isBindable(func)?bindCallback(func, thisArg, argCount):func;}if(func == null){return identity;}if(type == "object"){return baseMatches(func);}return typeof thisArg == "undefined"?baseProperty(func + ""):baseMatchesProperty(func + "", thisArg);}function baseClone(value, isDeep, customizer, key, object, stackA, stackB){var result;if(customizer){result = object?customizer(value, key, object):customizer(value);}if(typeof result != "undefined"){return result;}if(!isObject(value)){return value;}var isArr=isArray(value);if(isArr){result = initCloneArray(value);if(!isDeep){return arrayCopy(value, result);}}else {var tag=objToString.call(value), isFunc=tag == funcTag;if(tag == objectTag || tag == argsTag || isFunc && !object){result = initCloneObject(isFunc?{}:value);if(!isDeep){return baseCopy(value, result, keys(value));}}else {return cloneableTags[tag]?initCloneByTag(value, tag, isDeep):object?value:{};}}stackA || (stackA = []);stackB || (stackB = []);var length=stackA.length;while(length--) {if(stackA[length] == value){return stackB[length];}}stackA.push(value);stackB.push(result);(isArr?arrayEach:baseForOwn)(value, function(subValue, key){result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);});return result;}var baseCreate=(function(){function Object(){}return function(prototype){if(isObject(prototype)){Object.prototype = prototype;var result=new Object();Object.prototype = null;}return result || context.Object();};})();function baseDelay(func, wait, args, fromIndex){if(typeof func != "function"){throw new TypeError(FUNC_ERROR_TEXT);}return setTimeout(function(){func.apply(undefined, baseSlice(args, fromIndex));}, wait);}function baseDifference(array, values){var length=array?array.length:0, result=[];if(!length){return result;}var index=-1, indexOf=getIndexOf(), isCommon=indexOf == baseIndexOf, cache=isCommon && values.length >= 200?createCache(values):null, valuesLength=values.length;if(cache){indexOf = cacheIndexOf;isCommon = false;values = cache;}outer: while(++index < length) {var value=array[index];if(isCommon && value === value){var valuesIndex=valuesLength;while(valuesIndex--) {if(values[valuesIndex] === value){continue outer;}}result.push(value);}else if(indexOf(values, value) < 0){result.push(value);}}return result;}function baseEach(collection, iteratee){var length=collection?collection.length:0;if(!isLength(length)){return baseForOwn(collection, iteratee);}var index=-1, iterable=toObject(collection);while(++index < length) {if(iteratee(iterable[index], index, iterable) === false){break;}}return collection;}function baseEachRight(collection, iteratee){var length=collection?collection.length:0;if(!isLength(length)){return baseForOwnRight(collection, iteratee);}var iterable=toObject(collection);while(length--) {if(iteratee(iterable[length], length, iterable) === false){break;}}return collection;}function baseEvery(collection, predicate){var result=true;baseEach(collection, function(value, index, collection){result = !!predicate(value, index, collection);return result;});return result;}function baseFill(array, value, start, end){var length=array.length;start = start == null?0:+start || 0;if(start < 0){start = -start > length?0:length + start;}end = typeof end == "undefined" || end > length?length:+end || 0;if(end < 0){end += length;}length = start > end?0:end >>> 0;start >>>= 0;while(start < length) {array[start++] = value;}return array;}function baseFilter(collection, predicate){var result=[];baseEach(collection, function(value, index, collection){if(predicate(value, index, collection)){result.push(value);}});return result;}function baseFind(collection, predicate, eachFunc, retKey){var result;eachFunc(collection, function(value, key, collection){if(predicate(value, key, collection)){result = retKey?key:value;return false;}});return result;}function baseFlatten(array, isDeep, isStrict, fromIndex){var index=(fromIndex || 0) - 1, length=array.length, resIndex=-1, result=[];while(++index < length) {var value=array[index];if(isObjectLike(value) && isLength(value.length) && (isArray(value) || isArguments(value))){if(isDeep){value = baseFlatten(value, isDeep, isStrict);}var valIndex=-1, valLength=value.length;result.length += valLength;while(++valIndex < valLength) {result[++resIndex] = value[valIndex];}}else if(!isStrict){result[++resIndex] = value;}}return result;}function baseFor(object, iteratee, keysFunc){var index=-1, iterable=toObject(object), props=keysFunc(object), length=props.length;while(++index < length) {var key=props[index];if(iteratee(iterable[key], key, iterable) === false){break;}}return object;}function baseForRight(object, iteratee, keysFunc){var iterable=toObject(object), props=keysFunc(object), length=props.length;while(length--) {var key=props[length];if(iteratee(iterable[key], key, iterable) === false){break;}}return object;}function baseForIn(object, iteratee){return baseFor(object, iteratee, keysIn);}function baseForOwn(object, iteratee){return baseFor(object, iteratee, keys);}function baseForOwnRight(object, iteratee){return baseForRight(object, iteratee, keys);}function baseFunctions(object, props){var index=-1, length=props.length, resIndex=-1, result=[];while(++index < length) {var key=props[index];if(isFunction(object[key])){result[++resIndex] = key;}}return result;}function baseInvoke(collection, methodName, args){var index=-1, isFunc=typeof methodName == "function", length=collection?collection.length:0, result=isLength(length)?Array(length):[];baseEach(collection, function(value){var func=isFunc?methodName:value != null && value[methodName];result[++index] = func?func.apply(value, args):undefined;});return result;}function baseIsEqual(value, other, customizer, isWhere, stackA, stackB){if(value === other){return value !== 0 || 1 / value == 1 / other;}var valType=typeof value, othType=typeof other;if(valType != "function" && valType != "object" && othType != "function" && othType != "object" || value == null || other == null){return value !== value && other !== other;}return baseIsEqualDeep(value, other, baseIsEqual, customizer, isWhere, stackA, stackB);}function baseIsEqualDeep(object, other, equalFunc, customizer, isWhere, stackA, stackB){var objIsArr=isArray(object), othIsArr=isArray(other), objTag=arrayTag, othTag=arrayTag;if(!objIsArr){objTag = objToString.call(object);if(objTag == argsTag){objTag = objectTag;}else if(objTag != objectTag){objIsArr = isTypedArray(object);}}if(!othIsArr){othTag = objToString.call(other);if(othTag == argsTag){othTag = objectTag;}else if(othTag != objectTag){othIsArr = isTypedArray(other);}}var objIsObj=objTag == objectTag, othIsObj=othTag == objectTag, isSameTag=objTag == othTag;if(isSameTag && !(objIsArr || objIsObj)){return equalByTag(object, other, objTag);}var valWrapped=objIsObj && hasOwnProperty.call(object, "__wrapped__"), othWrapped=othIsObj && hasOwnProperty.call(other, "__wrapped__");if(valWrapped || othWrapped){return equalFunc(valWrapped?object.value():object, othWrapped?other.value():other, customizer, isWhere, stackA, stackB);}if(!isSameTag){return false;}stackA || (stackA = []);stackB || (stackB = []);var length=stackA.length;while(length--) {if(stackA[length] == object){return stackB[length] == other;}}stackA.push(object);stackB.push(other);var result=(objIsArr?equalArrays:equalObjects)(object, other, equalFunc, customizer, isWhere, stackA, stackB);stackA.pop();stackB.pop();return result;}function baseIsMatch(object, props, values, strictCompareFlags, customizer){var length=props.length;if(object == null){return !length;}var index=-1, noCustomizer=!customizer;while(++index < length) {if(noCustomizer && strictCompareFlags[index]?values[index] !== object[props[index]]:!hasOwnProperty.call(object, props[index])){return false;}}index = -1;while(++index < length) {var key=props[index];if(noCustomizer && strictCompareFlags[index]){var result=hasOwnProperty.call(object, key);}else {var objValue=object[key], srcValue=values[index];result = customizer?customizer(objValue, srcValue, key):undefined;if(typeof result == "undefined"){result = baseIsEqual(srcValue, objValue, customizer, true);}}if(!result){return false;}}return true;}function baseMap(collection, iteratee){var result=[];baseEach(collection, function(value, key, collection){result.push(iteratee(value, key, collection));});return result;}function baseMatches(source){var props=keys(source), length=props.length;if(length == 1){var key=props[0], value=source[key];if(isStrictComparable(value)){return function(object){return object != null && object[key] === value && hasOwnProperty.call(object, key);};}}var values=Array(length), strictCompareFlags=Array(length);while(length--) {value = source[props[length]];values[length] = value;strictCompareFlags[length] = isStrictComparable(value);}return function(object){return baseIsMatch(object, props, values, strictCompareFlags);};}function baseMatchesProperty(key, value){if(isStrictComparable(value)){return function(object){return object != null && object[key] === value;};}return function(object){return object != null && baseIsEqual(value, object[key], null, true);};}function baseMerge(object, source, customizer, stackA, stackB){if(!isObject(object)){return object;}var isSrcArr=isLength(source.length) && (isArray(source) || isTypedArray(source));(isSrcArr?arrayEach:baseForOwn)(source, function(srcValue, key, source){if(isObjectLike(srcValue)){stackA || (stackA = []);stackB || (stackB = []);return baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);}var value=object[key], result=customizer?customizer(value, srcValue, key, object, source):undefined, isCommon=typeof result == "undefined";if(isCommon){result = srcValue;}if((isSrcArr || typeof result != "undefined") && (isCommon || (result === result?result !== value:value === value))){object[key] = result;}});return object;}function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB){var length=stackA.length, srcValue=source[key];while(length--) {if(stackA[length] == srcValue){object[key] = stackB[length];return;}}var value=object[key], result=customizer?customizer(value, srcValue, key, object, source):undefined, isCommon=typeof result == "undefined";if(isCommon){result = srcValue;if(isLength(srcValue.length) && (isArray(srcValue) || isTypedArray(srcValue))){result = isArray(value)?value:value?arrayCopy(value):[];}else if(isPlainObject(srcValue) || isArguments(srcValue)){result = isArguments(value)?toPlainObject(value):isPlainObject(value)?value:{};}else {isCommon = false;}}stackA.push(srcValue);stackB.push(result);if(isCommon){object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);}else if(result === result?result !== value:value === value){object[key] = result;}}function baseProperty(key){return function(object){return object == null?undefined:object[key];};}function basePullAt(array, indexes){var length=indexes.length, result=baseAt(array, indexes);indexes.sort(baseCompareAscending);while(length--) {var index=parseFloat(indexes[length]);if(index != previous && isIndex(index)){var previous=index;splice.call(array, index, 1);}}return result;}function baseRandom(min, max){return min + floor(nativeRandom() * (max - min + 1));}function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc){eachFunc(collection, function(value, index, collection){accumulator = initFromCollection?(initFromCollection = false, value):iteratee(accumulator, value, index, collection);});return accumulator;}var baseSetData=!metaMap?identity:function(func, data){metaMap.set(func, data);return func;};function baseSlice(array, start, end){var index=-1, length=array.length;start = start == null?0:+start || 0;if(start < 0){start = -start > length?0:length + start;}end = typeof end == "undefined" || end > length?length:+end || 0;if(end < 0){end += length;}length = start > end?0:end - start >>> 0;start >>>= 0;var result=Array(length);while(++index < length) {result[index] = array[index + start];}return result;}function baseSome(collection, predicate){var result;baseEach(collection, function(value, index, collection){result = predicate(value, index, collection);return !result;});return !!result;}function baseUniq(array, iteratee){var index=-1, indexOf=getIndexOf(), length=array.length, isCommon=indexOf == baseIndexOf, isLarge=isCommon && length >= 200, seen=isLarge?createCache():null, result=[];if(seen){indexOf = cacheIndexOf;isCommon = false;}else {isLarge = false;seen = iteratee?[]:result;}outer: while(++index < length) {var value=array[index], computed=iteratee?iteratee(value, index, array):value;if(isCommon && value === value){var seenIndex=seen.length;while(seenIndex--) {if(seen[seenIndex] === computed){continue outer;}}if(iteratee){seen.push(computed);}result.push(value);}else if(indexOf(seen, computed) < 0){if(iteratee || isLarge){seen.push(computed);}result.push(value);}}return result;}function baseValues(object, props){var index=-1, length=props.length, result=Array(length);while(++index < length) {result[index] = object[props[index]];}return result;}function baseWrapperValue(value, actions){var result=value;if(result instanceof LazyWrapper){result = result.value();}var index=-1, length=actions.length;while(++index < length) {var args=[result], action=actions[index];push.apply(args, action.args);result = action.func.apply(action.thisArg, args);}return result;}function binaryIndex(array, value, retHighest){var low=0, high=array?array.length:low;if(typeof value == "number" && value === value && high <= HALF_MAX_ARRAY_LENGTH){while(low < high) {var mid=low + high >>> 1, computed=array[mid];if(retHighest?computed <= value:computed < value){low = mid + 1;}else {high = mid;}}return high;}return binaryIndexBy(array, value, identity, retHighest);}function binaryIndexBy(array, value, iteratee, retHighest){value = iteratee(value);var low=0, high=array?array.length:0, valIsNaN=value !== value, valIsUndef=typeof value == "undefined";while(low < high) {var mid=floor((low + high) / 2), computed=iteratee(array[mid]), isReflexive=computed === computed;if(valIsNaN){var setLow=isReflexive || retHighest;}else if(valIsUndef){setLow = isReflexive && (retHighest || typeof computed != "undefined");}else {setLow = retHighest?computed <= value:computed < value;}if(setLow){low = mid + 1;}else {high = mid;}}return nativeMin(high, MAX_ARRAY_INDEX);}function bindCallback(func, thisArg, argCount){if(typeof func != "function"){return identity;}if(typeof thisArg == "undefined"){return func;}switch(argCount){case 1:return function(value){return func.call(thisArg, value);};case 3:return function(value, index, collection){return func.call(thisArg, value, index, collection);};case 4:return function(accumulator, value, index, collection){return func.call(thisArg, accumulator, value, index, collection);};case 5:return function(value, other, key, object, source){return func.call(thisArg, value, other, key, object, source);};}return function(){return func.apply(thisArg, arguments);};}function bufferClone(buffer){return bufferSlice.call(buffer, 0);}if(!bufferSlice){bufferClone = !(ArrayBuffer && Uint8Array)?constant(null):function(buffer){var byteLength=buffer.byteLength, floatLength=Float64Array?floor(byteLength / FLOAT64_BYTES_PER_ELEMENT):0, offset=floatLength * FLOAT64_BYTES_PER_ELEMENT, result=new ArrayBuffer(byteLength);if(floatLength){var view=new Float64Array(result, 0, floatLength);view.set(new Float64Array(buffer, 0, floatLength));}if(byteLength != offset){view = new Uint8Array(result, offset);view.set(new Uint8Array(buffer, offset));}return result;};}function composeArgs(args, partials, holders){var holdersLength=holders.length, argsIndex=-1, argsLength=nativeMax(args.length - holdersLength, 0), leftIndex=-1, leftLength=partials.length, result=Array(argsLength + leftLength);while(++leftIndex < leftLength) {result[leftIndex] = partials[leftIndex];}while(++argsIndex < holdersLength) {result[holders[argsIndex]] = args[argsIndex];}while(argsLength--) {result[leftIndex++] = args[argsIndex++];}return result;}function composeArgsRight(args, partials, holders){var holdersIndex=-1, holdersLength=holders.length, argsIndex=-1, argsLength=nativeMax(args.length - holdersLength, 0), rightIndex=-1, rightLength=partials.length, result=Array(argsLength + rightLength);while(++argsIndex < argsLength) {result[argsIndex] = args[argsIndex];}var pad=argsIndex;while(++rightIndex < rightLength) {result[pad + rightIndex] = partials[rightIndex];}while(++holdersIndex < holdersLength) {result[pad + holders[holdersIndex]] = args[argsIndex++];}return result;}function createAggregator(setter, initializer){return function(collection, iteratee, thisArg){var result=initializer?initializer():{};iteratee = getCallback(iteratee, thisArg, 3);if(isArray(collection)){var index=-1, length=collection.length;while(++index < length) {var value=collection[index];setter(result, value, iteratee(value, index, collection), collection);}}else {baseEach(collection, function(value, key, collection){setter(result, value, iteratee(value, key, collection), collection);});}return result;};}function createAssigner(assigner){return function(){var length=arguments.length, object=arguments[0];if(length < 2 || object == null){return object;}if(length > 3 && isIterateeCall(arguments[1], arguments[2], arguments[3])){length = 2;}if(length > 3 && typeof arguments[length - 2] == "function"){var customizer=bindCallback(arguments[--length - 1], arguments[length--], 5);}else if(length > 2 && typeof arguments[length - 1] == "function"){customizer = arguments[--length];}var index=0;while(++index < length) {var source=arguments[index];if(source){assigner(object, source, customizer);}}return object;};}function createBindWrapper(func, thisArg){var Ctor=createCtorWrapper(func);function wrapper(){return (this instanceof wrapper?Ctor:func).apply(thisArg, arguments);}return wrapper;}var createCache=!(nativeCreate && Set)?constant(null):function(values){return new SetCache(values);};function createCompounder(callback){return function(string){var index=-1, array=words(deburr(string)), length=array.length, result="";while(++index < length) {result = callback(result, array[index], index);}return result;};}function createCtorWrapper(Ctor){return function(){var thisBinding=baseCreate(Ctor.prototype), result=Ctor.apply(thisBinding, arguments);return isObject(result)?result:thisBinding;};}function createExtremum(arrayFunc, isMin){return function(collection, iteratee, thisArg){if(thisArg && isIterateeCall(collection, iteratee, thisArg)){iteratee = null;}var func=getCallback(), noIteratee=iteratee == null;if(!(func === baseCallback && noIteratee)){noIteratee = false;iteratee = func(iteratee, thisArg, 3);}if(noIteratee){var isArr=isArray(collection);if(!isArr && isString(collection)){iteratee = charAtCallback;}else {return arrayFunc(isArr?collection:toIterable(collection));}}return extremumBy(collection, iteratee, isMin);};}function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity){var isAry=bitmask & ARY_FLAG, isBind=bitmask & BIND_FLAG, isBindKey=bitmask & BIND_KEY_FLAG, isCurry=bitmask & CURRY_FLAG, isCurryBound=bitmask & CURRY_BOUND_FLAG, isCurryRight=bitmask & CURRY_RIGHT_FLAG;var Ctor=!isBindKey && createCtorWrapper(func), key=func;function wrapper(){var length=arguments.length, index=length, args=Array(length);while(index--) {args[index] = arguments[index];}if(partials){args = composeArgs(args, partials, holders);}if(partialsRight){args = composeArgsRight(args, partialsRight, holdersRight);}if(isCurry || isCurryRight){var placeholder=wrapper.placeholder, argsHolders=replaceHolders(args, placeholder);length -= argsHolders.length;if(length < arity){var newArgPos=argPos?arrayCopy(argPos):null, newArity=nativeMax(arity - length, 0), newsHolders=isCurry?argsHolders:null, newHoldersRight=isCurry?null:argsHolders, newPartials=isCurry?args:null, newPartialsRight=isCurry?null:args;bitmask |= isCurry?PARTIAL_FLAG:PARTIAL_RIGHT_FLAG;bitmask &= ~(isCurry?PARTIAL_RIGHT_FLAG:PARTIAL_FLAG);if(!isCurryBound){bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);}var result=createHybridWrapper(func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity);result.placeholder = placeholder;return result;}}var thisBinding=isBind?thisArg:this;if(isBindKey){func = thisBinding[key];}if(argPos){args = reorder(args, argPos);}if(isAry && ary < args.length){args.length = ary;}return (this instanceof wrapper?Ctor || createCtorWrapper(func):func).apply(thisBinding, args);}return wrapper;}function createPad(string, length, chars){var strLength=string.length;length = +length;if(strLength >= length || !nativeIsFinite(length)){return "";}var padLength=length - strLength;chars = chars == null?" ":chars + "";return repeat(chars, ceil(padLength / chars.length)).slice(0, padLength);}function createPartialWrapper(func, bitmask, thisArg, partials){var isBind=bitmask & BIND_FLAG, Ctor=createCtorWrapper(func);function wrapper(){var argsIndex=-1, argsLength=arguments.length, leftIndex=-1, leftLength=partials.length, args=Array(argsLength + leftLength);while(++leftIndex < leftLength) {args[leftIndex] = partials[leftIndex];}while(argsLength--) {args[leftIndex++] = arguments[++argsIndex];}return (this instanceof wrapper?Ctor:func).apply(isBind?thisArg:this, args);}return wrapper;}function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity){var isBindKey=bitmask & BIND_KEY_FLAG;if(!isBindKey && typeof func != "function"){throw new TypeError(FUNC_ERROR_TEXT);}var length=partials?partials.length:0;if(!length){bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);partials = holders = null;}length -= holders?holders.length:0;if(bitmask & PARTIAL_RIGHT_FLAG){var partialsRight=partials, holdersRight=holders;partials = holders = null;}var data=!isBindKey && getData(func), newData=[func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];if(data && data !== true){mergeData(newData, data);bitmask = newData[1];arity = newData[9];}newData[9] = arity == null?isBindKey?0:func.length:nativeMax(arity - length, 0) || 0;if(bitmask == BIND_FLAG){var result=createBindWrapper(newData[0], newData[2]);}else if((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !newData[4].length){result = createPartialWrapper.apply(undefined, newData);}else {result = createHybridWrapper.apply(undefined, newData);}var setter=data?baseSetData:setData;return setter(result, newData);}function equalArrays(array, other, equalFunc, customizer, isWhere, stackA, stackB){var index=-1, arrLength=array.length, othLength=other.length, result=true;if(arrLength != othLength && !(isWhere && othLength > arrLength)){return false;}while(result && ++index < arrLength) {var arrValue=array[index], othValue=other[index];result = undefined;if(customizer){result = isWhere?customizer(othValue, arrValue, index):customizer(arrValue, othValue, index);}if(typeof result == "undefined"){if(isWhere){var othIndex=othLength;while(othIndex--) {othValue = other[othIndex];result = arrValue && arrValue === othValue || equalFunc(arrValue, othValue, customizer, isWhere, stackA, stackB);if(result){break;}}}else {result = arrValue && arrValue === othValue || equalFunc(arrValue, othValue, customizer, isWhere, stackA, stackB);}}}return !!result;}function equalByTag(object, other, tag){switch(tag){case boolTag:case dateTag:return +object == +other;case errorTag:return object.name == other.name && object.message == other.message;case numberTag:return object != +object?other != +other:object == 0?1 / object == 1 / other:object == +other;case regexpTag:case stringTag:return object == other + "";}return false;}function equalObjects(object, other, equalFunc, customizer, isWhere, stackA, stackB){var objProps=keys(object), objLength=objProps.length, othProps=keys(other), othLength=othProps.length;if(objLength != othLength && !isWhere){return false;}var hasCtor, index=-1;while(++index < objLength) {var key=objProps[index], result=hasOwnProperty.call(other, key);if(result){var objValue=object[key], othValue=other[key];result = undefined;if(customizer){result = isWhere?customizer(othValue, objValue, key):customizer(objValue, othValue, key);}if(typeof result == "undefined"){result = objValue && objValue === othValue || equalFunc(objValue, othValue, customizer, isWhere, stackA, stackB);}}if(!result){return false;}hasCtor || (hasCtor = key == "constructor");}if(!hasCtor){var objCtor=object.constructor, othCtor=other.constructor;if(objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)){return false;}}return true;}function extremumBy(collection, iteratee, isMin){var exValue=isMin?POSITIVE_INFINITY:NEGATIVE_INFINITY, computed=exValue, result=computed;baseEach(collection, function(value, index, collection){var current=iteratee(value, index, collection);if((isMin?current < computed:current > computed) || current === exValue && current === result){computed = current;result = value;}});return result;}function getCallback(func, thisArg, argCount){var result=lodash.callback || callback;result = result === callback?baseCallback:result;return argCount?result(func, thisArg, argCount):result;}var getData=!metaMap?noop:function(func){return metaMap.get(func);};function getIndexOf(collection, target, fromIndex){var result=lodash.indexOf || indexOf;result = result === indexOf?baseIndexOf:result;return collection?result(collection, target, fromIndex):result;}function getView(start, end, transforms){var index=-1, length=transforms?transforms.length:0;while(++index < length) {var data=transforms[index], size=data.size;switch(data.type){case "drop":start += size;break;case "dropRight":end -= size;break;case "take":end = nativeMin(end, start + size);break;case "takeRight":start = nativeMax(start, end - size);break;}}return {start:start, end:end};}function initCloneArray(array){var length=array.length, result=new array.constructor(length);if(length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")){result.index = array.index;result.input = array.input;}return result;}function initCloneObject(object){var Ctor=object.constructor;if(!(typeof Ctor == "function" && Ctor instanceof Ctor)){Ctor = Object;}return new Ctor();}function initCloneByTag(object, tag, isDeep){var Ctor=object.constructor;switch(tag){case arrayBufferTag:return bufferClone(object);case boolTag:case dateTag:return new Ctor(+object);case float32Tag:case float64Tag:case int8Tag:case int16Tag:case int32Tag:case uint8Tag:case uint8ClampedTag:case uint16Tag:case uint32Tag:var buffer=object.buffer;return new Ctor(isDeep?bufferClone(buffer):buffer, object.byteOffset, object.length);case numberTag:case stringTag:return new Ctor(object);case regexpTag:var result=new Ctor(object.source, reFlags.exec(object));result.lastIndex = object.lastIndex;}return result;}function isBindable(func){var support=lodash.support, result=!(support.funcNames?func.name:support.funcDecomp);if(!result){var source=fnToString.call(func);if(!support.funcNames){result = !reFuncName.test(source);}if(!result){result = reThis.test(source) || isNative(func);baseSetData(func, result);}}return result;}function isIndex(value, length){value = +value;length = length == null?MAX_SAFE_INTEGER:length;return value > -1 && value % 1 == 0 && value < length;}function isIterateeCall(value, index, object){if(!isObject(object)){return false;}var type=typeof index;if(type == "number"){var length=object.length, prereq=isLength(length) && isIndex(index, length);}else {prereq = type == "string" && index in object;}if(prereq){var other=object[index];return value === value?value === other:other !== other;}return false;}function isLength(value){return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;}function isStrictComparable(value){return value === value && (value === 0?1 / value > 0:!isObject(value));}function mergeData(data, source){var bitmask=data[1], srcBitmask=source[1], newBitmask=bitmask | srcBitmask;var arityFlags=ARY_FLAG | REARG_FLAG, bindFlags=BIND_FLAG | BIND_KEY_FLAG, comboFlags=arityFlags | bindFlags | CURRY_BOUND_FLAG | CURRY_RIGHT_FLAG;var isAry=bitmask & ARY_FLAG && !(srcBitmask & ARY_FLAG), isRearg=bitmask & REARG_FLAG && !(srcBitmask & REARG_FLAG), argPos=(isRearg?data:source)[7], ary=(isAry?data:source)[8];var isCommon=!(bitmask >= REARG_FLAG && srcBitmask > bindFlags) && !(bitmask > bindFlags && srcBitmask >= REARG_FLAG);var isCombo=newBitmask >= arityFlags && newBitmask <= comboFlags && (bitmask < REARG_FLAG || (isRearg || isAry) && argPos.length <= ary);if(!(isCommon || isCombo)){return data;}if(srcBitmask & BIND_FLAG){data[2] = source[2];newBitmask |= bitmask & BIND_FLAG?0:CURRY_BOUND_FLAG;}var value=source[3];if(value){var partials=data[3];data[3] = partials?composeArgs(partials, value, source[4]):arrayCopy(value);data[4] = partials?replaceHolders(data[3], PLACEHOLDER):arrayCopy(source[4]);}value = source[5];if(value){partials = data[5];data[5] = partials?composeArgsRight(partials, value, source[6]):arrayCopy(value);data[6] = partials?replaceHolders(data[5], PLACEHOLDER):arrayCopy(source[6]);}value = source[7];if(value){data[7] = arrayCopy(value);}if(srcBitmask & ARY_FLAG){data[8] = data[8] == null?source[8]:nativeMin(data[8], source[8]);}if(data[9] == null){data[9] = source[9];}data[0] = source[0];data[1] = newBitmask;return data;}function pickByArray(object, props){object = toObject(object);var index=-1, length=props.length, result={};while(++index < length) {var key=props[index];if(key in object){result[key] = object[key];}}return result;}function pickByCallback(object, predicate){var result={};baseForIn(object, function(value, key, object){if(predicate(value, key, object)){result[key] = value;}});return result;}function reorder(array, indexes){var arrLength=array.length, length=nativeMin(indexes.length, arrLength), oldArray=arrayCopy(array);while(length--) {var index=indexes[length];array[length] = isIndex(index, arrLength)?oldArray[index]:undefined;}return array;}var setData=(function(){var count=0, lastCalled=0;return function(key, value){var stamp=now(), remaining=HOT_SPAN - (stamp - lastCalled);lastCalled = stamp;if(remaining > 0){if(++count >= HOT_COUNT){return key;}}else {count = 0;}return baseSetData(key, value);};})();function shimIsPlainObject(value){var Ctor, support=lodash.support;if(!(isObjectLike(value) && objToString.call(value) == objectTag) || !hasOwnProperty.call(value, "constructor") && (Ctor = value.constructor, typeof Ctor == "function" && !(Ctor instanceof Ctor))){return false;}var result;baseForIn(value, function(subValue, key){result = key;});return typeof result == "undefined" || hasOwnProperty.call(value, result);}function shimKeys(object){var props=keysIn(object), propsLength=props.length, length=propsLength && object.length, support=lodash.support;var allowIndexes=length && isLength(length) && (isArray(object) || support.nonEnumArgs && isArguments(object));var index=-1, result=[];while(++index < propsLength) {var key=props[index];if(allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)){result.push(key);}}return result;}function toIterable(value){if(value == null){return [];}if(!isLength(value.length)){return values(value);}return isObject(value)?value:Object(value);}function toObject(value){return isObject(value)?value:Object(value);}function wrapperClone(wrapper){return wrapper instanceof LazyWrapper?wrapper.clone():new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));}function chunk(array, size, guard){if(guard?isIterateeCall(array, size, guard):size == null){size = 1;}else {size = nativeMax(+size || 1, 1);}var index=0, length=array?array.length:0, resIndex=-1, result=Array(ceil(length / size));while(index < length) {result[++resIndex] = baseSlice(array, index, index += size);}return result;}function compact(array){var index=-1, length=array?array.length:0, resIndex=-1, result=[];while(++index < length) {var value=array[index];if(value){result[++resIndex] = value;}}return result;}function difference(){var index=-1, length=arguments.length;while(++index < length) {var value=arguments[index];if(isArray(value) || isArguments(value)){break;}}return baseDifference(value, baseFlatten(arguments, false, true, ++index));}function drop(array, n, guard){var length=array?array.length:0;if(!length){return [];}if(guard?isIterateeCall(array, n, guard):n == null){n = 1;}return baseSlice(array, n < 0?0:n);}function dropRight(array, n, guard){var length=array?array.length:0;if(!length){return [];}if(guard?isIterateeCall(array, n, guard):n == null){n = 1;}n = length - (+n || 0);return baseSlice(array, 0, n < 0?0:n);}function dropRightWhile(array, predicate, thisArg){var length=array?array.length:0;if(!length){return [];}predicate = getCallback(predicate, thisArg, 3);while(length-- && predicate(array[length], length, array)) {}return baseSlice(array, 0, length + 1);}function dropWhile(array, predicate, thisArg){var length=array?array.length:0;if(!length){return [];}var index=-1;predicate = getCallback(predicate, thisArg, 3);while(++index < length && predicate(array[index], index, array)) {}return baseSlice(array, index);}function fill(array, value, start, end){var length=array?array.length:0;if(!length){return [];}if(start && typeof start != "number" && isIterateeCall(array, value, start)){start = 0;end = length;}return baseFill(array, value, start, end);}function findIndex(array, predicate, thisArg){var index=-1, length=array?array.length:0;predicate = getCallback(predicate, thisArg, 3);while(++index < length) {if(predicate(array[index], index, array)){return index;}}return -1;}function findLastIndex(array, predicate, thisArg){var length=array?array.length:0;predicate = getCallback(predicate, thisArg, 3);while(length--) {if(predicate(array[length], length, array)){return length;}}return -1;}function first(array){return array?array[0]:undefined;}function flatten(array, isDeep, guard){var length=array?array.length:0;if(guard && isIterateeCall(array, isDeep, guard)){isDeep = false;}return length?baseFlatten(array, isDeep):[];}function flattenDeep(array){var length=array?array.length:0;return length?baseFlatten(array, true):[];}function indexOf(array, value, fromIndex){var length=array?array.length:0;if(!length){return -1;}if(typeof fromIndex == "number"){fromIndex = fromIndex < 0?nativeMax(length + fromIndex, 0):fromIndex || 0;}else if(fromIndex){var index=binaryIndex(array, value), other=array[index];return (value === value?value === other:other !== other)?index:-1;}return baseIndexOf(array, value, fromIndex);}function initial(array){return dropRight(array, 1);}function intersection(){var args=[], argsIndex=-1, argsLength=arguments.length, caches=[], indexOf=getIndexOf(), isCommon=indexOf == baseIndexOf;while(++argsIndex < argsLength) {var value=arguments[argsIndex];if(isArray(value) || isArguments(value)){args.push(value);caches.push(isCommon && value.length >= 120?createCache(argsIndex && value):null);}}argsLength = args.length;var array=args[0], index=-1, length=array?array.length:0, result=[], seen=caches[0];outer: while(++index < length) {value = array[index];if((seen?cacheIndexOf(seen, value):indexOf(result, value)) < 0){argsIndex = argsLength;while(--argsIndex) {var cache=caches[argsIndex];if((cache?cacheIndexOf(cache, value):indexOf(args[argsIndex], value)) < 0){continue outer;}}if(seen){seen.push(value);}result.push(value);}}return result;}function last(array){var length=array?array.length:0;return length?array[length - 1]:undefined;}function lastIndexOf(array, value, fromIndex){var length=array?array.length:0;if(!length){return -1;}var index=length;if(typeof fromIndex == "number"){index = (fromIndex < 0?nativeMax(length + fromIndex, 0):nativeMin(fromIndex || 0, length - 1)) + 1;}else if(fromIndex){index = binaryIndex(array, value, true) - 1;var other=array[index];return (value === value?value === other:other !== other)?index:-1;}if(value !== value){return indexOfNaN(array, index, true);}while(index--) {if(array[index] === value){return index;}}return -1;}function pull(){var array=arguments[0];if(!(array && array.length)){return array;}var index=0, indexOf=getIndexOf(), length=arguments.length;while(++index < length) {var fromIndex=0, value=arguments[index];while((fromIndex = indexOf(array, value, fromIndex)) > -1) {splice.call(array, fromIndex, 1);}}return array;}function pullAt(array){return basePullAt(array || [], baseFlatten(arguments, false, false, 1));}function remove(array, predicate, thisArg){var index=-1, length=array?array.length:0, result=[];predicate = getCallback(predicate, thisArg, 3);while(++index < length) {var value=array[index];if(predicate(value, index, array)){result.push(value);splice.call(array, index--, 1);length--;}}return result;}function rest(array){return drop(array, 1);}function slice(array, start, end){var length=array?array.length:0;if(!length){return [];}if(end && typeof end != "number" && isIterateeCall(array, start, end)){start = 0;end = length;}return baseSlice(array, start, end);}function sortedIndex(array, value, iteratee, thisArg){var func=getCallback(iteratee);return func === baseCallback && iteratee == null?binaryIndex(array, value):binaryIndexBy(array, value, func(iteratee, thisArg, 1));}function sortedLastIndex(array, value, iteratee, thisArg){var func=getCallback(iteratee);return func === baseCallback && iteratee == null?binaryIndex(array, value, true):binaryIndexBy(array, value, func(iteratee, thisArg, 1), true);}function take(array, n, guard){var length=array?array.length:0;if(!length){return [];}if(guard?isIterateeCall(array, n, guard):n == null){n = 1;}return baseSlice(array, 0, n < 0?0:n);}function takeRight(array, n, guard){var length=array?array.length:0;if(!length){return [];}if(guard?isIterateeCall(array, n, guard):n == null){n = 1;}n = length - (+n || 0);return baseSlice(array, n < 0?0:n);}function takeRightWhile(array, predicate, thisArg){var length=array?array.length:0;if(!length){return [];}predicate = getCallback(predicate, thisArg, 3);while(length-- && predicate(array[length], length, array)) {}return baseSlice(array, length + 1);}function takeWhile(array, predicate, thisArg){var length=array?array.length:0;if(!length){return [];}var index=-1;predicate = getCallback(predicate, thisArg, 3);while(++index < length && predicate(array[index], index, array)) {}return baseSlice(array, 0, index);}function union(){return baseUniq(baseFlatten(arguments, false, true));}function uniq(array, isSorted, iteratee, thisArg){var length=array?array.length:0;if(!length){return [];}if(isSorted != null && typeof isSorted != "boolean"){thisArg = iteratee;iteratee = isIterateeCall(array, isSorted, thisArg)?null:isSorted;isSorted = false;}var func=getCallback();if(!(func === baseCallback && iteratee == null)){iteratee = func(iteratee, thisArg, 3);}return isSorted && getIndexOf() == baseIndexOf?sortedUniq(array, iteratee):baseUniq(array, iteratee);}function unzip(array){var index=-1, length=(array && array.length && arrayMax(arrayMap(array, getLength))) >>> 0, result=Array(length);while(++index < length) {result[index] = arrayMap(array, baseProperty(index));}return result;}function without(array){return baseDifference(array, baseSlice(arguments, 1));}function xor(){var index=-1, length=arguments.length;while(++index < length) {var array=arguments[index];if(isArray(array) || isArguments(array)){var result=result?baseDifference(result, array).concat(baseDifference(array, result)):array;}}return result?baseUniq(result):[];}function zip(){var length=arguments.length, array=Array(length);while(length--) {array[length] = arguments[length];}return unzip(array);}function zipObject(props, values){var index=-1, length=props?props.length:0, result={};if(length && !values && !isArray(props[0])){values = [];}while(++index < length) {var key=props[index];if(values){result[key] = values[index];}else if(key){result[key[0]] = key[1];}}return result;}function chain(value){var result=lodash(value);result.__chain__ = true;return result;}function tap(value, interceptor, thisArg){interceptor.call(thisArg, value);return value;}function thru(value, interceptor, thisArg){return interceptor.call(thisArg, value);}function wrapperChain(){return chain(this);}function wrapperCommit(){return new LodashWrapper(this.value(), this.__chain__);}function wrapperPlant(value){var result, parent=this;while(parent instanceof baseLodash) {var clone=wrapperClone(parent);if(result){previous.__wrapped__ = clone;}else {result = clone;}var previous=clone;parent = parent.__wrapped__;}previous.__wrapped__ = value;return result;}function wrapperReverse(){var value=this.__wrapped__;if(value instanceof LazyWrapper){if(this.__actions__.length){value = new LazyWrapper(this);}return new LodashWrapper(value.reverse(), this.__chain__);}return this.thru(function(value){return value.reverse();});}function wrapperToString(){return this.value() + "";}function wrapperValue(){return baseWrapperValue(this.__wrapped__, this.__actions__);}function at(collection){var length=collection?collection.length:0;if(isLength(length)){collection = toIterable(collection);}return baseAt(collection, baseFlatten(arguments, false, false, 1));}var countBy=createAggregator(function(result, value, key){hasOwnProperty.call(result, key)?++result[key]:result[key] = 1;});function every(collection, predicate, thisArg){var func=isArray(collection)?arrayEvery:baseEvery;if(typeof predicate != "function" || typeof thisArg != "undefined"){predicate = getCallback(predicate, thisArg, 3);}return func(collection, predicate);}function filter(collection, predicate, thisArg){var func=isArray(collection)?arrayFilter:baseFilter;predicate = getCallback(predicate, thisArg, 3);return func(collection, predicate);}function find(collection, predicate, thisArg){if(isArray(collection)){var index=findIndex(collection, predicate, thisArg);return index > -1?collection[index]:undefined;}predicate = getCallback(predicate, thisArg, 3);return baseFind(collection, predicate, baseEach);}function findLast(collection, predicate, thisArg){predicate = getCallback(predicate, thisArg, 3);return baseFind(collection, predicate, baseEachRight);}function findWhere(collection, source){return find(collection, baseMatches(source));}function forEach(collection, iteratee, thisArg){return typeof iteratee == "function" && typeof thisArg == "undefined" && isArray(collection)?arrayEach(collection, iteratee):baseEach(collection, bindCallback(iteratee, thisArg, 3));}function forEachRight(collection, iteratee, thisArg){return typeof iteratee == "function" && typeof thisArg == "undefined" && isArray(collection)?arrayEachRight(collection, iteratee):baseEachRight(collection, bindCallback(iteratee, thisArg, 3));}var groupBy=createAggregator(function(result, value, key){if(hasOwnProperty.call(result, key)){result[key].push(value);}else {result[key] = [value];}});function includes(collection, target, fromIndex){var length=collection?collection.length:0;if(!isLength(length)){collection = values(collection);length = collection.length;}if(!length){return false;}if(typeof fromIndex == "number"){fromIndex = fromIndex < 0?nativeMax(length + fromIndex, 0):fromIndex || 0;}else {fromIndex = 0;}return typeof collection == "string" || !isArray(collection) && isString(collection)?fromIndex < length && collection.indexOf(target, fromIndex) > -1:getIndexOf(collection, target, fromIndex) > -1;}var indexBy=createAggregator(function(result, value, key){result[key] = value;});function invoke(collection, methodName){return baseInvoke(collection, methodName, baseSlice(arguments, 2));}function map(collection, iteratee, thisArg){var func=isArray(collection)?arrayMap:baseMap;iteratee = getCallback(iteratee, thisArg, 3);return func(collection, iteratee);}var max=createExtremum(arrayMax);var min=createExtremum(arrayMin, true);var partition=createAggregator(function(result, value, key){result[key?0:1].push(value);}, function(){return [[], []];});function pluck(collection, key){return map(collection, baseProperty(key));}function reduce(collection, iteratee, accumulator, thisArg){var func=isArray(collection)?arrayReduce:baseReduce;return func(collection, getCallback(iteratee, thisArg, 4), accumulator, arguments.length < 3, baseEach);}function reduceRight(collection, iteratee, accumulator, thisArg){var func=isArray(collection)?arrayReduceRight:baseReduce;return func(collection, getCallback(iteratee, thisArg, 4), accumulator, arguments.length < 3, baseEachRight);}function reject(collection, predicate, thisArg){var func=isArray(collection)?arrayFilter:baseFilter;predicate = getCallback(predicate, thisArg, 3);return func(collection, function(value, index, collection){return !predicate(value, index, collection);});}function sample(collection, n, guard){if(guard?isIterateeCall(collection, n, guard):n == null){collection = toIterable(collection);var length=collection.length;return length > 0?collection[baseRandom(0, length - 1)]:undefined;}var result=shuffle(collection);result.length = nativeMin(n < 0?0:+n || 0, result.length);return result;}function shuffle(collection){collection = toIterable(collection);var index=-1, length=collection.length, result=Array(length);while(++index < length) {var rand=baseRandom(0, index);if(index != rand){result[index] = result[rand];}result[rand] = collection[index];}return result;}function size(collection){var length=collection?collection.length:0;return isLength(length)?length:keys(collection).length;}function some(collection, predicate, thisArg){var func=isArray(collection)?arraySome:baseSome;if(typeof predicate != "function" || typeof thisArg != "undefined"){predicate = getCallback(predicate, thisArg, 3);}return func(collection, predicate);}function sortBy(collection, iteratee, thisArg){var index=-1, length=collection?collection.length:0, result=isLength(length)?Array(length):[];if(thisArg && isIterateeCall(collection, iteratee, thisArg)){iteratee = null;}iteratee = getCallback(iteratee, thisArg, 3);baseEach(collection, function(value, key, collection){result[++index] = {criteria:iteratee(value, key, collection), index:index, value:value};});return baseSortBy(result, compareAscending);}function sortByAll(collection){var args=arguments;if(args.length > 3 && isIterateeCall(args[1], args[2], args[3])){args = [collection, args[1]];}var index=-1, length=collection?collection.length:0, props=baseFlatten(args, false, false, 1), result=isLength(length)?Array(length):[];baseEach(collection, function(value){var length=props.length, criteria=Array(length);while(length--) {criteria[length] = value == null?undefined:value[props[length]];}result[++index] = {criteria:criteria, index:index, value:value};});return baseSortBy(result, compareMultipleAscending);}function where(collection, source){return filter(collection, baseMatches(source));}var now=nativeNow || function(){return new Date().getTime();};function after(n, func){if(typeof func != "function"){if(typeof n == "function"){var temp=n;n = func;func = temp;}else {throw new TypeError(FUNC_ERROR_TEXT);}}n = nativeIsFinite(n = +n)?n:0;return function(){if(--n < 1){return func.apply(this, arguments);}};}function ary(func, n, guard){if(guard && isIterateeCall(func, n, guard)){n = null;}n = func && n == null?func.length:nativeMax(+n || 0, 0);return createWrapper(func, ARY_FLAG, null, null, null, null, n);}function before(n, func){var result;if(typeof func != "function"){if(typeof n == "function"){var temp=n;n = func;func = temp;}else {throw new TypeError(FUNC_ERROR_TEXT);}}return function(){if(--n > 0){result = func.apply(this, arguments);}else {func = null;}return result;};}function bind(func, thisArg){var bitmask=BIND_FLAG;if(arguments.length > 2){var partials=baseSlice(arguments, 2), holders=replaceHolders(partials, bind.placeholder);bitmask |= PARTIAL_FLAG;}return createWrapper(func, bitmask, thisArg, partials, holders);}function bindAll(object){return baseBindAll(object, arguments.length > 1?baseFlatten(arguments, false, false, 1):functions(object));}function bindKey(object, key){var bitmask=BIND_FLAG | BIND_KEY_FLAG;if(arguments.length > 2){var partials=baseSlice(arguments, 2), holders=replaceHolders(partials, bindKey.placeholder);bitmask |= PARTIAL_FLAG;}return createWrapper(key, bitmask, object, partials, holders);}function curry(func, arity, guard){if(guard && isIterateeCall(func, arity, guard)){arity = null;}var result=createWrapper(func, CURRY_FLAG, null, null, null, null, null, arity);result.placeholder = curry.placeholder;return result;}function curryRight(func, arity, guard){if(guard && isIterateeCall(func, arity, guard)){arity = null;}var result=createWrapper(func, CURRY_RIGHT_FLAG, null, null, null, null, null, arity);result.placeholder = curryRight.placeholder;return result;}function debounce(func, wait, options){var args, maxTimeoutId, result, stamp, thisArg, timeoutId, trailingCall, lastCalled=0, maxWait=false, trailing=true;if(typeof func != "function"){throw new TypeError(FUNC_ERROR_TEXT);}wait = wait < 0?0:+wait || 0;if(options === true){var leading=true;trailing = false;}else if(isObject(options)){leading = options.leading;maxWait = "maxWait" in options && nativeMax(+options.maxWait || 0, wait);trailing = "trailing" in options?options.trailing:trailing;}function cancel(){if(timeoutId){clearTimeout(timeoutId);}if(maxTimeoutId){clearTimeout(maxTimeoutId);}maxTimeoutId = timeoutId = trailingCall = undefined;}function delayed(){var remaining=wait - (now() - stamp);if(remaining <= 0 || remaining > wait){if(maxTimeoutId){clearTimeout(maxTimeoutId);}var isCalled=trailingCall;maxTimeoutId = timeoutId = trailingCall = undefined;if(isCalled){lastCalled = now();result = func.apply(thisArg, args);if(!timeoutId && !maxTimeoutId){args = thisArg = null;}}}else {timeoutId = setTimeout(delayed, remaining);}}function maxDelayed(){if(timeoutId){clearTimeout(timeoutId);}maxTimeoutId = timeoutId = trailingCall = undefined;if(trailing || maxWait !== wait){lastCalled = now();result = func.apply(thisArg, args);if(!timeoutId && !maxTimeoutId){args = thisArg = null;}}}function debounced(){args = arguments;stamp = now();thisArg = this;trailingCall = trailing && (timeoutId || !leading);if(maxWait === false){var leadingCall=leading && !timeoutId;}else {if(!maxTimeoutId && !leading){lastCalled = stamp;}var remaining=maxWait - (stamp - lastCalled), isCalled=remaining <= 0 || remaining > maxWait;if(isCalled){if(maxTimeoutId){maxTimeoutId = clearTimeout(maxTimeoutId);}lastCalled = stamp;result = func.apply(thisArg, args);}else if(!maxTimeoutId){maxTimeoutId = setTimeout(maxDelayed, remaining);}}if(isCalled && timeoutId){timeoutId = clearTimeout(timeoutId);}else if(!timeoutId && wait !== maxWait){timeoutId = setTimeout(delayed, wait);}if(leadingCall){isCalled = true;result = func.apply(thisArg, args);}if(isCalled && !timeoutId && !maxTimeoutId){args = thisArg = null;}return result;}debounced.cancel = cancel;return debounced;}function defer(func){return baseDelay(func, 1, arguments, 1);}function delay(func, wait){return baseDelay(func, wait, arguments, 2);}function flow(){var funcs=arguments, length=funcs.length;if(!length){return function(){return arguments[0];};}if(!arrayEvery(funcs, baseIsFunction)){throw new TypeError(FUNC_ERROR_TEXT);}return function(){var index=0, result=funcs[index].apply(this, arguments);while(++index < length) {result = funcs[index].call(this, result);}return result;};}function flowRight(){var funcs=arguments, fromIndex=funcs.length - 1;if(fromIndex < 0){return function(){return arguments[0];};}if(!arrayEvery(funcs, baseIsFunction)){throw new TypeError(FUNC_ERROR_TEXT);}return function(){var index=fromIndex, result=funcs[index].apply(this, arguments);while(index--) {result = funcs[index].call(this, result);}return result;};}function memoize(func, resolver){if(typeof func != "function" || resolver && typeof resolver != "function"){throw new TypeError(FUNC_ERROR_TEXT);}var memoized=(function(_memoized){var _memoizedWrapper=function memoized(){return _memoized.apply(this, arguments);};_memoizedWrapper.toString = function(){return _memoized.toString();};return _memoizedWrapper;})(function(){var cache=memoized.cache, key=resolver?resolver.apply(this, arguments):arguments[0];if(cache.has(key)){return cache.get(key);}var result=func.apply(this, arguments);cache.set(key, result);return result;});memoized.cache = new memoize.Cache();return memoized;}function negate(predicate){if(typeof predicate != "function"){throw new TypeError(FUNC_ERROR_TEXT);}return function(){return !predicate.apply(this, arguments);};}function once(func){return before(func, 2);}function partial(func){var partials=baseSlice(arguments, 1), holders=replaceHolders(partials, partial.placeholder);return createWrapper(func, PARTIAL_FLAG, null, partials, holders);}function partialRight(func){var partials=baseSlice(arguments, 1), holders=replaceHolders(partials, partialRight.placeholder);return createWrapper(func, PARTIAL_RIGHT_FLAG, null, partials, holders);}function rearg(func){var indexes=baseFlatten(arguments, false, false, 1);return createWrapper(func, REARG_FLAG, null, null, null, indexes);}function spread(func){if(typeof func != "function"){throw new TypeError(FUNC_ERROR_TEXT);}return function(array){return func.apply(this, array);};}function throttle(func, wait, options){var leading=true, trailing=true;if(typeof func != "function"){throw new TypeError(FUNC_ERROR_TEXT);}if(options === false){leading = false;}else if(isObject(options)){leading = "leading" in options?!!options.leading:leading;trailing = "trailing" in options?!!options.trailing:trailing;}debounceOptions.leading = leading;debounceOptions.maxWait = +wait;debounceOptions.trailing = trailing;return debounce(func, wait, debounceOptions);}function wrap(value, wrapper){wrapper = wrapper == null?identity:wrapper;return createWrapper(wrapper, PARTIAL_FLAG, null, [value], []);}function clone(value, isDeep, customizer, thisArg){if(isDeep && typeof isDeep != "boolean" && isIterateeCall(value, isDeep, customizer)){isDeep = false;}else if(typeof isDeep == "function"){thisArg = customizer;customizer = isDeep;isDeep = false;}customizer = typeof customizer == "function" && bindCallback(customizer, thisArg, 1);return baseClone(value, isDeep, customizer);}function cloneDeep(value, customizer, thisArg){customizer = typeof customizer == "function" && bindCallback(customizer, thisArg, 1);return baseClone(value, true, customizer);}function isArguments(value){var length=isObjectLike(value)?value.length:undefined;return isLength(length) && objToString.call(value) == argsTag || false;}var isArray=nativeIsArray || function(value){return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag || false;};function isBoolean(value){return value === true || value === false || isObjectLike(value) && objToString.call(value) == boolTag || false;}function isDate(value){return isObjectLike(value) && objToString.call(value) == dateTag || false;}function isElement(value){return value && value.nodeType === 1 && isObjectLike(value) && objToString.call(value).indexOf("Element") > -1 || false;}if(!support.dom){isElement = function(value){return value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value) || false;};}function isEmpty(value){if(value == null){return true;}var length=value.length;if(isLength(length) && (isArray(value) || isString(value) || isArguments(value) || isObjectLike(value) && isFunction(value.splice))){return !length;}return !keys(value).length;}function isEqual(value, other, customizer, thisArg){customizer = typeof customizer == "function" && bindCallback(customizer, thisArg, 3);if(!customizer && isStrictComparable(value) && isStrictComparable(other)){return value === other;}var result=customizer?customizer(value, other):undefined;return typeof result == "undefined"?baseIsEqual(value, other, customizer):!!result;}function isError(value){return isObjectLike(value) && typeof value.message == "string" && objToString.call(value) == errorTag || false;}var isFinite=nativeNumIsFinite || function(value){return typeof value == "number" && nativeIsFinite(value);};var isFunction=!(baseIsFunction(/x/) || Uint8Array && !baseIsFunction(Uint8Array))?baseIsFunction:function(value){return objToString.call(value) == funcTag;};function isObject(value){var type=typeof value;return type == "function" || value && type == "object" || false;}function isMatch(object, source, customizer, thisArg){var props=keys(source), length=props.length;customizer = typeof customizer == "function" && bindCallback(customizer, thisArg, 3);if(!customizer && length == 1){var key=props[0], value=source[key];if(isStrictComparable(value)){return object != null && value === object[key] && hasOwnProperty.call(object, key);}}var values=Array(length), strictCompareFlags=Array(length);while(length--) {value = values[length] = source[props[length]];strictCompareFlags[length] = isStrictComparable(value);}return baseIsMatch(object, props, values, strictCompareFlags, customizer);}function isNaN(value){return isNumber(value) && value != +value;}function isNative(value){if(value == null){return false;}if(objToString.call(value) == funcTag){return reNative.test(fnToString.call(value));}return isObjectLike(value) && reHostCtor.test(value) || false;}function isNull(value){return value === null;}function isNumber(value){return typeof value == "number" || isObjectLike(value) && objToString.call(value) == numberTag || false;}var isPlainObject=!getPrototypeOf?shimIsPlainObject:function(value){if(!(value && objToString.call(value) == objectTag)){return false;}var valueOf=value.valueOf, objProto=isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);return objProto?value == objProto || getPrototypeOf(value) == objProto:shimIsPlainObject(value);};function isRegExp(value){return isObjectLike(value) && objToString.call(value) == regexpTag || false;}function isString(value){return typeof value == "string" || isObjectLike(value) && objToString.call(value) == stringTag || false;}function isTypedArray(value){return isObjectLike(value) && isLength(value.length) && typedArrayTags[objToString.call(value)] || false;}function isUndefined(value){return typeof value == "undefined";}function toArray(value){var length=value?value.length:0;if(!isLength(length)){return values(value);}if(!length){return [];}return arrayCopy(value);}function toPlainObject(value){return baseCopy(value, keysIn(value));}var assign=createAssigner(baseAssign);function create(prototype, properties, guard){var result=baseCreate(prototype);if(guard && isIterateeCall(prototype, properties, guard)){properties = null;}return properties?baseCopy(properties, result, keys(properties)):result;}function defaults(object){if(object == null){return object;}var args=arrayCopy(arguments);args.push(assignDefaults);return assign.apply(undefined, args);}function findKey(object, predicate, thisArg){predicate = getCallback(predicate, thisArg, 3);return baseFind(object, predicate, baseForOwn, true);}function findLastKey(object, predicate, thisArg){predicate = getCallback(predicate, thisArg, 3);return baseFind(object, predicate, baseForOwnRight, true);}function forIn(object, iteratee, thisArg){if(typeof iteratee != "function" || typeof thisArg != "undefined"){iteratee = bindCallback(iteratee, thisArg, 3);}return baseFor(object, iteratee, keysIn);}function forInRight(object, iteratee, thisArg){iteratee = bindCallback(iteratee, thisArg, 3);return baseForRight(object, iteratee, keysIn);}function forOwn(object, iteratee, thisArg){if(typeof iteratee != "function" || typeof thisArg != "undefined"){iteratee = bindCallback(iteratee, thisArg, 3);}return baseForOwn(object, iteratee);}function forOwnRight(object, iteratee, thisArg){iteratee = bindCallback(iteratee, thisArg, 3);return baseForRight(object, iteratee, keys);}function functions(object){return baseFunctions(object, keysIn(object));}function has(object, key){return object?hasOwnProperty.call(object, key):false;}function invert(object, multiValue, guard){if(guard && isIterateeCall(object, multiValue, guard)){multiValue = null;}var index=-1, props=keys(object), length=props.length, result={};while(++index < length) {var key=props[index], value=object[key];if(multiValue){if(hasOwnProperty.call(result, value)){result[value].push(key);}else {result[value] = [key];}}else {result[value] = key;}}return result;}var keys=!nativeKeys?shimKeys:function(object){if(object){var Ctor=object.constructor, length=object.length;}if(typeof Ctor == "function" && Ctor.prototype === object || typeof object != "function" && (length && isLength(length))){return shimKeys(object);}return isObject(object)?nativeKeys(object):[];};function keysIn(object){if(object == null){return [];}if(!isObject(object)){object = Object(object);}var length=object.length;length = length && isLength(length) && (isArray(object) || support.nonEnumArgs && isArguments(object)) && length || 0;var Ctor=object.constructor, index=-1, isProto=typeof Ctor == "function" && Ctor.prototype === object, result=Array(length), skipIndexes=length > 0;while(++index < length) {result[index] = index + "";}for(var key in object) {if(!(skipIndexes && isIndex(key, length)) && !(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))){result.push(key);}}return result;}function mapValues(object, iteratee, thisArg){var result={};iteratee = getCallback(iteratee, thisArg, 3);baseForOwn(object, function(value, key, object){result[key] = iteratee(value, key, object);});return result;}var merge=createAssigner(baseMerge);function omit(object, predicate, thisArg){if(object == null){return {};}if(typeof predicate != "function"){var props=arrayMap(baseFlatten(arguments, false, false, 1), String);return pickByArray(object, baseDifference(keysIn(object), props));}predicate = bindCallback(predicate, thisArg, 3);return pickByCallback(object, function(value, key, object){return !predicate(value, key, object);});}function pairs(object){var index=-1, props=keys(object), length=props.length, result=Array(length);while(++index < length) {var key=props[index];result[index] = [key, object[key]];}return result;}function pick(object, predicate, thisArg){if(object == null){return {};}return typeof predicate == "function"?pickByCallback(object, bindCallback(predicate, thisArg, 3)):pickByArray(object, baseFlatten(arguments, false, false, 1));}function result(object, key, defaultValue){var value=object == null?undefined:object[key];if(typeof value == "undefined"){value = defaultValue;}return isFunction(value)?value.call(object):value;}function transform(object, iteratee, accumulator, thisArg){var isArr=isArray(object) || isTypedArray(object);iteratee = getCallback(iteratee, thisArg, 4);if(accumulator == null){if(isArr || isObject(object)){var Ctor=object.constructor;if(isArr){accumulator = isArray(object)?new Ctor():[];}else {accumulator = baseCreate(isFunction(Ctor) && Ctor.prototype);}}else {accumulator = {};}}(isArr?arrayEach:baseForOwn)(object, function(value, index, object){return iteratee(accumulator, value, index, object);});return accumulator;}function values(object){return baseValues(object, keys(object));}function valuesIn(object){return baseValues(object, keysIn(object));}function inRange(value, start, end){start = +start || 0;if(typeof end === "undefined"){end = start;start = 0;}else {end = +end || 0;}return value >= start && value < end;}function random(min, max, floating){if(floating && isIterateeCall(min, max, floating)){max = floating = null;}var noMin=min == null, noMax=max == null;if(floating == null){if(noMax && typeof min == "boolean"){floating = min;min = 1;}else if(typeof max == "boolean"){floating = max;noMax = true;}}if(noMin && noMax){max = 1;noMax = false;}min = +min || 0;if(noMax){max = min;min = 0;}else {max = +max || 0;}if(floating || min % 1 || max % 1){var rand=nativeRandom();return nativeMin(min + rand * (max - min + parseFloat("1e-" + ((rand + "").length - 1))), max);}return baseRandom(min, max);}var camelCase=createCompounder(function(result, word, index){word = word.toLowerCase();return result + (index?word.charAt(0).toUpperCase() + word.slice(1):word);});function capitalize(string){string = baseToString(string);return string && string.charAt(0).toUpperCase() + string.slice(1);}function deburr(string){string = baseToString(string);return string && string.replace(reLatin1, deburrLetter);}function endsWith(string, target, position){string = baseToString(string);target = target + "";var length=string.length;position = (typeof position == "undefined"?length:nativeMin(position < 0?0:+position || 0, length)) - target.length;return position >= 0 && string.indexOf(target, position) == position;}function escape(string){string = baseToString(string);return string && reHasUnescapedHtml.test(string)?string.replace(reUnescapedHtml, escapeHtmlChar):string;}function escapeRegExp(string){string = baseToString(string);return string && reHasRegExpChars.test(string)?string.replace(reRegExpChars, "\\$&"):string;}var kebabCase=createCompounder(function(result, word, index){return result + (index?"-":"") + word.toLowerCase();});function pad(string, length, chars){string = baseToString(string);length = +length;var strLength=string.length;if(strLength >= length || !nativeIsFinite(length)){return string;}var mid=(length - strLength) / 2, leftLength=floor(mid), rightLength=ceil(mid);chars = createPad("", rightLength, chars);return chars.slice(0, leftLength) + string + chars;}function padLeft(string, length, chars){string = baseToString(string);return string && createPad(string, length, chars) + string;}function padRight(string, length, chars){string = baseToString(string);return string && string + createPad(string, length, chars);}function parseInt(string, radix, guard){if(guard && isIterateeCall(string, radix, guard)){radix = 0;}return nativeParseInt(string, radix);}if(nativeParseInt(whitespace + "08") != 8){parseInt = function(string, radix, guard){if(guard?isIterateeCall(string, radix, guard):radix == null){radix = 0;}else if(radix){radix = +radix;}string = trim(string);return nativeParseInt(string, radix || (reHexPrefix.test(string)?16:10));};}function repeat(string, n){var result="";string = baseToString(string);n = +n;if(n < 1 || !string || !nativeIsFinite(n)){return result;}do{if(n % 2){result += string;}n = floor(n / 2);string += string;}while(n);return result;}var snakeCase=createCompounder(function(result, word, index){return result + (index?"_":"") + word.toLowerCase();});var startCase=createCompounder(function(result, word, index){return result + (index?" ":"") + (word.charAt(0).toUpperCase() + word.slice(1));});function startsWith(string, target, position){string = baseToString(string);position = position == null?0:nativeMin(position < 0?0:+position || 0, string.length);return string.lastIndexOf(target, position) == position;}function template(string, options, otherOptions){var settings=lodash.templateSettings;if(otherOptions && isIterateeCall(string, options, otherOptions)){options = otherOptions = null;}string = baseToString(string);options = baseAssign(baseAssign({}, otherOptions || options), settings, assignOwnDefaults);var imports=baseAssign(baseAssign({}, options.imports), settings.imports, assignOwnDefaults), importsKeys=keys(imports), importsValues=baseValues(imports, importsKeys);var isEscaping, isEvaluating, index=0, interpolate=options.interpolate || reNoMatch, source="__p += '";var reDelimiters=RegExp((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate?reEsTemplate:reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g");var sourceURL="//# sourceURL=" + ("sourceURL" in options?options.sourceURL:"lodash.templateSources[" + ++templateCounter + "]") + "\n";string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset){interpolateValue || (interpolateValue = esTemplateValue);source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);if(escapeValue){isEscaping = true;source += "' +\n__e(" + escapeValue + ") +\n'";}if(evaluateValue){isEvaluating = true;source += "';\n" + evaluateValue + ";\n__p += '";}if(interpolateValue){source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";}index = offset + match.length;return match;});source += "';\n";var variable=options.variable;if(!variable){source = "with (obj) {\n" + source + "\n}\n";}source = (isEvaluating?source.replace(reEmptyStringLeading, ""):source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");source = "function(" + (variable || "obj") + ") {\n" + (variable?"":"obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping?", __e = _.escape":"") + (isEvaluating?", __j = Array.prototype.join;\n" + "function print() { __p += __j.call(arguments, '') }\n":";\n") + source + "return __p\n}";var result=attempt(function(){return Function(importsKeys, sourceURL + "return " + source).apply(undefined, importsValues);});result.source = source;if(isError(result)){throw result;}return result;}function trim(string, chars, guard){var value=string;string = baseToString(string);if(!string){return string;}if(guard?isIterateeCall(value, chars, guard):chars == null){return string.slice(trimmedLeftIndex(string), trimmedRightIndex(string) + 1);}chars = chars + "";return string.slice(charsLeftIndex(string, chars), charsRightIndex(string, chars) + 1);}function trimLeft(string, chars, guard){var value=string;string = baseToString(string);if(!string){return string;}if(guard?isIterateeCall(value, chars, guard):chars == null){return string.slice(trimmedLeftIndex(string));}return string.slice(charsLeftIndex(string, chars + ""));}function trimRight(string, chars, guard){var value=string;string = baseToString(string);if(!string){return string;}if(guard?isIterateeCall(value, chars, guard):chars == null){return string.slice(0, trimmedRightIndex(string) + 1);}return string.slice(0, charsRightIndex(string, chars + "") + 1);}function trunc(string, options, guard){if(guard && isIterateeCall(string, options, guard)){options = null;}var length=DEFAULT_TRUNC_LENGTH, omission=DEFAULT_TRUNC_OMISSION;if(options != null){if(isObject(options)){var separator="separator" in options?options.separator:separator;length = "length" in options?+options.length || 0:length;omission = "omission" in options?baseToString(options.omission):omission;}else {length = +options || 0;}}string = baseToString(string);if(length >= string.length){return string;}var end=length - omission.length;if(end < 1){return omission;}var result=string.slice(0, end);if(separator == null){return result + omission;}if(isRegExp(separator)){if(string.slice(end).search(separator)){var match, newEnd, substring=string.slice(0, end);if(!separator.global){separator = RegExp(separator.source, (reFlags.exec(separator) || "") + "g");}separator.lastIndex = 0;while(match = separator.exec(substring)) {newEnd = match.index;}result = result.slice(0, newEnd == null?end:newEnd);}}else if(string.indexOf(separator, end) != end){var index=result.lastIndexOf(separator);if(index > -1){result = result.slice(0, index);}}return result + omission;}function unescape(string){string = baseToString(string);return string && reHasEscapedHtml.test(string)?string.replace(reEscapedHtml, unescapeHtmlChar):string;}function words(string, pattern, guard){if(guard && isIterateeCall(string, pattern, guard)){pattern = null;}string = baseToString(string);return string.match(pattern || reWords) || [];}function attempt(){var length=arguments.length, func=arguments[0];try{var args=Array(length?length - 1:0);while(--length > 0) {args[length - 1] = arguments[length];}return func.apply(undefined, args);}catch(e) {return isError(e)?e:new Error(e);}}function callback(func, thisArg, guard){if(guard && isIterateeCall(func, thisArg, guard)){thisArg = null;}return isObjectLike(func)?matches(func):baseCallback(func, thisArg);}function constant(value){return function(){return value;};}function identity(value){return value;}function matches(source){return baseMatches(baseClone(source, true));}function matchesProperty(key, value){return baseMatchesProperty(key + "", baseClone(value, true));}function mixin(object, source, options){if(options == null){var isObj=isObject(source), props=isObj && keys(source), methodNames=props && props.length && baseFunctions(source, props);if(!(methodNames?methodNames.length:isObj)){methodNames = false;options = source;source = object;object = this;}}if(!methodNames){methodNames = baseFunctions(source, keys(source));}var chain=true, index=-1, isFunc=isFunction(object), length=methodNames.length;if(options === false){chain = false;}else if(isObject(options) && "chain" in options){chain = options.chain;}while(++index < length) {var methodName=methodNames[index], func=source[methodName];object[methodName] = func;if(isFunc){object.prototype[methodName] = (function(func){return function(){var chainAll=this.__chain__;if(chain || chainAll){var result=object(this.__wrapped__);(result.__actions__ = arrayCopy(this.__actions__)).push({func:func, args:arguments, thisArg:object});result.__chain__ = chainAll;return result;}var args=[this.value()];push.apply(args, arguments);return func.apply(object, args);};})(func);}}return object;}function noConflict(){context._ = oldDash;return this;}function noop(){}function property(key){return baseProperty(key + "");}function propertyOf(object){return function(key){return object == null?undefined:object[key];};}function range(start, end, step){if(step && isIterateeCall(start, end, step)){end = step = null;}start = +start || 0;step = step == null?1:+step || 0;if(end == null){end = start;start = 0;}else {end = +end || 0;}var index=-1, length=nativeMax(ceil((end - start) / (step || 1)), 0), result=Array(length);while(++index < length) {result[index] = start;start += step;}return result;}function times(n, iteratee, thisArg){n = +n;if(n < 1 || !nativeIsFinite(n)){return [];}var index=-1, result=Array(nativeMin(n, MAX_ARRAY_LENGTH));iteratee = bindCallback(iteratee, thisArg, 1);while(++index < n) {if(index < MAX_ARRAY_LENGTH){result[index] = iteratee(index);}else {iteratee(index);}}return result;}function uniqueId(prefix){var id=++idCounter;return baseToString(prefix) + id;}lodash.prototype = baseLodash.prototype;LodashWrapper.prototype = baseCreate(baseLodash.prototype);LodashWrapper.prototype.constructor = LodashWrapper;LazyWrapper.prototype = baseCreate(baseLodash.prototype);LazyWrapper.prototype.constructor = LazyWrapper;MapCache.prototype["delete"] = mapDelete;MapCache.prototype.get = mapGet;MapCache.prototype.has = mapHas;MapCache.prototype.set = mapSet;SetCache.prototype.push = cachePush;memoize.Cache = MapCache;lodash.after = after;lodash.ary = ary;lodash.assign = assign;lodash.at = at;lodash.before = before;lodash.bind = bind;lodash.bindAll = bindAll;lodash.bindKey = bindKey;lodash.callback = callback;lodash.chain = chain;lodash.chunk = chunk;lodash.compact = compact;lodash.constant = constant;lodash.countBy = countBy;lodash.create = create;lodash.curry = curry;lodash.curryRight = curryRight;lodash.debounce = debounce;lodash.defaults = defaults;lodash.defer = defer;lodash.delay = delay;lodash.difference = difference;lodash.drop = drop;lodash.dropRight = dropRight;lodash.dropRightWhile = dropRightWhile;lodash.dropWhile = dropWhile;lodash.fill = fill;lodash.filter = filter;lodash.flatten = flatten;lodash.flattenDeep = flattenDeep;lodash.flow = flow;lodash.flowRight = flowRight;lodash.forEach = forEach;lodash.forEachRight = forEachRight;lodash.forIn = forIn;lodash.forInRight = forInRight;lodash.forOwn = forOwn;lodash.forOwnRight = forOwnRight;lodash.functions = functions;lodash.groupBy = groupBy;lodash.indexBy = indexBy;lodash.initial = initial;lodash.intersection = intersection;lodash.invert = invert;lodash.invoke = invoke;lodash.keys = keys;lodash.keysIn = keysIn;lodash.map = map;lodash.mapValues = mapValues;lodash.matches = matches;lodash.matchesProperty = matchesProperty;lodash.memoize = memoize;lodash.merge = merge;lodash.mixin = mixin;lodash.negate = negate;lodash.omit = omit;lodash.once = once;lodash.pairs = pairs;lodash.partial = partial;lodash.partialRight = partialRight;lodash.partition = partition;lodash.pick = pick;lodash.pluck = pluck;lodash.property = property;lodash.propertyOf = propertyOf;lodash.pull = pull;lodash.pullAt = pullAt;lodash.range = range;lodash.rearg = rearg;lodash.reject = reject;lodash.remove = remove;lodash.rest = rest;lodash.shuffle = shuffle;lodash.slice = slice;lodash.sortBy = sortBy;lodash.sortByAll = sortByAll;lodash.spread = spread;lodash.take = take;lodash.takeRight = takeRight;lodash.takeRightWhile = takeRightWhile;lodash.takeWhile = takeWhile;lodash.tap = tap;lodash.throttle = throttle;lodash.thru = thru;lodash.times = times;lodash.toArray = toArray;lodash.toPlainObject = toPlainObject;lodash.transform = transform;lodash.union = union;lodash.uniq = uniq;lodash.unzip = unzip;lodash.values = values;lodash.valuesIn = valuesIn;lodash.where = where;lodash.without = without;lodash.wrap = wrap;lodash.xor = xor;lodash.zip = zip;lodash.zipObject = zipObject;lodash.backflow = flowRight;lodash.collect = map;lodash.compose = flowRight;lodash.each = forEach;lodash.eachRight = forEachRight;lodash.extend = assign;lodash.iteratee = callback;lodash.methods = functions;lodash.object = zipObject;lodash.select = filter;lodash.tail = rest;lodash.unique = uniq;mixin(lodash, lodash);lodash.attempt = attempt;lodash.camelCase = camelCase;lodash.capitalize = capitalize;lodash.clone = clone;lodash.cloneDeep = cloneDeep;lodash.deburr = deburr;lodash.endsWith = endsWith;lodash.escape = escape;lodash.escapeRegExp = escapeRegExp;lodash.every = every;lodash.find = find;lodash.findIndex = findIndex;lodash.findKey = findKey;lodash.findLast = findLast;lodash.findLastIndex = findLastIndex;lodash.findLastKey = findLastKey;lodash.findWhere = findWhere;lodash.first = first;lodash.has = has;lodash.identity = identity;lodash.includes = includes;lodash.indexOf = indexOf;lodash.inRange = inRange;lodash.isArguments = isArguments;lodash.isArray = isArray;lodash.isBoolean = isBoolean;lodash.isDate = isDate;lodash.isElement = isElement;lodash.isEmpty = isEmpty;lodash.isEqual = isEqual;lodash.isError = isError;lodash.isFinite = isFinite;lodash.isFunction = isFunction;lodash.isMatch = isMatch;lodash.isNaN = isNaN;lodash.isNative = isNative;lodash.isNull = isNull;lodash.isNumber = isNumber;lodash.isObject = isObject;lodash.isPlainObject = isPlainObject;lodash.isRegExp = isRegExp;lodash.isString = isString;lodash.isTypedArray = isTypedArray;lodash.isUndefined = isUndefined;lodash.kebabCase = kebabCase;lodash.last = last;lodash.lastIndexOf = lastIndexOf;lodash.max = max;lodash.min = min;lodash.noConflict = noConflict;lodash.noop = noop;lodash.now = now;lodash.pad = pad;lodash.padLeft = padLeft;lodash.padRight = padRight;lodash.parseInt = parseInt;lodash.random = random;lodash.reduce = reduce;lodash.reduceRight = reduceRight;lodash.repeat = repeat;lodash.result = result;lodash.runInContext = runInContext;lodash.size = size;lodash.snakeCase = snakeCase;lodash.some = some;lodash.sortedIndex = sortedIndex;lodash.sortedLastIndex = sortedLastIndex;lodash.startCase = startCase;lodash.startsWith = startsWith;lodash.template = template;lodash.trim = trim;lodash.trimLeft = trimLeft;lodash.trimRight = trimRight;lodash.trunc = trunc;lodash.unescape = unescape;lodash.uniqueId = uniqueId;lodash.words = words;lodash.all = every;lodash.any = some;lodash.contains = includes;lodash.detect = find;lodash.foldl = reduce;lodash.foldr = reduceRight;lodash.head = first;lodash.include = includes;lodash.inject = reduce;mixin(lodash, (function(){var source={};baseForOwn(lodash, function(func, methodName){if(!lodash.prototype[methodName]){source[methodName] = func;}});return source;})(), false);lodash.sample = sample;lodash.prototype.sample = function(n){if(!this.__chain__ && n == null){return sample(this.value());}return this.thru(function(value){return sample(value, n);});};lodash.VERSION = VERSION;arrayEach(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(methodName){lodash[methodName].placeholder = lodash;});arrayEach(["filter", "map", "takeWhile"], function(methodName, index){var isFilter=index == LAZY_FILTER_FLAG || index == LAZY_WHILE_FLAG;LazyWrapper.prototype[methodName] = function(iteratee, thisArg){var result=this.clone(), iteratees=result.__iteratees__ || (result.__iteratees__ = []);result.__filtered__ = result.__filtered__ || isFilter;iteratees.push({iteratee:getCallback(iteratee, thisArg, 3), type:index});return result;};});arrayEach(["drop", "take"], function(methodName, index){var countName="__" + methodName + "Count__", whileName=methodName + "While";LazyWrapper.prototype[methodName] = function(n){n = n == null?1:nativeMax(floor(n) || 0, 0);var result=this.clone();if(result.__filtered__){var value=result[countName];result[countName] = index?nativeMin(value, n):value + n;}else {var views=result.__views__ || (result.__views__ = []);views.push({size:n, type:methodName + (result.__dir__ < 0?"Right":"")});}return result;};LazyWrapper.prototype[methodName + "Right"] = function(n){return this.reverse()[methodName](n).reverse();};LazyWrapper.prototype[methodName + "RightWhile"] = function(predicate, thisArg){return this.reverse()[whileName](predicate, thisArg).reverse();};});arrayEach(["first", "last"], function(methodName, index){var takeName="take" + (index?"Right":"");LazyWrapper.prototype[methodName] = function(){return this[takeName](1).value()[0];};});arrayEach(["initial", "rest"], function(methodName, index){var dropName="drop" + (index?"":"Right");LazyWrapper.prototype[methodName] = function(){return this[dropName](1);};});arrayEach(["pluck", "where"], function(methodName, index){var operationName=index?"filter":"map", createCallback=index?baseMatches:baseProperty;LazyWrapper.prototype[methodName] = function(value){return this[operationName](createCallback(value));};});LazyWrapper.prototype.compact = function(){return this.filter(identity);};LazyWrapper.prototype.dropWhile = function(predicate, thisArg){var done, lastIndex, isRight=this.__dir__ < 0;predicate = getCallback(predicate, thisArg, 3);return this.filter(function(value, index, array){done = done && (isRight?index < lastIndex:index > lastIndex);lastIndex = index;return done || (done = !predicate(value, index, array));});};LazyWrapper.prototype.reject = function(predicate, thisArg){predicate = getCallback(predicate, thisArg, 3);return this.filter(function(value, index, array){return !predicate(value, index, array);});};LazyWrapper.prototype.slice = function(start, end){start = start == null?0:+start || 0;var result=start < 0?this.takeRight(-start):this.drop(start);if(typeof end != "undefined"){end = +end || 0;result = end < 0?result.dropRight(-end):result.take(end - start);}return result;};LazyWrapper.prototype.toArray = function(){return this.drop(0);};baseForOwn(LazyWrapper.prototype, function(func, methodName){var lodashFunc=lodash[methodName], retUnwrapped=/^(?:first|last)$/.test(methodName);lodash.prototype[methodName] = function(){var value=this.__wrapped__, args=arguments, chainAll=this.__chain__, isHybrid=!!this.__actions__.length, isLazy=value instanceof LazyWrapper, onlyLazy=isLazy && !isHybrid;if(retUnwrapped && !chainAll){return onlyLazy?func.call(value):lodashFunc.call(lodash, this.value());}var interceptor=function interceptor(value){var otherArgs=[value];push.apply(otherArgs, args);return lodashFunc.apply(lodash, otherArgs);};if(isLazy || isArray(value)){var wrapper=onlyLazy?value:new LazyWrapper(this), result=func.apply(wrapper, args);if(!retUnwrapped && (isHybrid || result.__actions__)){var actions=result.__actions__ || (result.__actions__ = []);actions.push({func:thru, args:[interceptor], thisArg:lodash});}return new LodashWrapper(result, chainAll);}return this.thru(interceptor);};});arrayEach(["concat", "join", "pop", "push", "shift", "sort", "splice", "unshift"], function(methodName){var func=arrayProto[methodName], chainName=/^(?:push|sort|unshift)$/.test(methodName)?"tap":"thru", retUnwrapped=/^(?:join|pop|shift)$/.test(methodName);lodash.prototype[methodName] = function(){var args=arguments;if(retUnwrapped && !this.__chain__){return func.apply(this.value(), args);}return this[chainName](function(value){return func.apply(value, args);});};});LazyWrapper.prototype.clone = lazyClone;LazyWrapper.prototype.reverse = lazyReverse;LazyWrapper.prototype.value = lazyValue;lodash.prototype.chain = wrapperChain;lodash.prototype.commit = wrapperCommit;lodash.prototype.plant = wrapperPlant;lodash.prototype.reverse = wrapperReverse;lodash.prototype.toString = wrapperToString;lodash.prototype.run = lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;lodash.prototype.collect = lodash.prototype.map;lodash.prototype.head = lodash.prototype.first;lodash.prototype.select = lodash.prototype.filter;lodash.prototype.tail = lodash.prototype.rest;return lodash;}var _=runInContext();if(true){root._ = _;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function(){return _;}).call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));}else if(freeExports && freeModule){if(moduleExports){(freeModule.exports = _)._ = _;}else {freeExports._ = _;}}else {root._ = _;}}).call(this);}).call(exports, __webpack_require__(29)(module), (function(){return this;})());},,,, function(module, exports, __webpack_require__){module.exports = function(module){if(!module.webpackPolyfill){module.deprecate = function(){};module.paths = [];module.children = [];module.webpackPolyfill = 1;}return module;};}]);

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _babelHelpers = __webpack_require__(14)["default"];
	
	var aDataTypeWithSpec = _babelHelpers.interopRequire(__webpack_require__(29));
	
	exports.aDataTypeWithSpec = aDataTypeWithSpec;
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isIE9 = memoize(function() {
			return /msie 9\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;
	
	module.exports = function(list, options) {
		if(true) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isIE9();
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function () {
				styleElement.parentNode.removeChild(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	function replaceText(source, id, replacement) {
		var boundaries = ["/** >>" + id + " **/", "/** " + id + "<< **/"];
		var start = source.lastIndexOf(boundaries[0]);
		var wrappedReplacement = replacement
			? (boundaries[0] + replacement + boundaries[1])
			: "";
		if (source.lastIndexOf(boundaries[0]) >= 0) {
			var end = source.lastIndexOf(boundaries[1]) + boundaries[1].length;
			return source.slice(0, start) + wrappedReplacement + source.slice(end);
		} else {
			return source + wrappedReplacement;
		}
	}
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(styleElement.styleSheet.cssText, index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap && typeof btoa === "function") {
			try {
				css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(JSON.stringify(sourceMap)) + " */";
				css = "@import url(\"data:text/css;base64," + btoa(css) + "\")";
			} catch(e) {}
		}
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	module.exports = function(src) {
		if (typeof execScript === "function")
			execScript(src);
		else
			eval.call(null, src);
	}

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = ";(function(){\n\n// CommonJS require()\n\nfunction require(p){\n    var path = require.resolve(p)\n      , mod = require.modules[path];\n    if (!mod) throw new Error('failed to require \"' + p + '\"');\n    if (!mod.exports) {\n      mod.exports = {};\n      mod.call(mod.exports, mod, mod.exports, require.relative(path));\n    }\n    return mod.exports;\n  }\n\nrequire.modules = {};\n\nrequire.resolve = function (path){\n    var orig = path\n      , reg = path + '.js'\n      , index = path + '/index.js';\n    return require.modules[reg] && reg\n      || require.modules[index] && index\n      || orig;\n  };\n\nrequire.register = function (path, fn){\n    require.modules[path] = fn;\n  };\n\nrequire.relative = function (parent) {\n    return function(p){\n      if ('.' != p.charAt(0)) return require(p);\n\n      var path = parent.split('/')\n        , segs = p.split('/');\n      path.pop();\n\n      for (var i = 0; i < segs.length; i++) {\n        var seg = segs[i];\n        if ('..' == seg) path.pop();\n        else if ('.' != seg) path.push(seg);\n      }\n\n      return require(path.join('/'));\n    };\n  };\n\n\nrequire.register(\"browser/debug.js\", function(module, exports, require){\nmodule.exports = function(type){\n  return function(){\n  }\n};\n\n}); // module: browser/debug.js\n\nrequire.register(\"browser/diff.js\", function(module, exports, require){\n/* See LICENSE file for terms of use */\n\n/*\n * Text diff implementation.\n *\n * This library supports the following APIS:\n * JsDiff.diffChars: Character by character diff\n * JsDiff.diffWords: Word (as defined by \\b regex) diff which ignores whitespace\n * JsDiff.diffLines: Line based diff\n *\n * JsDiff.diffCss: Diff targeted at CSS content\n *\n * These methods are based on the implementation proposed in\n * \"An O(ND) Difference Algorithm and its Variations\" (Myers, 1986).\n * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927\n */\nvar JsDiff = (function() {\n  /*jshint maxparams: 5*/\n  function clonePath(path) {\n    return { newPos: path.newPos, components: path.components.slice(0) };\n  }\n  function removeEmpty(array) {\n    var ret = [];\n    for (var i = 0; i < array.length; i++) {\n      if (array[i]) {\n        ret.push(array[i]);\n      }\n    }\n    return ret;\n  }\n  function escapeHTML(s) {\n    var n = s;\n    n = n.replace(/&/g, '&amp;');\n    n = n.replace(/</g, '&lt;');\n    n = n.replace(/>/g, '&gt;');\n    n = n.replace(/\"/g, '&quot;');\n\n    return n;\n  }\n\n  var Diff = function(ignoreWhitespace) {\n    this.ignoreWhitespace = ignoreWhitespace;\n  };\n  Diff.prototype = {\n      diff: function(oldString, newString) {\n        // Handle the identity case (this is due to unrolling editLength == 0\n        if (newString === oldString) {\n          return [{ value: newString }];\n        }\n        if (!newString) {\n          return [{ value: oldString, removed: true }];\n        }\n        if (!oldString) {\n          return [{ value: newString, added: true }];\n        }\n\n        newString = this.tokenize(newString);\n        oldString = this.tokenize(oldString);\n\n        var newLen = newString.length, oldLen = oldString.length;\n        var maxEditLength = newLen + oldLen;\n        var bestPath = [{ newPos: -1, components: [] }];\n\n        // Seed editLength = 0\n        var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);\n        if (bestPath[0].newPos+1 >= newLen && oldPos+1 >= oldLen) {\n          return bestPath[0].components;\n        }\n\n        for (var editLength = 1; editLength <= maxEditLength; editLength++) {\n          for (var diagonalPath = -1*editLength; diagonalPath <= editLength; diagonalPath+=2) {\n            var basePath;\n            var addPath = bestPath[diagonalPath-1],\n                removePath = bestPath[diagonalPath+1];\n            oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;\n            if (addPath) {\n              // No one else is going to attempt to use this value, clear it\n              bestPath[diagonalPath-1] = undefined;\n            }\n\n            var canAdd = addPath && addPath.newPos+1 < newLen;\n            var canRemove = removePath && 0 <= oldPos && oldPos < oldLen;\n            if (!canAdd && !canRemove) {\n              bestPath[diagonalPath] = undefined;\n              continue;\n            }\n\n            // Select the diagonal that we want to branch from. We select the prior\n            // path whose position in the new string is the farthest from the origin\n            // and does not pass the bounds of the diff graph\n            if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {\n              basePath = clonePath(removePath);\n              this.pushComponent(basePath.components, oldString[oldPos], undefined, true);\n            } else {\n              basePath = clonePath(addPath);\n              basePath.newPos++;\n              this.pushComponent(basePath.components, newString[basePath.newPos], true, undefined);\n            }\n\n            var oldPos = this.extractCommon(basePath, newString, oldString, diagonalPath);\n\n            if (basePath.newPos+1 >= newLen && oldPos+1 >= oldLen) {\n              return basePath.components;\n            } else {\n              bestPath[diagonalPath] = basePath;\n            }\n          }\n        }\n      },\n\n      pushComponent: function(components, value, added, removed) {\n        var last = components[components.length-1];\n        if (last && last.added === added && last.removed === removed) {\n          // We need to clone here as the component clone operation is just\n          // as shallow array clone\n          components[components.length-1] =\n            {value: this.join(last.value, value), added: added, removed: removed };\n        } else {\n          components.push({value: value, added: added, removed: removed });\n        }\n      },\n      extractCommon: function(basePath, newString, oldString, diagonalPath) {\n        var newLen = newString.length,\n            oldLen = oldString.length,\n            newPos = basePath.newPos,\n            oldPos = newPos - diagonalPath;\n        while (newPos+1 < newLen && oldPos+1 < oldLen && this.equals(newString[newPos+1], oldString[oldPos+1])) {\n          newPos++;\n          oldPos++;\n\n          this.pushComponent(basePath.components, newString[newPos], undefined, undefined);\n        }\n        basePath.newPos = newPos;\n        return oldPos;\n      },\n\n      equals: function(left, right) {\n        var reWhitespace = /\\S/;\n        if (this.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right)) {\n          return true;\n        } else {\n          return left === right;\n        }\n      },\n      join: function(left, right) {\n        return left + right;\n      },\n      tokenize: function(value) {\n        return value;\n      }\n  };\n\n  var CharDiff = new Diff();\n\n  var WordDiff = new Diff(true);\n  var WordWithSpaceDiff = new Diff();\n  WordDiff.tokenize = WordWithSpaceDiff.tokenize = function(value) {\n    return removeEmpty(value.split(/(\\s+|\\b)/));\n  };\n\n  var CssDiff = new Diff(true);\n  CssDiff.tokenize = function(value) {\n    return removeEmpty(value.split(/([{}:;,]|\\s+)/));\n  };\n\n  var LineDiff = new Diff();\n  LineDiff.tokenize = function(value) {\n    var retLines = [],\n        lines = value.split(/^/m);\n\n    for(var i = 0; i < lines.length; i++) {\n      var line = lines[i],\n          lastLine = lines[i - 1];\n\n      // Merge lines that may contain windows new lines\n      if (line == '\\n' && lastLine && lastLine[lastLine.length - 1] === '\\r') {\n        retLines[retLines.length - 1] += '\\n';\n      } else if (line) {\n        retLines.push(line);\n      }\n    }\n\n    return retLines;\n  };\n\n  return {\n    Diff: Diff,\n\n    diffChars: function(oldStr, newStr) { return CharDiff.diff(oldStr, newStr); },\n    diffWords: function(oldStr, newStr) { return WordDiff.diff(oldStr, newStr); },\n    diffWordsWithSpace: function(oldStr, newStr) { return WordWithSpaceDiff.diff(oldStr, newStr); },\n    diffLines: function(oldStr, newStr) { return LineDiff.diff(oldStr, newStr); },\n\n    diffCss: function(oldStr, newStr) { return CssDiff.diff(oldStr, newStr); },\n\n    createPatch: function(fileName, oldStr, newStr, oldHeader, newHeader) {\n      var ret = [];\n\n      ret.push('Index: ' + fileName);\n      ret.push('===================================================================');\n      ret.push('--- ' + fileName + (typeof oldHeader === 'undefined' ? '' : '\\t' + oldHeader));\n      ret.push('+++ ' + fileName + (typeof newHeader === 'undefined' ? '' : '\\t' + newHeader));\n\n      var diff = LineDiff.diff(oldStr, newStr);\n      if (!diff[diff.length-1].value) {\n        diff.pop();   // Remove trailing newline add\n      }\n      diff.push({value: '', lines: []});   // Append an empty value to make cleanup easier\n\n      function contextLines(lines) {\n        return lines.map(function(entry) { return ' ' + entry; });\n      }\n      function eofNL(curRange, i, current) {\n        var last = diff[diff.length-2],\n            isLast = i === diff.length-2,\n            isLastOfType = i === diff.length-3 && (current.added !== last.added || current.removed !== last.removed);\n\n        // Figure out if this is the last line for the given file and missing NL\n        if (!/\\n$/.test(current.value) && (isLast || isLastOfType)) {\n          curRange.push('\\\\ No newline at end of file');\n        }\n      }\n\n      var oldRangeStart = 0, newRangeStart = 0, curRange = [],\n          oldLine = 1, newLine = 1;\n      for (var i = 0; i < diff.length; i++) {\n        var current = diff[i],\n            lines = current.lines || current.value.replace(/\\n$/, '').split('\\n');\n        current.lines = lines;\n\n        if (current.added || current.removed) {\n          if (!oldRangeStart) {\n            var prev = diff[i-1];\n            oldRangeStart = oldLine;\n            newRangeStart = newLine;\n\n            if (prev) {\n              curRange = contextLines(prev.lines.slice(-4));\n              oldRangeStart -= curRange.length;\n              newRangeStart -= curRange.length;\n            }\n          }\n          curRange.push.apply(curRange, lines.map(function(entry) { return (current.added?'+':'-') + entry; }));\n          eofNL(curRange, i, current);\n\n          if (current.added) {\n            newLine += lines.length;\n          } else {\n            oldLine += lines.length;\n          }\n        } else {\n          if (oldRangeStart) {\n            // Close out any changes that have been output (or join overlapping)\n            if (lines.length <= 8 && i < diff.length-2) {\n              // Overlapping\n              curRange.push.apply(curRange, contextLines(lines));\n            } else {\n              // end the range and output\n              var contextSize = Math.min(lines.length, 4);\n              ret.push(\n                  '@@ -' + oldRangeStart + ',' + (oldLine-oldRangeStart+contextSize)\n                  + ' +' + newRangeStart + ',' + (newLine-newRangeStart+contextSize)\n                  + ' @@');\n              ret.push.apply(ret, curRange);\n              ret.push.apply(ret, contextLines(lines.slice(0, contextSize)));\n              if (lines.length <= 4) {\n                eofNL(ret, i, current);\n              }\n\n              oldRangeStart = 0;  newRangeStart = 0; curRange = [];\n            }\n          }\n          oldLine += lines.length;\n          newLine += lines.length;\n        }\n      }\n\n      return ret.join('\\n') + '\\n';\n    },\n\n    applyPatch: function(oldStr, uniDiff) {\n      var diffstr = uniDiff.split('\\n');\n      var diff = [];\n      var remEOFNL = false,\n          addEOFNL = false;\n\n      for (var i = (diffstr[0][0]==='I'?4:0); i < diffstr.length; i++) {\n        if(diffstr[i][0] === '@') {\n          var meh = diffstr[i].split(/@@ -(\\d+),(\\d+) \\+(\\d+),(\\d+) @@/);\n          diff.unshift({\n            start:meh[3],\n            oldlength:meh[2],\n            oldlines:[],\n            newlength:meh[4],\n            newlines:[]\n          });\n        } else if(diffstr[i][0] === '+') {\n          diff[0].newlines.push(diffstr[i].substr(1));\n        } else if(diffstr[i][0] === '-') {\n          diff[0].oldlines.push(diffstr[i].substr(1));\n        } else if(diffstr[i][0] === ' ') {\n          diff[0].newlines.push(diffstr[i].substr(1));\n          diff[0].oldlines.push(diffstr[i].substr(1));\n        } else if(diffstr[i][0] === '\\\\') {\n          if (diffstr[i-1][0] === '+') {\n            remEOFNL = true;\n          } else if(diffstr[i-1][0] === '-') {\n            addEOFNL = true;\n          }\n        }\n      }\n\n      var str = oldStr.split('\\n');\n      for (var i = diff.length - 1; i >= 0; i--) {\n        var d = diff[i];\n        for (var j = 0; j < d.oldlength; j++) {\n          if(str[d.start-1+j] !== d.oldlines[j]) {\n            return false;\n          }\n        }\n        Array.prototype.splice.apply(str,[d.start-1,+d.oldlength].concat(d.newlines));\n      }\n\n      if (remEOFNL) {\n        while (!str[str.length-1]) {\n          str.pop();\n        }\n      } else if (addEOFNL) {\n        str.push('');\n      }\n      return str.join('\\n');\n    },\n\n    convertChangesToXML: function(changes){\n      var ret = [];\n      for ( var i = 0; i < changes.length; i++) {\n        var change = changes[i];\n        if (change.added) {\n          ret.push('<ins>');\n        } else if (change.removed) {\n          ret.push('<del>');\n        }\n\n        ret.push(escapeHTML(change.value));\n\n        if (change.added) {\n          ret.push('</ins>');\n        } else if (change.removed) {\n          ret.push('</del>');\n        }\n      }\n      return ret.join('');\n    },\n\n    // See: http://code.google.com/p/google-diff-match-patch/wiki/API\n    convertChangesToDMP: function(changes){\n      var ret = [], change;\n      for ( var i = 0; i < changes.length; i++) {\n        change = changes[i];\n        ret.push([(change.added ? 1 : change.removed ? -1 : 0), change.value]);\n      }\n      return ret;\n    }\n  };\n})();\n\nif (typeof module !== 'undefined') {\n    module.exports = JsDiff;\n}\n\n}); // module: browser/diff.js\n\nrequire.register(\"browser/escape-string-regexp.js\", function(module, exports, require){\n'use strict';\n\nvar matchOperatorsRe = /[|\\\\{}()[\\]^$+*?.]/g;\n\nmodule.exports = function (str) {\n  if (typeof str !== 'string') {\n    throw new TypeError('Expected a string');\n  }\n\n  return str.replace(matchOperatorsRe,  '\\\\$&');\n};\n\n}); // module: browser/escape-string-regexp.js\n\nrequire.register(\"browser/events.js\", function(module, exports, require){\n/**\n * Module exports.\n */\n\nexports.EventEmitter = EventEmitter;\n\n/**\n * Check if `obj` is an array.\n */\n\nfunction isArray(obj) {\n  return '[object Array]' == {}.toString.call(obj);\n}\n\n/**\n * Event emitter constructor.\n *\n * @api public\n */\n\nfunction EventEmitter(){};\n\n/**\n * Adds a listener.\n *\n * @api public\n */\n\nEventEmitter.prototype.on = function (name, fn) {\n  if (!this.$events) {\n    this.$events = {};\n  }\n\n  if (!this.$events[name]) {\n    this.$events[name] = fn;\n  } else if (isArray(this.$events[name])) {\n    this.$events[name].push(fn);\n  } else {\n    this.$events[name] = [this.$events[name], fn];\n  }\n\n  return this;\n};\n\nEventEmitter.prototype.addListener = EventEmitter.prototype.on;\n\n/**\n * Adds a volatile listener.\n *\n * @api public\n */\n\nEventEmitter.prototype.once = function (name, fn) {\n  var self = this;\n\n  function on () {\n    self.removeListener(name, on);\n    fn.apply(this, arguments);\n  };\n\n  on.listener = fn;\n  this.on(name, on);\n\n  return this;\n};\n\n/**\n * Removes a listener.\n *\n * @api public\n */\n\nEventEmitter.prototype.removeListener = function (name, fn) {\n  if (this.$events && this.$events[name]) {\n    var list = this.$events[name];\n\n    if (isArray(list)) {\n      var pos = -1;\n\n      for (var i = 0, l = list.length; i < l; i++) {\n        if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {\n          pos = i;\n          break;\n        }\n      }\n\n      if (pos < 0) {\n        return this;\n      }\n\n      list.splice(pos, 1);\n\n      if (!list.length) {\n        delete this.$events[name];\n      }\n    } else if (list === fn || (list.listener && list.listener === fn)) {\n      delete this.$events[name];\n    }\n  }\n\n  return this;\n};\n\n/**\n * Removes all listeners for an event.\n *\n * @api public\n */\n\nEventEmitter.prototype.removeAllListeners = function (name) {\n  if (name === undefined) {\n    this.$events = {};\n    return this;\n  }\n\n  if (this.$events && this.$events[name]) {\n    this.$events[name] = null;\n  }\n\n  return this;\n};\n\n/**\n * Gets all listeners for a certain event.\n *\n * @api public\n */\n\nEventEmitter.prototype.listeners = function (name) {\n  if (!this.$events) {\n    this.$events = {};\n  }\n\n  if (!this.$events[name]) {\n    this.$events[name] = [];\n  }\n\n  if (!isArray(this.$events[name])) {\n    this.$events[name] = [this.$events[name]];\n  }\n\n  return this.$events[name];\n};\n\n/**\n * Emits an event.\n *\n * @api public\n */\n\nEventEmitter.prototype.emit = function (name) {\n  if (!this.$events) {\n    return false;\n  }\n\n  var handler = this.$events[name];\n\n  if (!handler) {\n    return false;\n  }\n\n  var args = [].slice.call(arguments, 1);\n\n  if ('function' == typeof handler) {\n    handler.apply(this, args);\n  } else if (isArray(handler)) {\n    var listeners = handler.slice();\n\n    for (var i = 0, l = listeners.length; i < l; i++) {\n      listeners[i].apply(this, args);\n    }\n  } else {\n    return false;\n  }\n\n  return true;\n};\n\n}); // module: browser/events.js\n\nrequire.register(\"browser/fs.js\", function(module, exports, require){\n\n}); // module: browser/fs.js\n\nrequire.register(\"browser/glob.js\", function(module, exports, require){\n\n}); // module: browser/glob.js\n\nrequire.register(\"browser/path.js\", function(module, exports, require){\n\n}); // module: browser/path.js\n\nrequire.register(\"browser/progress.js\", function(module, exports, require){\n/**\n * Expose `Progress`.\n */\n\nmodule.exports = Progress;\n\n/**\n * Initialize a new `Progress` indicator.\n */\n\nfunction Progress() {\n  this.percent = 0;\n  this.size(0);\n  this.fontSize(11);\n  this.font('helvetica, arial, sans-serif');\n}\n\n/**\n * Set progress size to `n`.\n *\n * @param {Number} n\n * @return {Progress} for chaining\n * @api public\n */\n\nProgress.prototype.size = function(n){\n  this._size = n;\n  return this;\n};\n\n/**\n * Set text to `str`.\n *\n * @param {String} str\n * @return {Progress} for chaining\n * @api public\n */\n\nProgress.prototype.text = function(str){\n  this._text = str;\n  return this;\n};\n\n/**\n * Set font size to `n`.\n *\n * @param {Number} n\n * @return {Progress} for chaining\n * @api public\n */\n\nProgress.prototype.fontSize = function(n){\n  this._fontSize = n;\n  return this;\n};\n\n/**\n * Set font `family`.\n *\n * @param {String} family\n * @return {Progress} for chaining\n */\n\nProgress.prototype.font = function(family){\n  this._font = family;\n  return this;\n};\n\n/**\n * Update percentage to `n`.\n *\n * @param {Number} n\n * @return {Progress} for chaining\n */\n\nProgress.prototype.update = function(n){\n  this.percent = n;\n  return this;\n};\n\n/**\n * Draw on `ctx`.\n *\n * @param {CanvasRenderingContext2d} ctx\n * @return {Progress} for chaining\n */\n\nProgress.prototype.draw = function(ctx){\n  try {\n    var percent = Math.min(this.percent, 100)\n      , size = this._size\n      , half = size / 2\n      , x = half\n      , y = half\n      , rad = half - 1\n      , fontSize = this._fontSize;\n\n    ctx.font = fontSize + 'px ' + this._font;\n\n    var angle = Math.PI * 2 * (percent / 100);\n    ctx.clearRect(0, 0, size, size);\n\n    // outer circle\n    ctx.strokeStyle = '#9f9f9f';\n    ctx.beginPath();\n    ctx.arc(x, y, rad, 0, angle, false);\n    ctx.stroke();\n\n    // inner circle\n    ctx.strokeStyle = '#eee';\n    ctx.beginPath();\n    ctx.arc(x, y, rad - 1, 0, angle, true);\n    ctx.stroke();\n\n    // text\n    var text = this._text || (percent | 0) + '%'\n      , w = ctx.measureText(text).width;\n\n    ctx.fillText(\n        text\n      , x - w / 2 + 1\n      , y + fontSize / 2 - 1);\n  } catch (ex) {} //don't fail if we can't render progress\n  return this;\n};\n\n}); // module: browser/progress.js\n\nrequire.register(\"browser/tty.js\", function(module, exports, require){\nexports.isatty = function(){\n  return true;\n};\n\nexports.getWindowSize = function(){\n  if ('innerHeight' in global) {\n    return [global.innerHeight, global.innerWidth];\n  } else {\n    // In a Web Worker, the DOM Window is not available.\n    return [640, 480];\n  }\n};\n\n}); // module: browser/tty.js\n\nrequire.register(\"context.js\", function(module, exports, require){\n/**\n * Expose `Context`.\n */\n\nmodule.exports = Context;\n\n/**\n * Initialize a new `Context`.\n *\n * @api private\n */\n\nfunction Context(){}\n\n/**\n * Set or get the context `Runnable` to `runnable`.\n *\n * @param {Runnable} runnable\n * @return {Context}\n * @api private\n */\n\nContext.prototype.runnable = function(runnable){\n  if (0 == arguments.length) return this._runnable;\n  this.test = this._runnable = runnable;\n  return this;\n};\n\n/**\n * Set test timeout `ms`.\n *\n * @param {Number} ms\n * @return {Context} self\n * @api private\n */\n\nContext.prototype.timeout = function(ms){\n  if (arguments.length === 0) return this.runnable().timeout();\n  this.runnable().timeout(ms);\n  return this;\n};\n\n/**\n * Set test timeout `enabled`.\n *\n * @param {Boolean} enabled\n * @return {Context} self\n * @api private\n */\n\nContext.prototype.enableTimeouts = function (enabled) {\n  this.runnable().enableTimeouts(enabled);\n  return this;\n};\n\n\n/**\n * Set test slowness threshold `ms`.\n *\n * @param {Number} ms\n * @return {Context} self\n * @api private\n */\n\nContext.prototype.slow = function(ms){\n  this.runnable().slow(ms);\n  return this;\n};\n\n/**\n * Inspect the context void of `._runnable`.\n *\n * @return {String}\n * @api private\n */\n\nContext.prototype.inspect = function(){\n  return JSON.stringify(this, function(key, val){\n    if ('_runnable' == key) return;\n    if ('test' == key) return;\n    return val;\n  }, 2);\n};\n\n}); // module: context.js\n\nrequire.register(\"hook.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Runnable = require('./runnable');\n\n/**\n * Expose `Hook`.\n */\n\nmodule.exports = Hook;\n\n/**\n * Initialize a new `Hook` with the given `title` and callback `fn`.\n *\n * @param {String} title\n * @param {Function} fn\n * @api private\n */\n\nfunction Hook(title, fn) {\n  Runnable.call(this, title, fn);\n  this.type = 'hook';\n}\n\n/**\n * Inherit from `Runnable.prototype`.\n */\n\nfunction F(){};\nF.prototype = Runnable.prototype;\nHook.prototype = new F;\nHook.prototype.constructor = Hook;\n\n\n/**\n * Get or set the test `err`.\n *\n * @param {Error} err\n * @return {Error}\n * @api public\n */\n\nHook.prototype.error = function(err){\n  if (0 == arguments.length) {\n    var err = this._error;\n    this._error = null;\n    return err;\n  }\n\n  this._error = err;\n};\n\n}); // module: hook.js\n\nrequire.register(\"interfaces/bdd.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Suite = require('../suite')\n  , Test = require('../test')\n  , utils = require('../utils')\n  , escapeRe = require('browser/escape-string-regexp');\n\n/**\n * BDD-style interface:\n *\n *      describe('Array', function(){\n *        describe('#indexOf()', function(){\n *          it('should return -1 when not present', function(){\n *\n *          });\n *\n *          it('should return the index when present', function(){\n *\n *          });\n *        });\n *      });\n *\n */\n\nmodule.exports = function(suite){\n  var suites = [suite];\n\n  suite.on('pre-require', function(context, file, mocha){\n\n    /**\n     * Execute before running tests.\n     */\n\n    context.before = function(name, fn){\n      suites[0].beforeAll(name, fn);\n    };\n\n    /**\n     * Execute after running tests.\n     */\n\n    context.after = function(name, fn){\n      suites[0].afterAll(name, fn);\n    };\n\n    /**\n     * Execute before each test case.\n     */\n\n    context.beforeEach = function(name, fn){\n      suites[0].beforeEach(name, fn);\n    };\n\n    /**\n     * Execute after each test case.\n     */\n\n    context.afterEach = function(name, fn){\n      suites[0].afterEach(name, fn);\n    };\n\n    /**\n     * Describe a \"suite\" with the given `title`\n     * and callback `fn` containing nested suites\n     * and/or tests.\n     */\n\n    context.describe = context.context = function(title, fn){\n      var suite = Suite.create(suites[0], title);\n      suite.file = file;\n      suites.unshift(suite);\n      fn.call(suite);\n      suites.shift();\n      return suite;\n    };\n\n    /**\n     * Pending describe.\n     */\n\n    context.xdescribe =\n    context.xcontext =\n    context.describe.skip = function(title, fn){\n      var suite = Suite.create(suites[0], title);\n      suite.pending = true;\n      suites.unshift(suite);\n      fn.call(suite);\n      suites.shift();\n    };\n\n    /**\n     * Exclusive suite.\n     */\n\n    context.describe.only = function(title, fn){\n      var suite = context.describe(title, fn);\n      mocha.grep(suite.fullTitle());\n      return suite;\n    };\n\n    /**\n     * Describe a specification or test-case\n     * with the given `title` and callback `fn`\n     * acting as a thunk.\n     */\n\n    context.it = context.specify = function(title, fn){\n      var suite = suites[0];\n      if (suite.pending) fn = null;\n      var test = new Test(title, fn);\n      test.file = file;\n      suite.addTest(test);\n      return test;\n    };\n\n    /**\n     * Exclusive test-case.\n     */\n\n    context.it.only = function(title, fn){\n      var test = context.it(title, fn);\n      var reString = '^' + escapeRe(test.fullTitle()) + '$';\n      mocha.grep(new RegExp(reString));\n      return test;\n    };\n\n    /**\n     * Pending test case.\n     */\n\n    context.xit =\n    context.xspecify =\n    context.it.skip = function(title){\n      context.it(title);\n    };\n  });\n};\n\n}); // module: interfaces/bdd.js\n\nrequire.register(\"interfaces/exports.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Suite = require('../suite')\n  , Test = require('../test');\n\n/**\n * TDD-style interface:\n *\n *     exports.Array = {\n *       '#indexOf()': {\n *         'should return -1 when the value is not present': function(){\n *\n *         },\n *\n *         'should return the correct index when the value is present': function(){\n *\n *         }\n *       }\n *     };\n *\n */\n\nmodule.exports = function(suite){\n  var suites = [suite];\n\n  suite.on('require', visit);\n\n  function visit(obj, file) {\n    var suite;\n    for (var key in obj) {\n      if ('function' == typeof obj[key]) {\n        var fn = obj[key];\n        switch (key) {\n          case 'before':\n            suites[0].beforeAll(fn);\n            break;\n          case 'after':\n            suites[0].afterAll(fn);\n            break;\n          case 'beforeEach':\n            suites[0].beforeEach(fn);\n            break;\n          case 'afterEach':\n            suites[0].afterEach(fn);\n            break;\n          default:\n            var test = new Test(key, fn);\n            test.file = file;\n            suites[0].addTest(test);\n        }\n      } else {\n        suite = Suite.create(suites[0], key);\n        suites.unshift(suite);\n        visit(obj[key]);\n        suites.shift();\n      }\n    }\n  }\n};\n\n}); // module: interfaces/exports.js\n\nrequire.register(\"interfaces/index.js\", function(module, exports, require){\nexports.bdd = require('./bdd');\nexports.tdd = require('./tdd');\nexports.qunit = require('./qunit');\nexports.exports = require('./exports');\n\n}); // module: interfaces/index.js\n\nrequire.register(\"interfaces/qunit.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Suite = require('../suite')\n  , Test = require('../test')\n  , escapeRe = require('browser/escape-string-regexp')\n  , utils = require('../utils');\n\n/**\n * QUnit-style interface:\n *\n *     suite('Array');\n *\n *     test('#length', function(){\n *       var arr = [1,2,3];\n *       ok(arr.length == 3);\n *     });\n *\n *     test('#indexOf()', function(){\n *       var arr = [1,2,3];\n *       ok(arr.indexOf(1) == 0);\n *       ok(arr.indexOf(2) == 1);\n *       ok(arr.indexOf(3) == 2);\n *     });\n *\n *     suite('String');\n *\n *     test('#length', function(){\n *       ok('foo'.length == 3);\n *     });\n *\n */\n\nmodule.exports = function(suite){\n  var suites = [suite];\n\n  suite.on('pre-require', function(context, file, mocha){\n\n    /**\n     * Execute before running tests.\n     */\n\n    context.before = function(name, fn){\n      suites[0].beforeAll(name, fn);\n    };\n\n    /**\n     * Execute after running tests.\n     */\n\n    context.after = function(name, fn){\n      suites[0].afterAll(name, fn);\n    };\n\n    /**\n     * Execute before each test case.\n     */\n\n    context.beforeEach = function(name, fn){\n      suites[0].beforeEach(name, fn);\n    };\n\n    /**\n     * Execute after each test case.\n     */\n\n    context.afterEach = function(name, fn){\n      suites[0].afterEach(name, fn);\n    };\n\n    /**\n     * Describe a \"suite\" with the given `title`.\n     */\n\n    context.suite = function(title){\n      if (suites.length > 1) suites.shift();\n      var suite = Suite.create(suites[0], title);\n      suite.file = file;\n      suites.unshift(suite);\n      return suite;\n    };\n\n    /**\n     * Exclusive test-case.\n     */\n\n    context.suite.only = function(title, fn){\n      var suite = context.suite(title, fn);\n      mocha.grep(suite.fullTitle());\n    };\n\n    /**\n     * Describe a specification or test-case\n     * with the given `title` and callback `fn`\n     * acting as a thunk.\n     */\n\n    context.test = function(title, fn){\n      var test = new Test(title, fn);\n      test.file = file;\n      suites[0].addTest(test);\n      return test;\n    };\n\n    /**\n     * Exclusive test-case.\n     */\n\n    context.test.only = function(title, fn){\n      var test = context.test(title, fn);\n      var reString = '^' + escapeRe(test.fullTitle()) + '$';\n      mocha.grep(new RegExp(reString));\n    };\n\n    /**\n     * Pending test case.\n     */\n\n    context.test.skip = function(title){\n      context.test(title);\n    };\n  });\n};\n\n}); // module: interfaces/qunit.js\n\nrequire.register(\"interfaces/tdd.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Suite = require('../suite')\n  , Test = require('../test')\n  , escapeRe = require('browser/escape-string-regexp')\n  , utils = require('../utils');\n\n/**\n * TDD-style interface:\n *\n *      suite('Array', function(){\n *        suite('#indexOf()', function(){\n *          suiteSetup(function(){\n *\n *          });\n *\n *          test('should return -1 when not present', function(){\n *\n *          });\n *\n *          test('should return the index when present', function(){\n *\n *          });\n *\n *          suiteTeardown(function(){\n *\n *          });\n *        });\n *      });\n *\n */\n\nmodule.exports = function(suite){\n  var suites = [suite];\n\n  suite.on('pre-require', function(context, file, mocha){\n\n    /**\n     * Execute before each test case.\n     */\n\n    context.setup = function(name, fn){\n      suites[0].beforeEach(name, fn);\n    };\n\n    /**\n     * Execute after each test case.\n     */\n\n    context.teardown = function(name, fn){\n      suites[0].afterEach(name, fn);\n    };\n\n    /**\n     * Execute before the suite.\n     */\n\n    context.suiteSetup = function(name, fn){\n      suites[0].beforeAll(name, fn);\n    };\n\n    /**\n     * Execute after the suite.\n     */\n\n    context.suiteTeardown = function(name, fn){\n      suites[0].afterAll(name, fn);\n    };\n\n    /**\n     * Describe a \"suite\" with the given `title`\n     * and callback `fn` containing nested suites\n     * and/or tests.\n     */\n\n    context.suite = function(title, fn){\n      var suite = Suite.create(suites[0], title);\n      suite.file = file;\n      suites.unshift(suite);\n      fn.call(suite);\n      suites.shift();\n      return suite;\n    };\n\n    /**\n     * Pending suite.\n     */\n    context.suite.skip = function(title, fn) {\n      var suite = Suite.create(suites[0], title);\n      suite.pending = true;\n      suites.unshift(suite);\n      fn.call(suite);\n      suites.shift();\n    };\n\n    /**\n     * Exclusive test-case.\n     */\n\n    context.suite.only = function(title, fn){\n      var suite = context.suite(title, fn);\n      mocha.grep(suite.fullTitle());\n    };\n\n    /**\n     * Describe a specification or test-case\n     * with the given `title` and callback `fn`\n     * acting as a thunk.\n     */\n\n    context.test = function(title, fn){\n      var suite = suites[0];\n      if (suite.pending) fn = null;\n      var test = new Test(title, fn);\n      test.file = file;\n      suite.addTest(test);\n      return test;\n    };\n\n    /**\n     * Exclusive test-case.\n     */\n\n    context.test.only = function(title, fn){\n      var test = context.test(title, fn);\n      var reString = '^' + escapeRe(test.fullTitle()) + '$';\n      mocha.grep(new RegExp(reString));\n    };\n\n    /**\n     * Pending test case.\n     */\n\n    context.test.skip = function(title){\n      context.test(title);\n    };\n  });\n};\n\n}); // module: interfaces/tdd.js\n\nrequire.register(\"mocha.js\", function(module, exports, require){\n/*!\n * mocha\n * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>\n * MIT Licensed\n */\n\n/**\n * Module dependencies.\n */\n\nvar path = require('browser/path')\n  , escapeRe = require('browser/escape-string-regexp')\n  , utils = require('./utils');\n\n/**\n * Expose `Mocha`.\n */\n\nexports = module.exports = Mocha;\n\n/**\n * To require local UIs and reporters when running in node.\n */\n\nif (typeof process !== 'undefined' && typeof process.cwd === 'function') {\n  var join = path.join\n    , cwd = process.cwd();\n  module.paths.push(cwd, join(cwd, 'node_modules'));\n}\n\n/**\n * Expose internals.\n */\n\nexports.utils = utils;\nexports.interfaces = require('./interfaces');\nexports.reporters = require('./reporters');\nexports.Runnable = require('./runnable');\nexports.Context = require('./context');\nexports.Runner = require('./runner');\nexports.Suite = require('./suite');\nexports.Hook = require('./hook');\nexports.Test = require('./test');\n\n/**\n * Return image `name` path.\n *\n * @param {String} name\n * @return {String}\n * @api private\n */\n\nfunction image(name) {\n  return __dirname + '/../images/' + name + '.png';\n}\n\n/**\n * Setup mocha with `options`.\n *\n * Options:\n *\n *   - `ui` name \"bdd\", \"tdd\", \"exports\" etc\n *   - `reporter` reporter instance, defaults to `mocha.reporters.spec`\n *   - `globals` array of accepted globals\n *   - `timeout` timeout in milliseconds\n *   - `bail` bail on the first test failure\n *   - `slow` milliseconds to wait before considering a test slow\n *   - `ignoreLeaks` ignore global leaks\n *   - `grep` string or regexp to filter tests with\n *\n * @param {Object} options\n * @api public\n */\n\nfunction Mocha(options) {\n  options = options || {};\n  this.files = [];\n  this.options = options;\n  this.grep(options.grep);\n  this.suite = new exports.Suite('', new exports.Context);\n  this.ui(options.ui);\n  this.bail(options.bail);\n  this.reporter(options.reporter, options.reporterOptions);\n  if (null != options.timeout) this.timeout(options.timeout);\n  this.useColors(options.useColors)\n  if (options.enableTimeouts !== null) this.enableTimeouts(options.enableTimeouts);\n  if (options.slow) this.slow(options.slow);\n\n  this.suite.on('pre-require', function (context) {\n    exports.afterEach = context.afterEach || context.teardown;\n    exports.after = context.after || context.suiteTeardown;\n    exports.beforeEach = context.beforeEach || context.setup;\n    exports.before = context.before || context.suiteSetup;\n    exports.describe = context.describe || context.suite;\n    exports.it = context.it || context.test;\n    exports.setup = context.setup || context.beforeEach;\n    exports.suiteSetup = context.suiteSetup || context.before;\n    exports.suiteTeardown = context.suiteTeardown || context.after;\n    exports.suite = context.suite || context.describe;\n    exports.teardown = context.teardown || context.afterEach;\n    exports.test = context.test || context.it;\n  });\n}\n\n/**\n * Enable or disable bailing on the first failure.\n *\n * @param {Boolean} [bail]\n * @api public\n */\n\nMocha.prototype.bail = function(bail){\n  if (0 == arguments.length) bail = true;\n  this.suite.bail(bail);\n  return this;\n};\n\n/**\n * Add test `file`.\n *\n * @param {String} file\n * @api public\n */\n\nMocha.prototype.addFile = function(file){\n  this.files.push(file);\n  return this;\n};\n\n/**\n * Set reporter to `reporter`, defaults to \"spec\".\n *\n * @param {String|Function} reporter name or constructor\n * @param {Object} reporterOptions optional options\n * @api public\n */\nMocha.prototype.reporter = function(reporter, reporterOptions){\n  if ('function' == typeof reporter) {\n    this._reporter = reporter;\n  } else {\n    reporter = reporter || 'spec';\n    var _reporter;\n    try { _reporter = require('./reporters/' + reporter); } catch (err) {};\n    if (!_reporter) try { _reporter = require(reporter); } catch (err) {};\n    if (!_reporter && reporter === 'teamcity')\n      console.warn('The Teamcity reporter was moved to a package named ' +\n        'mocha-teamcity-reporter ' +\n        '(https://npmjs.org/package/mocha-teamcity-reporter).');\n    if (!_reporter) throw new Error('invalid reporter \"' + reporter + '\"');\n    this._reporter = _reporter;\n  }\n  this.options.reporterOptions = reporterOptions;\n  return this;\n};\n\n/**\n * Set test UI `name`, defaults to \"bdd\".\n *\n * @param {String} bdd\n * @api public\n */\n\nMocha.prototype.ui = function(name){\n  name = name || 'bdd';\n  this._ui = exports.interfaces[name];\n  if (!this._ui) try { this._ui = require(name); } catch (err) {};\n  if (!this._ui) throw new Error('invalid interface \"' + name + '\"');\n  this._ui = this._ui(this.suite);\n  return this;\n};\n\n/**\n * Load registered files.\n *\n * @api private\n */\n\nMocha.prototype.loadFiles = function(fn){\n  var self = this;\n  var suite = this.suite;\n  var pending = this.files.length;\n  this.files.forEach(function(file){\n    file = path.resolve(file);\n    suite.emit('pre-require', global, file, self);\n    suite.emit('require', require(file), file, self);\n    suite.emit('post-require', global, file, self);\n    --pending || (fn && fn());\n  });\n};\n\n/**\n * Enable growl support.\n *\n * @api private\n */\n\nMocha.prototype._growl = function(runner, reporter) {\n  var notify = require('growl');\n\n  runner.on('end', function(){\n    var stats = reporter.stats;\n    if (stats.failures) {\n      var msg = stats.failures + ' of ' + runner.total + ' tests failed';\n      notify(msg, { name: 'mocha', title: 'Failed', image: image('error') });\n    } else {\n      notify(stats.passes + ' tests passed in ' + stats.duration + 'ms', {\n          name: 'mocha'\n        , title: 'Passed'\n        , image: image('ok')\n      });\n    }\n  });\n};\n\n/**\n * Add regexp to grep, if `re` is a string it is escaped.\n *\n * @param {RegExp|String} re\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.grep = function(re){\n  this.options.grep = 'string' == typeof re\n    ? new RegExp(escapeRe(re))\n    : re;\n  return this;\n};\n\n/**\n * Invert `.grep()` matches.\n *\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.invert = function(){\n  this.options.invert = true;\n  return this;\n};\n\n/**\n * Ignore global leaks.\n *\n * @param {Boolean} ignore\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.ignoreLeaks = function(ignore){\n  this.options.ignoreLeaks = !!ignore;\n  return this;\n};\n\n/**\n * Enable global leak checking.\n *\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.checkLeaks = function(){\n  this.options.ignoreLeaks = false;\n  return this;\n};\n\n/**\n * Enable growl support.\n *\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.growl = function(){\n  this.options.growl = true;\n  return this;\n};\n\n/**\n * Ignore `globals` array or string.\n *\n * @param {Array|String} globals\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.globals = function(globals){\n  this.options.globals = (this.options.globals || []).concat(globals);\n  return this;\n};\n\n/**\n * Emit color output.\n *\n * @param {Boolean} colors\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.useColors = function(colors){\n  if (colors !== undefined) {\n    this.options.useColors = colors;\n  }\n  return this;\n};\n\n/**\n * Use inline diffs rather than +/-.\n *\n * @param {Boolean} inlineDiffs\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.useInlineDiffs = function(inlineDiffs) {\n  this.options.useInlineDiffs = arguments.length && inlineDiffs != undefined\n  ? inlineDiffs\n  : false;\n  return this;\n};\n\n/**\n * Set the timeout in milliseconds.\n *\n * @param {Number} timeout\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.timeout = function(timeout){\n  this.suite.timeout(timeout);\n  return this;\n};\n\n/**\n * Set slowness threshold in milliseconds.\n *\n * @param {Number} slow\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.slow = function(slow){\n  this.suite.slow(slow);\n  return this;\n};\n\n/**\n * Enable timeouts.\n *\n * @param {Boolean} enabled\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.enableTimeouts = function(enabled) {\n  this.suite.enableTimeouts(arguments.length && enabled !== undefined\n    ? enabled\n    : true);\n  return this\n};\n\n/**\n * Makes all tests async (accepting a callback)\n *\n * @return {Mocha}\n * @api public\n */\n\nMocha.prototype.asyncOnly = function(){\n  this.options.asyncOnly = true;\n  return this;\n};\n\n/**\n * Disable syntax highlighting (in browser).\n * @returns {Mocha}\n * @api public\n */\nMocha.prototype.noHighlighting = function() {\n  this.options.noHighlighting = true;\n  return this;\n};\n\n/**\n * Run tests and invoke `fn()` when complete.\n *\n * @param {Function} fn\n * @return {Runner}\n * @api public\n */\n\nMocha.prototype.run = function(fn){\n  if (this.files.length) this.loadFiles();\n  var suite = this.suite;\n  var options = this.options;\n  options.files = this.files;\n  var runner = new exports.Runner(suite);\n  var reporter = new this._reporter(runner, options);\n  runner.ignoreLeaks = false !== options.ignoreLeaks;\n  runner.asyncOnly = options.asyncOnly;\n  if (options.grep) runner.grep(options.grep, options.invert);\n  if (options.globals) runner.globals(options.globals);\n  if (options.growl) this._growl(runner, reporter);\n  if (options.useColors !== undefined) {\n    exports.reporters.Base.useColors = options.useColors;\n  }\n  exports.reporters.Base.inlineDiffs = options.useInlineDiffs;\n\n  function done(failures) {\n      if (reporter.done) {\n          reporter.done(failures, fn);\n      } else {\n          fn(failures);\n      }\n  }\n\n  return runner.run(done);\n};\n\n}); // module: mocha.js\n\nrequire.register(\"ms.js\", function(module, exports, require){\n/**\n * Helpers.\n */\n\nvar s = 1000;\nvar m = s * 60;\nvar h = m * 60;\nvar d = h * 24;\nvar y = d * 365.25;\n\n/**\n * Parse or format the given `val`.\n *\n * Options:\n *\n *  - `long` verbose formatting [false]\n *\n * @param {String|Number} val\n * @param {Object} options\n * @return {String|Number}\n * @api public\n */\n\nmodule.exports = function(val, options){\n  options = options || {};\n  if ('string' == typeof val) return parse(val);\n  return options['long'] ? longFormat(val) : shortFormat(val);\n};\n\n/**\n * Parse the given `str` and return milliseconds.\n *\n * @param {String} str\n * @return {Number}\n * @api private\n */\n\nfunction parse(str) {\n  var match = /^((?:\\d+)?\\.?\\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);\n  if (!match) return;\n  var n = parseFloat(match[1]);\n  var type = (match[2] || 'ms').toLowerCase();\n  switch (type) {\n    case 'years':\n    case 'year':\n    case 'y':\n      return n * y;\n    case 'days':\n    case 'day':\n    case 'd':\n      return n * d;\n    case 'hours':\n    case 'hour':\n    case 'h':\n      return n * h;\n    case 'minutes':\n    case 'minute':\n    case 'm':\n      return n * m;\n    case 'seconds':\n    case 'second':\n    case 's':\n      return n * s;\n    case 'ms':\n      return n;\n  }\n}\n\n/**\n * Short format for `ms`.\n *\n * @param {Number} ms\n * @return {String}\n * @api private\n */\n\nfunction shortFormat(ms) {\n  if (ms >= d) return Math.round(ms / d) + 'd';\n  if (ms >= h) return Math.round(ms / h) + 'h';\n  if (ms >= m) return Math.round(ms / m) + 'm';\n  if (ms >= s) return Math.round(ms / s) + 's';\n  return ms + 'ms';\n}\n\n/**\n * Long format for `ms`.\n *\n * @param {Number} ms\n * @return {String}\n * @api private\n */\n\nfunction longFormat(ms) {\n  return plural(ms, d, 'day')\n    || plural(ms, h, 'hour')\n    || plural(ms, m, 'minute')\n    || plural(ms, s, 'second')\n    || ms + ' ms';\n}\n\n/**\n * Pluralization helper.\n */\n\nfunction plural(ms, n, name) {\n  if (ms < n) return;\n  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;\n  return Math.ceil(ms / n) + ' ' + name + 's';\n}\n\n}); // module: ms.js\n\nrequire.register(\"reporters/base.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar tty = require('browser/tty')\n  , diff = require('browser/diff')\n  , ms = require('../ms')\n  , utils = require('../utils');\n\n/**\n * Save timer references to avoid Sinon interfering (see GH-237).\n */\n\nvar Date = global.Date\n  , setTimeout = global.setTimeout\n  , setInterval = global.setInterval\n  , clearTimeout = global.clearTimeout\n  , clearInterval = global.clearInterval;\n\n/**\n * Check if both stdio streams are associated with a tty.\n */\n\nvar isatty = tty.isatty(1) && tty.isatty(2);\n\n/**\n * Expose `Base`.\n */\n\nexports = module.exports = Base;\n\n/**\n * Enable coloring by default.\n */\n\nexports.useColors = isatty || (process.env.MOCHA_COLORS !== undefined);\n\n/**\n * Inline diffs instead of +/-\n */\n\nexports.inlineDiffs = false;\n\n/**\n * Default color map.\n */\n\nexports.colors = {\n    'pass': 90\n  , 'fail': 31\n  , 'bright pass': 92\n  , 'bright fail': 91\n  , 'bright yellow': 93\n  , 'pending': 36\n  , 'suite': 0\n  , 'error title': 0\n  , 'error message': 31\n  , 'error stack': 90\n  , 'checkmark': 32\n  , 'fast': 90\n  , 'medium': 33\n  , 'slow': 31\n  , 'green': 32\n  , 'light': 90\n  , 'diff gutter': 90\n  , 'diff added': 42\n  , 'diff removed': 41\n};\n\n/**\n * Default symbol map.\n */\n\nexports.symbols = {\n  ok: '✓',\n  err: '✖',\n  dot: '․'\n};\n\n// With node.js on Windows: use symbols available in terminal default fonts\nif ('win32' == process.platform) {\n  exports.symbols.ok = '\\u221A';\n  exports.symbols.err = '\\u00D7';\n  exports.symbols.dot = '.';\n}\n\n/**\n * Color `str` with the given `type`,\n * allowing colors to be disabled,\n * as well as user-defined color\n * schemes.\n *\n * @param {String} type\n * @param {String} str\n * @return {String}\n * @api private\n */\n\nvar color = exports.color = function(type, str) {\n  if (!exports.useColors) return String(str);\n  return '\\u001b[' + exports.colors[type] + 'm' + str + '\\u001b[0m';\n};\n\n/**\n * Expose term window size, with some\n * defaults for when stderr is not a tty.\n */\n\nexports.window = {\n  width: isatty\n    ? process.stdout.getWindowSize\n      ? process.stdout.getWindowSize(1)[0]\n      : tty.getWindowSize()[1]\n    : 75\n};\n\n/**\n * Expose some basic cursor interactions\n * that are common among reporters.\n */\n\nexports.cursor = {\n  hide: function(){\n    isatty && process.stdout.write('\\u001b[?25l');\n  },\n\n  show: function(){\n    isatty && process.stdout.write('\\u001b[?25h');\n  },\n\n  deleteLine: function(){\n    isatty && process.stdout.write('\\u001b[2K');\n  },\n\n  beginningOfLine: function(){\n    isatty && process.stdout.write('\\u001b[0G');\n  },\n\n  CR: function(){\n    if (isatty) {\n      exports.cursor.deleteLine();\n      exports.cursor.beginningOfLine();\n    } else {\n      process.stdout.write('\\r');\n    }\n  }\n};\n\n/**\n * Outut the given `failures` as a list.\n *\n * @param {Array} failures\n * @api public\n */\n\nexports.list = function(failures){\n  console.log();\n  failures.forEach(function(test, i){\n    // format\n    var fmt = color('error title', '  %s) %s:\\n')\n      + color('error message', '     %s')\n      + color('error stack', '\\n%s\\n');\n\n    // msg\n    var err = test.err\n      , message = err.message || ''\n      , stack = err.stack || message\n      , index = stack.indexOf(message) + message.length\n      , msg = stack.slice(0, index)\n      , actual = err.actual\n      , expected = err.expected\n      , escape = true;\n\n    // uncaught\n    if (err.uncaught) {\n      msg = 'Uncaught ' + msg;\n    }\n\n    // explicitly show diff\n    if (err.showDiff && sameType(actual, expected)) {\n\n      if ('string' !== typeof actual) {\n        escape = false;\n        err.actual = actual = utils.stringify(actual);\n        err.expected = expected = utils.stringify(expected);\n      }\n\n      fmt = color('error title', '  %s) %s:\\n%s') + color('error stack', '\\n%s\\n');\n      var match = message.match(/^([^:]+): expected/);\n      msg = '\\n      ' + color('error message', match ? match[1] : msg);\n\n      if (exports.inlineDiffs) {\n        msg += inlineDiff(err, escape);\n      } else {\n        msg += unifiedDiff(err, escape);\n      }\n    }\n\n    // indent stack trace without msg\n    stack = stack.slice(index ? index + 1 : index)\n      .replace(/^/gm, '  ');\n\n    console.log(fmt, (i + 1), test.fullTitle(), msg, stack);\n  });\n};\n\n/**\n * Initialize a new `Base` reporter.\n *\n * All other reporters generally\n * inherit from this reporter, providing\n * stats such as test duration, number\n * of tests passed / failed etc.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction Base(runner) {\n  var self = this\n    , stats = this.stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 }\n    , failures = this.failures = [];\n\n  if (!runner) return;\n  this.runner = runner;\n\n  runner.stats = stats;\n\n  runner.on('start', function(){\n    stats.start = new Date;\n  });\n\n  runner.on('suite', function(suite){\n    stats.suites = stats.suites || 0;\n    suite.root || stats.suites++;\n  });\n\n  runner.on('test end', function(test){\n    stats.tests = stats.tests || 0;\n    stats.tests++;\n  });\n\n  runner.on('pass', function(test){\n    stats.passes = stats.passes || 0;\n\n    var medium = test.slow() / 2;\n    test.speed = test.duration > test.slow()\n      ? 'slow'\n      : test.duration > medium\n        ? 'medium'\n        : 'fast';\n\n    stats.passes++;\n  });\n\n  runner.on('fail', function(test, err){\n    stats.failures = stats.failures || 0;\n    stats.failures++;\n    test.err = err;\n    failures.push(test);\n  });\n\n  runner.on('end', function(){\n    stats.end = new Date;\n    stats.duration = new Date - stats.start;\n  });\n\n  runner.on('pending', function(){\n    stats.pending++;\n  });\n}\n\n/**\n * Output common epilogue used by many of\n * the bundled reporters.\n *\n * @api public\n */\n\nBase.prototype.epilogue = function(){\n  var stats = this.stats;\n  var tests;\n  var fmt;\n\n  console.log();\n\n  // passes\n  fmt = color('bright pass', ' ')\n    + color('green', ' %d passing')\n    + color('light', ' (%s)');\n\n  console.log(fmt,\n    stats.passes || 0,\n    ms(stats.duration));\n\n  // pending\n  if (stats.pending) {\n    fmt = color('pending', ' ')\n      + color('pending', ' %d pending');\n\n    console.log(fmt, stats.pending);\n  }\n\n  // failures\n  if (stats.failures) {\n    fmt = color('fail', '  %d failing');\n\n    console.log(fmt, stats.failures);\n\n    Base.list(this.failures);\n    console.log();\n  }\n\n  console.log();\n};\n\n/**\n * Pad the given `str` to `len`.\n *\n * @param {String} str\n * @param {String} len\n * @return {String}\n * @api private\n */\n\nfunction pad(str, len) {\n  str = String(str);\n  return Array(len - str.length + 1).join(' ') + str;\n}\n\n\n/**\n * Returns an inline diff between 2 strings with coloured ANSI output\n *\n * @param {Error} Error with actual/expected\n * @return {String} Diff\n * @api private\n */\n\nfunction inlineDiff(err, escape) {\n  var msg = errorDiff(err, 'WordsWithSpace', escape);\n\n  // linenos\n  var lines = msg.split('\\n');\n  if (lines.length > 4) {\n    var width = String(lines.length).length;\n    msg = lines.map(function(str, i){\n      return pad(++i, width) + ' |' + ' ' + str;\n    }).join('\\n');\n  }\n\n  // legend\n  msg = '\\n'\n    + color('diff removed', 'actual')\n    + ' '\n    + color('diff added', 'expected')\n    + '\\n\\n'\n    + msg\n    + '\\n';\n\n  // indent\n  msg = msg.replace(/^/gm, '      ');\n  return msg;\n}\n\n/**\n * Returns a unified diff between 2 strings\n *\n * @param {Error} Error with actual/expected\n * @return {String} Diff\n * @api private\n */\n\nfunction unifiedDiff(err, escape) {\n  var indent = '      ';\n  function cleanUp(line) {\n    if (escape) {\n      line = escapeInvisibles(line);\n    }\n    if (line[0] === '+') return indent + colorLines('diff added', line);\n    if (line[0] === '-') return indent + colorLines('diff removed', line);\n    if (line.match(/\\@\\@/)) return null;\n    if (line.match(/\\\\ No newline/)) return null;\n    else return indent + line;\n  }\n  function notBlank(line) {\n    return line != null;\n  }\n  msg = diff.createPatch('string', err.actual, err.expected);\n  var lines = msg.split('\\n').splice(4);\n  return '\\n      '\n         + colorLines('diff added',   '+ expected') + ' '\n         + colorLines('diff removed', '- actual')\n         + '\\n\\n'\n         + lines.map(cleanUp).filter(notBlank).join('\\n');\n}\n\n/**\n * Return a character diff for `err`.\n *\n * @param {Error} err\n * @return {String}\n * @api private\n */\n\nfunction errorDiff(err, type, escape) {\n  var actual   = escape ? escapeInvisibles(err.actual)   : err.actual;\n  var expected = escape ? escapeInvisibles(err.expected) : err.expected;\n  return diff['diff' + type](actual, expected).map(function(str){\n    if (str.added) return colorLines('diff added', str.value);\n    if (str.removed) return colorLines('diff removed', str.value);\n    return str.value;\n  }).join('');\n}\n\n/**\n * Returns a string with all invisible characters in plain text\n *\n * @param {String} line\n * @return {String}\n * @api private\n */\nfunction escapeInvisibles(line) {\n    return line.replace(/\\t/g, '<tab>')\n               .replace(/\\r/g, '<CR>')\n               .replace(/\\n/g, '<LF>\\n');\n}\n\n/**\n * Color lines for `str`, using the color `name`.\n *\n * @param {String} name\n * @param {String} str\n * @return {String}\n * @api private\n */\n\nfunction colorLines(name, str) {\n  return str.split('\\n').map(function(str){\n    return color(name, str);\n  }).join('\\n');\n}\n\n/**\n * Check that a / b have the same type.\n *\n * @param {Object} a\n * @param {Object} b\n * @return {Boolean}\n * @api private\n */\n\nfunction sameType(a, b) {\n  a = Object.prototype.toString.call(a);\n  b = Object.prototype.toString.call(b);\n  return a == b;\n}\n\n}); // module: reporters/base.js\n\nrequire.register(\"reporters/doc.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , utils = require('../utils');\n\n/**\n * Expose `Doc`.\n */\n\nexports = module.exports = Doc;\n\n/**\n * Initialize a new `Doc` reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction Doc(runner) {\n  Base.call(this, runner);\n\n  var self = this\n    , stats = this.stats\n    , total = runner.total\n    , indents = 2;\n\n  function indent() {\n    return Array(indents).join('  ');\n  }\n\n  runner.on('suite', function(suite){\n    if (suite.root) return;\n    ++indents;\n    console.log('%s<section class=\"suite\">', indent());\n    ++indents;\n    console.log('%s<h1>%s</h1>', indent(), utils.escape(suite.title));\n    console.log('%s<dl>', indent());\n  });\n\n  runner.on('suite end', function(suite){\n    if (suite.root) return;\n    console.log('%s</dl>', indent());\n    --indents;\n    console.log('%s</section>', indent());\n    --indents;\n  });\n\n  runner.on('pass', function(test){\n    console.log('%s  <dt>%s</dt>', indent(), utils.escape(test.title));\n    var code = utils.escape(utils.clean(test.fn.toString()));\n    console.log('%s  <dd><pre><code>%s</code></pre></dd>', indent(), code);\n  });\n\n  runner.on('fail', function(test, err){\n    console.log('%s  <dt class=\"error\">%s</dt>', indent(), utils.escape(test.title));\n    var code = utils.escape(utils.clean(test.fn.toString()));\n    console.log('%s  <dd class=\"error\"><pre><code>%s</code></pre></dd>', indent(), code);\n    console.log('%s  <dd class=\"error\">%s</dd>', indent(), utils.escape(err));\n  });\n}\n\n}); // module: reporters/doc.js\n\nrequire.register(\"reporters/dot.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , color = Base.color;\n\n/**\n * Expose `Dot`.\n */\n\nexports = module.exports = Dot;\n\n/**\n * Initialize a new `Dot` matrix test reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction Dot(runner) {\n  Base.call(this, runner);\n\n  var self = this\n    , stats = this.stats\n    , width = Base.window.width * .75 | 0\n    , n = -1;\n\n  runner.on('start', function(){\n    process.stdout.write('\\n  ');\n  });\n\n  runner.on('pending', function(test){\n    if (++n % width == 0) process.stdout.write('\\n  ');\n    process.stdout.write(color('pending', Base.symbols.dot));\n  });\n\n  runner.on('pass', function(test){\n    if (++n % width == 0) process.stdout.write('\\n  ');\n    if ('slow' == test.speed) {\n      process.stdout.write(color('bright yellow', Base.symbols.dot));\n    } else {\n      process.stdout.write(color(test.speed, Base.symbols.dot));\n    }\n  });\n\n  runner.on('fail', function(test, err){\n    if (++n % width == 0) process.stdout.write('\\n  ');\n    process.stdout.write(color('fail', Base.symbols.dot));\n  });\n\n  runner.on('end', function(){\n    console.log();\n    self.epilogue();\n  });\n}\n\n/**\n * Inherit from `Base.prototype`.\n */\n\nfunction F(){};\nF.prototype = Base.prototype;\nDot.prototype = new F;\nDot.prototype.constructor = Dot;\n\n\n}); // module: reporters/dot.js\n\nrequire.register(\"reporters/html-cov.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar JSONCov = require('./json-cov')\n  , fs = require('browser/fs');\n\n/**\n * Expose `HTMLCov`.\n */\n\nexports = module.exports = HTMLCov;\n\n/**\n * Initialize a new `JsCoverage` reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction HTMLCov(runner) {\n  var jade = require('jade')\n    , file = __dirname + '/templates/coverage.jade'\n    , str = fs.readFileSync(file, 'utf8')\n    , fn = jade.compile(str, { filename: file })\n    , self = this;\n\n  JSONCov.call(this, runner, false);\n\n  runner.on('end', function(){\n    process.stdout.write(fn({\n        cov: self.cov\n      , coverageClass: coverageClass\n    }));\n  });\n}\n\n/**\n * Return coverage class for `n`.\n *\n * @return {String}\n * @api private\n */\n\nfunction coverageClass(n) {\n  if (n >= 75) return 'high';\n  if (n >= 50) return 'medium';\n  if (n >= 25) return 'low';\n  return 'terrible';\n}\n\n}); // module: reporters/html-cov.js\n\nrequire.register(\"reporters/html.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , utils = require('../utils')\n  , Progress = require('../browser/progress')\n  , escape = utils.escape;\n\n/**\n * Save timer references to avoid Sinon interfering (see GH-237).\n */\n\nvar Date = global.Date\n  , setTimeout = global.setTimeout\n  , setInterval = global.setInterval\n  , clearTimeout = global.clearTimeout\n  , clearInterval = global.clearInterval;\n\n/**\n * Expose `HTML`.\n */\n\nexports = module.exports = HTML;\n\n/**\n * Stats template.\n */\n\nvar statsTemplate = '<ul id=\"mocha-stats\">'\n  + '<li class=\"progress\"><canvas width=\"40\" height=\"40\"></canvas></li>'\n  + '<li class=\"passes\"><a href=\"#\">passes:</a> <em>0</em></li>'\n  + '<li class=\"failures\"><a href=\"#\">failures:</a> <em>0</em></li>'\n  + '<li class=\"duration\">duration: <em>0</em>s</li>'\n  + '</ul>';\n\n/**\n * Initialize a new `HTML` reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction HTML(runner) {\n  Base.call(this, runner);\n\n  var self = this\n    , stats = this.stats\n    , total = runner.total\n    , stat = fragment(statsTemplate)\n    , items = stat.getElementsByTagName('li')\n    , passes = items[1].getElementsByTagName('em')[0]\n    , passesLink = items[1].getElementsByTagName('a')[0]\n    , failures = items[2].getElementsByTagName('em')[0]\n    , failuresLink = items[2].getElementsByTagName('a')[0]\n    , duration = items[3].getElementsByTagName('em')[0]\n    , canvas = stat.getElementsByTagName('canvas')[0]\n    , report = fragment('<ul id=\"mocha-report\"></ul>')\n    , stack = [report]\n    , progress\n    , ctx\n    , root = document.getElementById('mocha');\n\n  if (canvas.getContext) {\n    var ratio = window.devicePixelRatio || 1;\n    canvas.style.width = canvas.width;\n    canvas.style.height = canvas.height;\n    canvas.width *= ratio;\n    canvas.height *= ratio;\n    ctx = canvas.getContext('2d');\n    ctx.scale(ratio, ratio);\n    progress = new Progress;\n  }\n\n  if (!root) return error('#mocha div missing, add it to your document');\n\n  // pass toggle\n  on(passesLink, 'click', function(){\n    unhide();\n    var name = /pass/.test(report.className) ? '' : ' pass';\n    report.className = report.className.replace(/fail|pass/g, '') + name;\n    if (report.className.trim()) hideSuitesWithout('test pass');\n  });\n\n  // failure toggle\n  on(failuresLink, 'click', function(){\n    unhide();\n    var name = /fail/.test(report.className) ? '' : ' fail';\n    report.className = report.className.replace(/fail|pass/g, '') + name;\n    if (report.className.trim()) hideSuitesWithout('test fail');\n  });\n\n  root.appendChild(stat);\n  root.appendChild(report);\n\n  if (progress) progress.size(40);\n\n  runner.on('suite', function(suite){\n    if (suite.root) return;\n\n    // suite\n    var url = self.suiteURL(suite);\n    var el = fragment('<li class=\"suite\"><h1><a href=\"%s\">%s</a></h1></li>', url, escape(suite.title));\n\n    // container\n    stack[0].appendChild(el);\n    stack.unshift(document.createElement('ul'));\n    el.appendChild(stack[0]);\n  });\n\n  runner.on('suite end', function(suite){\n    if (suite.root) return;\n    stack.shift();\n  });\n\n  runner.on('fail', function(test, err){\n    if ('hook' == test.type) runner.emit('test end', test);\n  });\n\n  runner.on('test end', function(test){\n    // TODO: add to stats\n    var percent = stats.tests / this.total * 100 | 0;\n    if (progress) progress.update(percent).draw(ctx);\n\n    // update stats\n    var ms = new Date - stats.start;\n    text(passes, stats.passes);\n    text(failures, stats.failures);\n    text(duration, (ms / 1000).toFixed(2));\n\n    // test\n    if ('passed' == test.state) {\n      var url = self.testURL(test);\n      var el = fragment('<li class=\"test pass %e\"><h2>%e<span class=\"duration\">%ems</span> <a href=\"%s\" class=\"replay\">‣</a></h2></li>', test.speed, test.title, test.duration, url);\n    } else if (test.pending) {\n      var el = fragment('<li class=\"test pass pending\"><h2>%e</h2></li>', test.title);\n    } else {\n      var el = fragment('<li class=\"test fail\"><h2>%e <a href=\"%e\" class=\"replay\">‣</a></h2></li>', test.title, self.testURL(test));\n      var str = test.err.stack || test.err.toString();\n\n      // FF / Opera do not add the message\n      if (!~str.indexOf(test.err.message)) {\n        str = test.err.message + '\\n' + str;\n      }\n\n      // <=IE7 stringifies to [Object Error]. Since it can be overloaded, we\n      // check for the result of the stringifying.\n      if ('[object Error]' == str) str = test.err.message;\n\n      // Safari doesn't give you a stack. Let's at least provide a source line.\n      if (!test.err.stack && test.err.sourceURL && test.err.line !== undefined) {\n        str += \"\\n(\" + test.err.sourceURL + \":\" + test.err.line + \")\";\n      }\n\n      el.appendChild(fragment('<pre class=\"error\">%e</pre>', str));\n    }\n\n    // toggle code\n    // TODO: defer\n    if (!test.pending) {\n      var h2 = el.getElementsByTagName('h2')[0];\n\n      on(h2, 'click', function(){\n        pre.style.display = 'none' == pre.style.display\n          ? 'block'\n          : 'none';\n      });\n\n      var pre = fragment('<pre><code>%e</code></pre>', utils.clean(test.fn.toString()));\n      el.appendChild(pre);\n      pre.style.display = 'none';\n    }\n\n    // Don't call .appendChild if #mocha-report was already .shift()'ed off the stack.\n    if (stack[0]) stack[0].appendChild(el);\n  });\n}\n\n/**\n * Makes a URL, preserving querystring (\"search\") parameters.\n * @param {string} s\n * @returns {string} your new URL\n */\nvar makeUrl = function makeUrl(s) {\n  var search = window.location.search;\n  return window.location.pathname + (search ? search + '&' : '?' ) + 'grep=' + encodeURIComponent(s);\n};\n\n/**\n * Provide suite URL\n *\n * @param {Object} [suite]\n */\nHTML.prototype.suiteURL = function(suite){\n  return makeUrl(suite.fullTitle());\n};\n\n/**\n * Provide test URL\n *\n * @param {Object} [test]\n */\n\nHTML.prototype.testURL = function(test){\n  return makeUrl(test.fullTitle());\n};\n\n/**\n * Display error `msg`.\n */\n\nfunction error(msg) {\n  document.body.appendChild(fragment('<div id=\"mocha-error\">%s</div>', msg));\n}\n\n/**\n * Return a DOM fragment from `html`.\n */\n\nfunction fragment(html) {\n  var args = arguments\n    , div = document.createElement('div')\n    , i = 1;\n\n  div.innerHTML = html.replace(/%([se])/g, function(_, type){\n    switch (type) {\n      case 's': return String(args[i++]);\n      case 'e': return escape(args[i++]);\n    }\n  });\n\n  return div.firstChild;\n}\n\n/**\n * Check for suites that do not have elements\n * with `classname`, and hide them.\n */\n\nfunction hideSuitesWithout(classname) {\n  var suites = document.getElementsByClassName('suite');\n  for (var i = 0; i < suites.length; i++) {\n    var els = suites[i].getElementsByClassName(classname);\n    if (0 == els.length) suites[i].className += ' hidden';\n  }\n}\n\n/**\n * Unhide .hidden suites.\n */\n\nfunction unhide() {\n  var els = document.getElementsByClassName('suite hidden');\n  for (var i = 0; i < els.length; ++i) {\n    els[i].className = els[i].className.replace('suite hidden', 'suite');\n  }\n}\n\n/**\n * Set `el` text to `str`.\n */\n\nfunction text(el, str) {\n  if (el.textContent) {\n    el.textContent = str;\n  } else {\n    el.innerText = str;\n  }\n}\n\n/**\n * Listen on `event` with callback `fn`.\n */\n\nfunction on(el, event, fn) {\n  if (el.addEventListener) {\n    el.addEventListener(event, fn, false);\n  } else {\n    el.attachEvent('on' + event, fn);\n  }\n}\n\n}); // module: reporters/html.js\n\nrequire.register(\"reporters/index.js\", function(module, exports, require){\nexports.Base = require('./base');\nexports.Dot = require('./dot');\nexports.Doc = require('./doc');\nexports.TAP = require('./tap');\nexports.JSON = require('./json');\nexports.HTML = require('./html');\nexports.List = require('./list');\nexports.Min = require('./min');\nexports.Spec = require('./spec');\nexports.Nyan = require('./nyan');\nexports.XUnit = require('./xunit');\nexports.Markdown = require('./markdown');\nexports.Progress = require('./progress');\nexports.Landing = require('./landing');\nexports.JSONCov = require('./json-cov');\nexports.HTMLCov = require('./html-cov');\nexports.JSONStream = require('./json-stream');\n\n}); // module: reporters/index.js\n\nrequire.register(\"reporters/json-cov.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base');\n\n/**\n * Expose `JSONCov`.\n */\n\nexports = module.exports = JSONCov;\n\n/**\n * Initialize a new `JsCoverage` reporter.\n *\n * @param {Runner} runner\n * @param {Boolean} output\n * @api public\n */\n\nfunction JSONCov(runner, output) {\n  var self = this\n    , output = 1 == arguments.length ? true : output;\n\n  Base.call(this, runner);\n\n  var tests = []\n    , failures = []\n    , passes = [];\n\n  runner.on('test end', function(test){\n    tests.push(test);\n  });\n\n  runner.on('pass', function(test){\n    passes.push(test);\n  });\n\n  runner.on('fail', function(test){\n    failures.push(test);\n  });\n\n  runner.on('end', function(){\n    var cov = global._$jscoverage || {};\n    var result = self.cov = map(cov);\n    result.stats = self.stats;\n    result.tests = tests.map(clean);\n    result.failures = failures.map(clean);\n    result.passes = passes.map(clean);\n    if (!output) return;\n    process.stdout.write(JSON.stringify(result, null, 2 ));\n  });\n}\n\n/**\n * Map jscoverage data to a JSON structure\n * suitable for reporting.\n *\n * @param {Object} cov\n * @return {Object}\n * @api private\n */\n\nfunction map(cov) {\n  var ret = {\n      instrumentation: 'node-jscoverage'\n    , sloc: 0\n    , hits: 0\n    , misses: 0\n    , coverage: 0\n    , files: []\n  };\n\n  for (var filename in cov) {\n    var data = coverage(filename, cov[filename]);\n    ret.files.push(data);\n    ret.hits += data.hits;\n    ret.misses += data.misses;\n    ret.sloc += data.sloc;\n  }\n\n  ret.files.sort(function(a, b) {\n    return a.filename.localeCompare(b.filename);\n  });\n\n  if (ret.sloc > 0) {\n    ret.coverage = (ret.hits / ret.sloc) * 100;\n  }\n\n  return ret;\n}\n\n/**\n * Map jscoverage data for a single source file\n * to a JSON structure suitable for reporting.\n *\n * @param {String} filename name of the source file\n * @param {Object} data jscoverage coverage data\n * @return {Object}\n * @api private\n */\n\nfunction coverage(filename, data) {\n  var ret = {\n    filename: filename,\n    coverage: 0,\n    hits: 0,\n    misses: 0,\n    sloc: 0,\n    source: {}\n  };\n\n  data.source.forEach(function(line, num){\n    num++;\n\n    if (data[num] === 0) {\n      ret.misses++;\n      ret.sloc++;\n    } else if (data[num] !== undefined) {\n      ret.hits++;\n      ret.sloc++;\n    }\n\n    ret.source[num] = {\n        source: line\n      , coverage: data[num] === undefined\n        ? ''\n        : data[num]\n    };\n  });\n\n  ret.coverage = ret.hits / ret.sloc * 100;\n\n  return ret;\n}\n\n/**\n * Return a plain-object representation of `test`\n * free of cyclic properties etc.\n *\n * @param {Object} test\n * @return {Object}\n * @api private\n */\n\nfunction clean(test) {\n  return {\n      title: test.title\n    , fullTitle: test.fullTitle()\n    , duration: test.duration\n  }\n}\n\n}); // module: reporters/json-cov.js\n\nrequire.register(\"reporters/json-stream.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , color = Base.color;\n\n/**\n * Expose `List`.\n */\n\nexports = module.exports = List;\n\n/**\n * Initialize a new `List` test reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction List(runner) {\n  Base.call(this, runner);\n\n  var self = this\n    , stats = this.stats\n    , total = runner.total;\n\n  runner.on('start', function(){\n    console.log(JSON.stringify(['start', { total: total }]));\n  });\n\n  runner.on('pass', function(test){\n    console.log(JSON.stringify(['pass', clean(test)]));\n  });\n\n  runner.on('fail', function(test, err){\n    test = clean(test);\n    test.err = err.message;\n    console.log(JSON.stringify(['fail', test]));\n  });\n\n  runner.on('end', function(){\n    process.stdout.write(JSON.stringify(['end', self.stats]));\n  });\n}\n\n/**\n * Return a plain-object representation of `test`\n * free of cyclic properties etc.\n *\n * @param {Object} test\n * @return {Object}\n * @api private\n */\n\nfunction clean(test) {\n  return {\n      title: test.title\n    , fullTitle: test.fullTitle()\n    , duration: test.duration\n  }\n}\n\n}); // module: reporters/json-stream.js\n\nrequire.register(\"reporters/json.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , cursor = Base.cursor\n  , color = Base.color;\n\n/**\n * Expose `JSON`.\n */\n\nexports = module.exports = JSONReporter;\n\n/**\n * Initialize a new `JSON` reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction JSONReporter(runner) {\n  var self = this;\n  Base.call(this, runner);\n\n  var tests = []\n    , pending = []\n    , failures = []\n    , passes = [];\n\n  runner.on('test end', function(test){\n    tests.push(test);\n  });\n\n  runner.on('pass', function(test){\n    passes.push(test);\n  });\n\n  runner.on('fail', function(test){\n    failures.push(test);\n  });\n\n  runner.on('pending', function(test){\n    pending.push(test);\n  });\n\n  runner.on('end', function(){\n    var obj = {\n      stats: self.stats,\n      tests: tests.map(clean),\n      pending: pending.map(clean),\n      failures: failures.map(clean),\n      passes: passes.map(clean)\n    };\n\n    runner.testResults = obj;\n\n    process.stdout.write(JSON.stringify(obj, null, 2));\n  });\n}\n\n/**\n * Return a plain-object representation of `test`\n * free of cyclic properties etc.\n *\n * @param {Object} test\n * @return {Object}\n * @api private\n */\n\nfunction clean(test) {\n  return {\n    title: test.title,\n    fullTitle: test.fullTitle(),\n    duration: test.duration,\n    err: errorJSON(test.err || {})\n  }\n}\n\n/**\n * Transform `error` into a JSON object.\n * @param {Error} err\n * @return {Object}\n */\n\nfunction errorJSON(err) {\n  var res = {};\n  Object.getOwnPropertyNames(err).forEach(function(key) {\n    res[key] = err[key];\n  }, err);\n  return res;\n}\n\n}); // module: reporters/json.js\n\nrequire.register(\"reporters/landing.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , cursor = Base.cursor\n  , color = Base.color;\n\n/**\n * Expose `Landing`.\n */\n\nexports = module.exports = Landing;\n\n/**\n * Airplane color.\n */\n\nBase.colors.plane = 0;\n\n/**\n * Airplane crash color.\n */\n\nBase.colors['plane crash'] = 31;\n\n/**\n * Runway color.\n */\n\nBase.colors.runway = 90;\n\n/**\n * Initialize a new `Landing` reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction Landing(runner) {\n  Base.call(this, runner);\n\n  var self = this\n    , stats = this.stats\n    , width = Base.window.width * .75 | 0\n    , total = runner.total\n    , stream = process.stdout\n    , plane = color('plane', '✈')\n    , crashed = -1\n    , n = 0;\n\n  function runway() {\n    var buf = Array(width).join('-');\n    return '  ' + color('runway', buf);\n  }\n\n  runner.on('start', function(){\n    stream.write('\\n\\n\\n  ');\n    cursor.hide();\n  });\n\n  runner.on('test end', function(test){\n    // check if the plane crashed\n    var col = -1 == crashed\n      ? width * ++n / total | 0\n      : crashed;\n\n    // show the crash\n    if ('failed' == test.state) {\n      plane = color('plane crash', '✈');\n      crashed = col;\n    }\n\n    // render landing strip\n    stream.write('\\u001b['+(width+1)+'D\\u001b[2A');\n    stream.write(runway());\n    stream.write('\\n  ');\n    stream.write(color('runway', Array(col).join('⋅')));\n    stream.write(plane)\n    stream.write(color('runway', Array(width - col).join('⋅') + '\\n'));\n    stream.write(runway());\n    stream.write('\\u001b[0m');\n  });\n\n  runner.on('end', function(){\n    cursor.show();\n    console.log();\n    self.epilogue();\n  });\n}\n\n/**\n * Inherit from `Base.prototype`.\n */\n\nfunction F(){};\nF.prototype = Base.prototype;\nLanding.prototype = new F;\nLanding.prototype.constructor = Landing;\n\n\n}); // module: reporters/landing.js\n\nrequire.register(\"reporters/list.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , cursor = Base.cursor\n  , color = Base.color;\n\n/**\n * Expose `List`.\n */\n\nexports = module.exports = List;\n\n/**\n * Initialize a new `List` test reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction List(runner) {\n  Base.call(this, runner);\n\n  var self = this\n    , stats = this.stats\n    , n = 0;\n\n  runner.on('start', function(){\n    console.log();\n  });\n\n  runner.on('test', function(test){\n    process.stdout.write(color('pass', '    ' + test.fullTitle() + ': '));\n  });\n\n  runner.on('pending', function(test){\n    var fmt = color('checkmark', '  -')\n      + color('pending', ' %s');\n    console.log(fmt, test.fullTitle());\n  });\n\n  runner.on('pass', function(test){\n    var fmt = color('checkmark', '  '+Base.symbols.dot)\n      + color('pass', ' %s: ')\n      + color(test.speed, '%dms');\n    cursor.CR();\n    console.log(fmt, test.fullTitle(), test.duration);\n  });\n\n  runner.on('fail', function(test, err){\n    cursor.CR();\n    console.log(color('fail', '  %d) %s'), ++n, test.fullTitle());\n  });\n\n  runner.on('end', self.epilogue.bind(self));\n}\n\n/**\n * Inherit from `Base.prototype`.\n */\n\nfunction F(){};\nF.prototype = Base.prototype;\nList.prototype = new F;\nList.prototype.constructor = List;\n\n\n}); // module: reporters/list.js\n\nrequire.register(\"reporters/markdown.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , utils = require('../utils');\n\n/**\n * Constants\n */\n\nvar SUITE_PREFIX = '$';\n\n/**\n * Expose `Markdown`.\n */\n\nexports = module.exports = Markdown;\n\n/**\n * Initialize a new `Markdown` reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction Markdown(runner) {\n  Base.call(this, runner);\n\n  var self = this\n    , stats = this.stats\n    , level = 0\n    , buf = '';\n\n  function title(str) {\n    return Array(level).join('#') + ' ' + str;\n  }\n\n  function indent() {\n    return Array(level).join('  ');\n  }\n\n  function mapTOC(suite, obj) {\n    var ret = obj,\n        key = SUITE_PREFIX + suite.title;\n    obj = obj[key] = obj[key] || { suite: suite };\n    suite.suites.forEach(function(suite){\n      mapTOC(suite, obj);\n    });\n    return ret;\n  }\n\n  function stringifyTOC(obj, level) {\n    ++level;\n    var buf = '';\n    var link;\n    for (var key in obj) {\n      if ('suite' == key) continue;\n      if (key !== SUITE_PREFIX) {\n        link = ' - [' + key.substring(1) + ']';\n        link += '(#' + utils.slug(obj[key].suite.fullTitle()) + ')\\n';\n        buf += Array(level).join('  ') + link;\n      }\n      buf += stringifyTOC(obj[key], level);\n    }\n    return buf;\n  }\n\n  function generateTOC(suite) {\n    var obj = mapTOC(suite, {});\n    return stringifyTOC(obj, 0);\n  }\n\n  generateTOC(runner.suite);\n\n  runner.on('suite', function(suite){\n    ++level;\n    var slug = utils.slug(suite.fullTitle());\n    buf += '<a name=\"' + slug + '\"></a>' + '\\n';\n    buf += title(suite.title) + '\\n';\n  });\n\n  runner.on('suite end', function(suite){\n    --level;\n  });\n\n  runner.on('pass', function(test){\n    var code = utils.clean(test.fn.toString());\n    buf += test.title + '.\\n';\n    buf += '\\n```js\\n';\n    buf += code + '\\n';\n    buf += '```\\n\\n';\n  });\n\n  runner.on('end', function(){\n    process.stdout.write('# TOC\\n');\n    process.stdout.write(generateTOC(runner.suite));\n    process.stdout.write(buf);\n  });\n}\n\n}); // module: reporters/markdown.js\n\nrequire.register(\"reporters/min.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base');\n\n/**\n * Expose `Min`.\n */\n\nexports = module.exports = Min;\n\n/**\n * Initialize a new `Min` minimal test reporter (best used with --watch).\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction Min(runner) {\n  Base.call(this, runner);\n\n  runner.on('start', function(){\n    // clear screen\n    process.stdout.write('\\u001b[2J');\n    // set cursor position\n    process.stdout.write('\\u001b[1;3H');\n  });\n\n  runner.on('end', this.epilogue.bind(this));\n}\n\n/**\n * Inherit from `Base.prototype`.\n */\n\nfunction F(){};\nF.prototype = Base.prototype;\nMin.prototype = new F;\nMin.prototype.constructor = Min;\n\n\n}); // module: reporters/min.js\n\nrequire.register(\"reporters/nyan.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base');\n\n/**\n * Expose `Dot`.\n */\n\nexports = module.exports = NyanCat;\n\n/**\n * Initialize a new `Dot` matrix test reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction NyanCat(runner) {\n  Base.call(this, runner);\n  var self = this\n    , stats = this.stats\n    , width = Base.window.width * .75 | 0\n    , rainbowColors = this.rainbowColors = self.generateColors()\n    , colorIndex = this.colorIndex = 0\n    , numerOfLines = this.numberOfLines = 4\n    , trajectories = this.trajectories = [[], [], [], []]\n    , nyanCatWidth = this.nyanCatWidth = 11\n    , trajectoryWidthMax = this.trajectoryWidthMax = (width - nyanCatWidth)\n    , scoreboardWidth = this.scoreboardWidth = 5\n    , tick = this.tick = 0\n    , n = 0;\n\n  runner.on('start', function(){\n    Base.cursor.hide();\n    self.draw();\n  });\n\n  runner.on('pending', function(test){\n    self.draw();\n  });\n\n  runner.on('pass', function(test){\n    self.draw();\n  });\n\n  runner.on('fail', function(test, err){\n    self.draw();\n  });\n\n  runner.on('end', function(){\n    Base.cursor.show();\n    for (var i = 0; i < self.numberOfLines; i++) write('\\n');\n    self.epilogue();\n  });\n}\n\n/**\n * Draw the nyan cat\n *\n * @api private\n */\n\nNyanCat.prototype.draw = function(){\n  this.appendRainbow();\n  this.drawScoreboard();\n  this.drawRainbow();\n  this.drawNyanCat();\n  this.tick = !this.tick;\n};\n\n/**\n * Draw the \"scoreboard\" showing the number\n * of passes, failures and pending tests.\n *\n * @api private\n */\n\nNyanCat.prototype.drawScoreboard = function(){\n  var stats = this.stats;\n\n  function draw(type, n) {\n    write(' ');\n    write(Base.color(type, n));\n    write('\\n');\n  }\n\n  draw('green', stats.passes);\n  draw('fail', stats.failures);\n  draw('pending', stats.pending);\n  write('\\n');\n\n  this.cursorUp(this.numberOfLines);\n};\n\n/**\n * Append the rainbow.\n *\n * @api private\n */\n\nNyanCat.prototype.appendRainbow = function(){\n  var segment = this.tick ? '_' : '-';\n  var rainbowified = this.rainbowify(segment);\n\n  for (var index = 0; index < this.numberOfLines; index++) {\n    var trajectory = this.trajectories[index];\n    if (trajectory.length >= this.trajectoryWidthMax) trajectory.shift();\n    trajectory.push(rainbowified);\n  }\n};\n\n/**\n * Draw the rainbow.\n *\n * @api private\n */\n\nNyanCat.prototype.drawRainbow = function(){\n  var self = this;\n\n  this.trajectories.forEach(function(line, index) {\n    write('\\u001b[' + self.scoreboardWidth + 'C');\n    write(line.join(''));\n    write('\\n');\n  });\n\n  this.cursorUp(this.numberOfLines);\n};\n\n/**\n * Draw the nyan cat\n *\n * @api private\n */\n\nNyanCat.prototype.drawNyanCat = function() {\n  var self = this;\n  var startWidth = this.scoreboardWidth + this.trajectories[0].length;\n  var dist = '\\u001b[' + startWidth + 'C';\n  var padding = '';\n\n  write(dist);\n  write('_,------,');\n  write('\\n');\n\n  write(dist);\n  padding = self.tick ? '  ' : '   ';\n  write('_|' + padding + '/\\\\_/\\\\ ');\n  write('\\n');\n\n  write(dist);\n  padding = self.tick ? '_' : '__';\n  var tail = self.tick ? '~' : '^';\n  var face;\n  write(tail + '|' + padding + this.face() + ' ');\n  write('\\n');\n\n  write(dist);\n  padding = self.tick ? ' ' : '  ';\n  write(padding + '\"\"  \"\" ');\n  write('\\n');\n\n  this.cursorUp(this.numberOfLines);\n};\n\n/**\n * Draw nyan cat face.\n *\n * @return {String}\n * @api private\n */\n\nNyanCat.prototype.face = function() {\n  var stats = this.stats;\n  if (stats.failures) {\n    return '( x .x)';\n  } else if (stats.pending) {\n    return '( o .o)';\n  } else if(stats.passes) {\n    return '( ^ .^)';\n  } else {\n    return '( - .-)';\n  }\n};\n\n/**\n * Move cursor up `n`.\n *\n * @param {Number} n\n * @api private\n */\n\nNyanCat.prototype.cursorUp = function(n) {\n  write('\\u001b[' + n + 'A');\n};\n\n/**\n * Move cursor down `n`.\n *\n * @param {Number} n\n * @api private\n */\n\nNyanCat.prototype.cursorDown = function(n) {\n  write('\\u001b[' + n + 'B');\n};\n\n/**\n * Generate rainbow colors.\n *\n * @return {Array}\n * @api private\n */\n\nNyanCat.prototype.generateColors = function(){\n  var colors = [];\n\n  for (var i = 0; i < (6 * 7); i++) {\n    var pi3 = Math.floor(Math.PI / 3);\n    var n = (i * (1.0 / 6));\n    var r = Math.floor(3 * Math.sin(n) + 3);\n    var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3);\n    var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3);\n    colors.push(36 * r + 6 * g + b + 16);\n  }\n\n  return colors;\n};\n\n/**\n * Apply rainbow to the given `str`.\n *\n * @param {String} str\n * @return {String}\n * @api private\n */\n\nNyanCat.prototype.rainbowify = function(str){\n  if (!Base.useColors)\n    return str;\n  var color = this.rainbowColors[this.colorIndex % this.rainbowColors.length];\n  this.colorIndex += 1;\n  return '\\u001b[38;5;' + color + 'm' + str + '\\u001b[0m';\n};\n\n/**\n * Stdout helper.\n */\n\nfunction write(string) {\n  process.stdout.write(string);\n}\n\n/**\n * Inherit from `Base.prototype`.\n */\n\nfunction F(){};\nF.prototype = Base.prototype;\nNyanCat.prototype = new F;\nNyanCat.prototype.constructor = NyanCat;\n\n\n}); // module: reporters/nyan.js\n\nrequire.register(\"reporters/progress.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , cursor = Base.cursor\n  , color = Base.color;\n\n/**\n * Expose `Progress`.\n */\n\nexports = module.exports = Progress;\n\n/**\n * General progress bar color.\n */\n\nBase.colors.progress = 90;\n\n/**\n * Initialize a new `Progress` bar test reporter.\n *\n * @param {Runner} runner\n * @param {Object} options\n * @api public\n */\n\nfunction Progress(runner, options) {\n  Base.call(this, runner);\n\n  var self = this\n    , options = options || {}\n    , stats = this.stats\n    , width = Base.window.width * .50 | 0\n    , total = runner.total\n    , complete = 0\n    , max = Math.max\n    , lastN = -1;\n\n  // default chars\n  options.open = options.open || '[';\n  options.complete = options.complete || '▬';\n  options.incomplete = options.incomplete || Base.symbols.dot;\n  options.close = options.close || ']';\n  options.verbose = false;\n\n  // tests started\n  runner.on('start', function(){\n    console.log();\n    cursor.hide();\n  });\n\n  // tests complete\n  runner.on('test end', function(){\n    complete++;\n    var incomplete = total - complete\n      , percent = complete / total\n      , n = width * percent | 0\n      , i = width - n;\n\n    if (lastN === n && !options.verbose) {\n      // Don't re-render the line if it hasn't changed\n      return;\n    }\n    lastN = n;\n\n    cursor.CR();\n    process.stdout.write('\\u001b[J');\n    process.stdout.write(color('progress', '  ' + options.open));\n    process.stdout.write(Array(n).join(options.complete));\n    process.stdout.write(Array(i).join(options.incomplete));\n    process.stdout.write(color('progress', options.close));\n    if (options.verbose) {\n      process.stdout.write(color('progress', ' ' + complete + ' of ' + total));\n    }\n  });\n\n  // tests are complete, output some stats\n  // and the failures if any\n  runner.on('end', function(){\n    cursor.show();\n    console.log();\n    self.epilogue();\n  });\n}\n\n/**\n * Inherit from `Base.prototype`.\n */\n\nfunction F(){};\nF.prototype = Base.prototype;\nProgress.prototype = new F;\nProgress.prototype.constructor = Progress;\n\n\n}); // module: reporters/progress.js\n\nrequire.register(\"reporters/spec.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , cursor = Base.cursor\n  , color = Base.color;\n\n/**\n * Expose `Spec`.\n */\n\nexports = module.exports = Spec;\n\n/**\n * Initialize a new `Spec` test reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction Spec(runner) {\n  Base.call(this, runner);\n\n  var self = this\n    , stats = this.stats\n    , indents = 0\n    , n = 0;\n\n  function indent() {\n    return Array(indents).join('  ')\n  }\n\n  runner.on('start', function(){\n    console.log();\n  });\n\n  runner.on('suite', function(suite){\n    ++indents;\n    console.log(color('suite', '%s%s'), indent(), suite.title);\n  });\n\n  runner.on('suite end', function(suite){\n    --indents;\n    if (1 == indents) console.log();\n  });\n\n  runner.on('pending', function(test){\n    var fmt = indent() + color('pending', '  - %s');\n    console.log(fmt, test.title);\n  });\n\n  runner.on('pass', function(test){\n    if ('fast' == test.speed) {\n      var fmt = indent()\n        + color('checkmark', '  ' + Base.symbols.ok)\n        + color('pass', ' %s ');\n      cursor.CR();\n      console.log(fmt, test.title);\n    } else {\n      var fmt = indent()\n        + color('checkmark', '  ' + Base.symbols.ok)\n        + color('pass', ' %s ')\n        + color(test.speed, '(%dms)');\n      cursor.CR();\n      console.log(fmt, test.title, test.duration);\n    }\n  });\n\n  runner.on('fail', function(test, err){\n    cursor.CR();\n    console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);\n  });\n\n  runner.on('end', self.epilogue.bind(self));\n}\n\n/**\n * Inherit from `Base.prototype`.\n */\n\nfunction F(){};\nF.prototype = Base.prototype;\nSpec.prototype = new F;\nSpec.prototype.constructor = Spec;\n\n\n}); // module: reporters/spec.js\n\nrequire.register(\"reporters/tap.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , cursor = Base.cursor\n  , color = Base.color;\n\n/**\n * Expose `TAP`.\n */\n\nexports = module.exports = TAP;\n\n/**\n * Initialize a new `TAP` reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction TAP(runner) {\n  Base.call(this, runner);\n\n  var self = this\n    , stats = this.stats\n    , n = 1\n    , passes = 0\n    , failures = 0;\n\n  runner.on('start', function(){\n    var total = runner.grepTotal(runner.suite);\n    console.log('%d..%d', 1, total);\n  });\n\n  runner.on('test end', function(){\n    ++n;\n  });\n\n  runner.on('pending', function(test){\n    console.log('ok %d %s # SKIP -', n, title(test));\n  });\n\n  runner.on('pass', function(test){\n    passes++;\n    console.log('ok %d %s', n, title(test));\n  });\n\n  runner.on('fail', function(test, err){\n    failures++;\n    console.log('not ok %d %s', n, title(test));\n    if (err.stack) console.log(err.stack.replace(/^/gm, '  '));\n  });\n\n  runner.on('end', function(){\n    console.log('# tests ' + (passes + failures));\n    console.log('# pass ' + passes);\n    console.log('# fail ' + failures);\n  });\n}\n\n/**\n * Return a TAP-safe title of `test`\n *\n * @param {Object} test\n * @return {String}\n * @api private\n */\n\nfunction title(test) {\n  return test.fullTitle().replace(/#/g, '');\n}\n\n}); // module: reporters/tap.js\n\nrequire.register(\"reporters/xunit.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Base = require('./base')\n  , utils = require('../utils')\n  , fs = require('browser/fs')\n  , escape = utils.escape;\n\n/**\n * Save timer references to avoid Sinon interfering (see GH-237).\n */\n\nvar Date = global.Date\n  , setTimeout = global.setTimeout\n  , setInterval = global.setInterval\n  , clearTimeout = global.clearTimeout\n  , clearInterval = global.clearInterval;\n\n/**\n * Expose `XUnit`.\n */\n\nexports = module.exports = XUnit;\n\n/**\n * Initialize a new `XUnit` reporter.\n *\n * @param {Runner} runner\n * @api public\n */\n\nfunction XUnit(runner, options) {\n  Base.call(this, runner);\n  var stats = this.stats\n    , tests = []\n    , self = this;\n\n  if (options.reporterOptions && options.reporterOptions.output) {\n      if (! fs.createWriteStream) {\n          throw new Error('file output not supported in browser');\n      }\n      self.fileStream = fs.createWriteStream(options.reporterOptions.output);\n  }\n\n  runner.on('pending', function(test){\n    tests.push(test);\n  });\n\n  runner.on('pass', function(test){\n    tests.push(test);\n  });\n\n  runner.on('fail', function(test){\n    tests.push(test);\n  });\n\n  runner.on('end', function(){\n    self.write(tag('testsuite', {\n        name: 'Mocha Tests'\n      , tests: stats.tests\n      , failures: stats.failures\n      , errors: stats.failures\n      , skipped: stats.tests - stats.failures - stats.passes\n      , timestamp: (new Date).toUTCString()\n      , time: (stats.duration / 1000) || 0\n    }, false));\n\n    tests.forEach(function(t) { self.test(t); });\n    self.write('</testsuite>');\n  });\n}\n\n/**\n * Override done to close the stream (if it's a file).\n */\nXUnit.prototype.done = function(failures, fn) {\n    if (this.fileStream) {\n        this.fileStream.end(function() {\n            fn(failures);\n        });\n    } else {\n        fn(failures);\n    }\n};\n\n/**\n * Inherit from `Base.prototype`.\n */\n\nfunction F(){};\nF.prototype = Base.prototype;\nXUnit.prototype = new F;\nXUnit.prototype.constructor = XUnit;\n\n\n/**\n * Write out the given line\n */\nXUnit.prototype.write = function(line) {\n    if (this.fileStream) {\n        this.fileStream.write(line + '\\n');\n    } else {\n        console.log(line);\n    }\n};\n\n/**\n * Output tag for the given `test.`\n */\n\nXUnit.prototype.test = function(test, ostream) {\n  var attrs = {\n      classname: test.parent.fullTitle()\n    , name: test.title\n    , time: (test.duration / 1000) || 0\n  };\n\n  if ('failed' == test.state) {\n    var err = test.err;\n    this.write(tag('testcase', attrs, false, tag('failure', {}, false, cdata(escape(err.message) + \"\\n\" + err.stack))));\n  } else if (test.pending) {\n    this.write(tag('testcase', attrs, false, tag('skipped', {}, true)));\n  } else {\n    this.write(tag('testcase', attrs, true) );\n  }\n};\n\n/**\n * HTML tag helper.\n */\n\nfunction tag(name, attrs, close, content) {\n  var end = close ? '/>' : '>'\n    , pairs = []\n    , tag;\n\n  for (var key in attrs) {\n    pairs.push(key + '=\"' + escape(attrs[key]) + '\"');\n  }\n\n  tag = '<' + name + (pairs.length ? ' ' + pairs.join(' ') : '') + end;\n  if (content) tag += content + '</' + name + end;\n  return tag;\n}\n\n/**\n * Return cdata escaped CDATA `str`.\n */\n\nfunction cdata(str) {\n  return '<![CDATA[' + escape(str) + ']]>';\n}\n\n}); // module: reporters/xunit.js\n\nrequire.register(\"runnable.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar EventEmitter = require('browser/events').EventEmitter\n  , debug = require('browser/debug')('mocha:runnable')\n  , milliseconds = require('./ms')\n  , utils = require('./utils');\n\n/**\n * Save timer references to avoid Sinon interfering (see GH-237).\n */\n\nvar Date = global.Date\n  , setTimeout = global.setTimeout\n  , setInterval = global.setInterval\n  , clearTimeout = global.clearTimeout\n  , clearInterval = global.clearInterval;\n\n/**\n * Object#toString().\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Expose `Runnable`.\n */\n\nmodule.exports = Runnable;\n\n/**\n * Initialize a new `Runnable` with the given `title` and callback `fn`.\n *\n * @param {String} title\n * @param {Function} fn\n * @api private\n */\n\nfunction Runnable(title, fn) {\n  this.title = title;\n  this.fn = fn;\n  this.async = fn && fn.length;\n  this.sync = ! this.async;\n  this._timeout = 2000;\n  this._slow = 75;\n  this._enableTimeouts = true;\n  this.timedOut = false;\n  this._trace = new Error('done() called multiple times')\n}\n\n/**\n * Inherit from `EventEmitter.prototype`.\n */\n\nfunction F(){};\nF.prototype = EventEmitter.prototype;\nRunnable.prototype = new F;\nRunnable.prototype.constructor = Runnable;\n\n\n/**\n * Set & get timeout `ms`.\n *\n * @param {Number|String} ms\n * @return {Runnable|Number} ms or self\n * @api private\n */\n\nRunnable.prototype.timeout = function(ms){\n  if (0 == arguments.length) return this._timeout;\n  if (ms === 0) this._enableTimeouts = false;\n  if ('string' == typeof ms) ms = milliseconds(ms);\n  debug('timeout %d', ms);\n  this._timeout = ms;\n  if (this.timer) this.resetTimeout();\n  return this;\n};\n\n/**\n * Set & get slow `ms`.\n *\n * @param {Number|String} ms\n * @return {Runnable|Number} ms or self\n * @api private\n */\n\nRunnable.prototype.slow = function(ms){\n  if (0 === arguments.length) return this._slow;\n  if ('string' == typeof ms) ms = milliseconds(ms);\n  debug('timeout %d', ms);\n  this._slow = ms;\n  return this;\n};\n\n/**\n * Set and & get timeout `enabled`.\n *\n * @param {Boolean} enabled\n * @return {Runnable|Boolean} enabled or self\n * @api private\n */\n\nRunnable.prototype.enableTimeouts = function(enabled){\n  if (arguments.length === 0) return this._enableTimeouts;\n  debug('enableTimeouts %s', enabled);\n  this._enableTimeouts = enabled;\n  return this;\n};\n\n/**\n * Return the full title generated by recursively\n * concatenating the parent's full title.\n *\n * @return {String}\n * @api public\n */\n\nRunnable.prototype.fullTitle = function(){\n  return this.parent.fullTitle() + ' ' + this.title;\n};\n\n/**\n * Clear the timeout.\n *\n * @api private\n */\n\nRunnable.prototype.clearTimeout = function(){\n  clearTimeout(this.timer);\n};\n\n/**\n * Inspect the runnable void of private properties.\n *\n * @return {String}\n * @api private\n */\n\nRunnable.prototype.inspect = function(){\n  return JSON.stringify(this, function(key, val){\n    if ('_' == key[0]) return;\n    if ('parent' == key) return '#<Suite>';\n    if ('ctx' == key) return '#<Context>';\n    return val;\n  }, 2);\n};\n\n/**\n * Reset the timeout.\n *\n * @api private\n */\n\nRunnable.prototype.resetTimeout = function(){\n  var self = this;\n  var ms = this.timeout() || 1e9;\n\n  if (!this._enableTimeouts) return;\n  this.clearTimeout();\n  this.timer = setTimeout(function(){\n    if (!self._enableTimeouts) return;\n    self.callback(new Error('timeout of ' + ms + 'ms exceeded'));\n    self.timedOut = true;\n  }, ms);\n};\n\n/**\n * Whitelist these globals for this test run\n *\n * @api private\n */\nRunnable.prototype.globals = function(arr){\n  var self = this;\n  this._allowedGlobals = arr;\n};\n\n/**\n * Run the test and invoke `fn(err)`.\n *\n * @param {Function} fn\n * @api private\n */\n\nRunnable.prototype.run = function(fn){\n  var self = this\n    , start = new Date\n    , ctx = this.ctx\n    , finished\n    , emitted;\n\n  // Some times the ctx exists but it is not runnable\n  if (ctx && ctx.runnable) ctx.runnable(this);\n\n  // called multiple times\n  function multiple(err) {\n    if (emitted) return;\n    emitted = true;\n    self.emit('error', err || new Error('done() called multiple times; stacktrace may be inaccurate'));\n  }\n\n  // finished\n  function done(err) {\n    var ms = self.timeout();\n    if (self.timedOut) return;\n    if (finished) return multiple(err || self._trace);\n    self.clearTimeout();\n    self.duration = new Date - start;\n    finished = true;\n    if (!err && self.duration > ms && self._enableTimeouts) err = new Error('timeout of ' + ms + 'ms exceeded');\n    fn(err);\n  }\n\n  // for .resetTimeout()\n  this.callback = done;\n\n  // explicit async with `done` argument\n  if (this.async) {\n    this.resetTimeout();\n\n    try {\n      this.fn.call(ctx, function(err){\n        if (err instanceof Error || toString.call(err) === \"[object Error]\") return done(err);\n        if (null != err) {\n          if (Object.prototype.toString.call(err) === '[object Object]') {\n            return done(new Error('done() invoked with non-Error: ' + JSON.stringify(err)));\n          } else {\n            return done(new Error('done() invoked with non-Error: ' + err));\n          }\n        }\n        done();\n      });\n    } catch (err) {\n      done(utils.getError(err));\n    }\n    return;\n  }\n\n  if (this.asyncOnly) {\n    return done(new Error('--async-only option in use without declaring `done()`'));\n  }\n\n  // sync or promise-returning\n  try {\n    if (this.pending) {\n      done();\n    } else {\n      callFn(this.fn);\n    }\n  } catch (err) {\n    done(utils.getError(err));\n  }\n\n  function callFn(fn) {\n    var result = fn.call(ctx);\n    if (result && typeof result.then === 'function') {\n      self.resetTimeout();\n      result\n        .then(function() {\n          done()\n        },\n        function(reason) {\n          done(reason || new Error('Promise rejected with no or falsy reason'))\n        });\n    } else {\n      done();\n    }\n  }\n};\n\n}); // module: runnable.js\n\nrequire.register(\"runner.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar EventEmitter = require('browser/events').EventEmitter\n  , debug = require('browser/debug')('mocha:runner')\n  , Test = require('./test')\n  , utils = require('./utils')\n  , filter = utils.filter\n  , keys = utils.keys;\n\n/**\n * Non-enumerable globals.\n */\n\nvar globals = [\n  'setTimeout',\n  'clearTimeout',\n  'setInterval',\n  'clearInterval',\n  'XMLHttpRequest',\n  'Date',\n  'setImmediate',\n  'clearImmediate'\n];\n\n/**\n * Expose `Runner`.\n */\n\nmodule.exports = Runner;\n\n/**\n * Initialize a `Runner` for the given `suite`.\n *\n * Events:\n *\n *   - `start`  execution started\n *   - `end`  execution complete\n *   - `suite`  (suite) test suite execution started\n *   - `suite end`  (suite) all tests (and sub-suites) have finished\n *   - `test`  (test) test execution started\n *   - `test end`  (test) test completed\n *   - `hook`  (hook) hook execution started\n *   - `hook end`  (hook) hook complete\n *   - `pass`  (test) test passed\n *   - `fail`  (test, err) test failed\n *   - `pending`  (test) test pending\n *\n * @api public\n */\n\nfunction Runner(suite) {\n  var self = this;\n  this._globals = [];\n  this._abort = false;\n  this.suite = suite;\n  this.total = suite.total();\n  this.failures = 0;\n  this.on('test end', function(test){ self.checkGlobals(test); });\n  this.on('hook end', function(hook){ self.checkGlobals(hook); });\n  this.grep(/.*/);\n  this.globals(this.globalProps().concat(extraGlobals()));\n}\n\n/**\n * Wrapper for setImmediate, process.nextTick, or browser polyfill.\n *\n * @param {Function} fn\n * @api private\n */\n\nRunner.immediately = global.setImmediate || process.nextTick;\n\n/**\n * Inherit from `EventEmitter.prototype`.\n */\n\nfunction F(){};\nF.prototype = EventEmitter.prototype;\nRunner.prototype = new F;\nRunner.prototype.constructor = Runner;\n\n\n/**\n * Run tests with full titles matching `re`. Updates runner.total\n * with number of tests matched.\n *\n * @param {RegExp} re\n * @param {Boolean} invert\n * @return {Runner} for chaining\n * @api public\n */\n\nRunner.prototype.grep = function(re, invert){\n  debug('grep %s', re);\n  this._grep = re;\n  this._invert = invert;\n  this.total = this.grepTotal(this.suite);\n  return this;\n};\n\n/**\n * Returns the number of tests matching the grep search for the\n * given suite.\n *\n * @param {Suite} suite\n * @return {Number}\n * @api public\n */\n\nRunner.prototype.grepTotal = function(suite) {\n  var self = this;\n  var total = 0;\n\n  suite.eachTest(function(test){\n    var match = self._grep.test(test.fullTitle());\n    if (self._invert) match = !match;\n    if (match) total++;\n  });\n\n  return total;\n};\n\n/**\n * Return a list of global properties.\n *\n * @return {Array}\n * @api private\n */\n\nRunner.prototype.globalProps = function() {\n  var props = utils.keys(global);\n\n  // non-enumerables\n  for (var i = 0; i < globals.length; ++i) {\n    if (~utils.indexOf(props, globals[i])) continue;\n    props.push(globals[i]);\n  }\n\n  return props;\n};\n\n/**\n * Allow the given `arr` of globals.\n *\n * @param {Array} arr\n * @return {Runner} for chaining\n * @api public\n */\n\nRunner.prototype.globals = function(arr){\n  if (0 == arguments.length) return this._globals;\n  debug('globals %j', arr);\n  this._globals = this._globals.concat(arr);\n  return this;\n};\n\n/**\n * Check for global variable leaks.\n *\n * @api private\n */\n\nRunner.prototype.checkGlobals = function(test){\n  if (this.ignoreLeaks) return;\n  var ok = this._globals;\n\n  var globals = this.globalProps();\n  var leaks;\n\n  if (test) {\n    ok = ok.concat(test._allowedGlobals || []);\n  }\n\n  if(this.prevGlobalsLength == globals.length) return;\n  this.prevGlobalsLength = globals.length;\n\n  leaks = filterLeaks(ok, globals);\n  this._globals = this._globals.concat(leaks);\n\n  if (leaks.length > 1) {\n    this.fail(test, new Error('global leaks detected: ' + leaks.join(', ') + ''));\n  } else if (leaks.length) {\n    this.fail(test, new Error('global leak detected: ' + leaks[0]));\n  }\n};\n\n/**\n * Fail the given `test`.\n *\n * @param {Test} test\n * @param {Error} err\n * @api private\n */\n\nRunner.prototype.fail = function(test, err){\n  ++this.failures;\n  test.state = 'failed';\n\n  if ('string' == typeof err) {\n    err = new Error('the string \"' + err + '\" was thrown, throw an Error :)');\n  }\n\n  this.emit('fail', test, err);\n};\n\n/**\n * Fail the given `hook` with `err`.\n *\n * Hook failures work in the following pattern:\n * - If bail, then exit\n * - Failed `before` hook skips all tests in a suite and subsuites,\n *   but jumps to corresponding `after` hook\n * - Failed `before each` hook skips remaining tests in a\n *   suite and jumps to corresponding `after each` hook,\n *   which is run only once\n * - Failed `after` hook does not alter\n *   execution order\n * - Failed `after each` hook skips remaining tests in a\n *   suite and subsuites, but executes other `after each`\n *   hooks\n *\n * @param {Hook} hook\n * @param {Error} err\n * @api private\n */\n\nRunner.prototype.failHook = function(hook, err){\n  this.fail(hook, err);\n  if (this.suite.bail()) {\n    this.emit('end');\n  }\n};\n\n/**\n * Run hook `name` callbacks and then invoke `fn()`.\n *\n * @param {String} name\n * @param {Function} function\n * @api private\n */\n\nRunner.prototype.hook = function(name, fn){\n  var suite = this.suite\n    , hooks = suite['_' + name]\n    , self = this\n    , timer;\n\n  function next(i) {\n    var hook = hooks[i];\n    if (!hook) return fn();\n    self.currentRunnable = hook;\n\n    hook.ctx.currentTest = self.test;\n\n    self.emit('hook', hook);\n\n    hook.on('error', function(err){\n      self.failHook(hook, err);\n    });\n\n    hook.run(function(err){\n      hook.removeAllListeners('error');\n      var testError = hook.error();\n      if (testError) self.fail(self.test, testError);\n      if (err) {\n        self.failHook(hook, err);\n\n        // stop executing hooks, notify callee of hook err\n        return fn(err);\n      }\n      self.emit('hook end', hook);\n      delete hook.ctx.currentTest;\n      next(++i);\n    });\n  }\n\n  Runner.immediately(function(){\n    next(0);\n  });\n};\n\n/**\n * Run hook `name` for the given array of `suites`\n * in order, and callback `fn(err, errSuite)`.\n *\n * @param {String} name\n * @param {Array} suites\n * @param {Function} fn\n * @api private\n */\n\nRunner.prototype.hooks = function(name, suites, fn){\n  var self = this\n    , orig = this.suite;\n\n  function next(suite) {\n    self.suite = suite;\n\n    if (!suite) {\n      self.suite = orig;\n      return fn();\n    }\n\n    self.hook(name, function(err){\n      if (err) {\n        var errSuite = self.suite;\n        self.suite = orig;\n        return fn(err, errSuite);\n      }\n\n      next(suites.pop());\n    });\n  }\n\n  next(suites.pop());\n};\n\n/**\n * Run hooks from the top level down.\n *\n * @param {String} name\n * @param {Function} fn\n * @api private\n */\n\nRunner.prototype.hookUp = function(name, fn){\n  var suites = [this.suite].concat(this.parents()).reverse();\n  this.hooks(name, suites, fn);\n};\n\n/**\n * Run hooks from the bottom up.\n *\n * @param {String} name\n * @param {Function} fn\n * @api private\n */\n\nRunner.prototype.hookDown = function(name, fn){\n  var suites = [this.suite].concat(this.parents());\n  this.hooks(name, suites, fn);\n};\n\n/**\n * Return an array of parent Suites from\n * closest to furthest.\n *\n * @return {Array}\n * @api private\n */\n\nRunner.prototype.parents = function(){\n  var suite = this.suite\n    , suites = [];\n  while (suite = suite.parent) suites.push(suite);\n  return suites;\n};\n\n/**\n * Run the current test and callback `fn(err)`.\n *\n * @param {Function} fn\n * @api private\n */\n\nRunner.prototype.runTest = function(fn){\n  var test = this.test\n    , self = this;\n\n  if (this.asyncOnly) test.asyncOnly = true;\n\n  try {\n    test.on('error', function(err){\n      self.fail(test, err);\n    });\n    test.run(fn);\n  } catch (err) {\n    fn(err);\n  }\n};\n\n/**\n * Run tests in the given `suite` and invoke\n * the callback `fn()` when complete.\n *\n * @param {Suite} suite\n * @param {Function} fn\n * @api private\n */\n\nRunner.prototype.runTests = function(suite, fn){\n  var self = this\n    , tests = suite.tests.slice()\n    , test;\n\n\n  function hookErr(err, errSuite, after) {\n    // before/after Each hook for errSuite failed:\n    var orig = self.suite;\n\n    // for failed 'after each' hook start from errSuite parent,\n    // otherwise start from errSuite itself\n    self.suite = after ? errSuite.parent : errSuite;\n\n    if (self.suite) {\n      // call hookUp afterEach\n      self.hookUp('afterEach', function(err2, errSuite2) {\n        self.suite = orig;\n        // some hooks may fail even now\n        if (err2) return hookErr(err2, errSuite2, true);\n        // report error suite\n        fn(errSuite);\n      });\n    } else {\n      // there is no need calling other 'after each' hooks\n      self.suite = orig;\n      fn(errSuite);\n    }\n  }\n\n  function next(err, errSuite) {\n    // if we bail after first err\n    if (self.failures && suite._bail) return fn();\n\n    if (self._abort) return fn();\n\n    if (err) return hookErr(err, errSuite, true);\n\n    // next test\n    test = tests.shift();\n\n    // all done\n    if (!test) return fn();\n\n    // grep\n    var match = self._grep.test(test.fullTitle());\n    if (self._invert) match = !match;\n    if (!match) return next();\n\n    // pending\n    if (test.pending) {\n      self.emit('pending', test);\n      self.emit('test end', test);\n      return next();\n    }\n\n    // execute test and hook(s)\n    self.emit('test', self.test = test);\n    self.hookDown('beforeEach', function(err, errSuite){\n\n      if (err) return hookErr(err, errSuite, false);\n\n      self.currentRunnable = self.test;\n      self.runTest(function(err){\n        test = self.test;\n\n        if (err) {\n          self.fail(test, err);\n          self.emit('test end', test);\n          return self.hookUp('afterEach', next);\n        }\n\n        test.state = 'passed';\n        self.emit('pass', test);\n        self.emit('test end', test);\n        self.hookUp('afterEach', next);\n      });\n    });\n  }\n\n  this.next = next;\n  next();\n};\n\n/**\n * Run the given `suite` and invoke the\n * callback `fn()` when complete.\n *\n * @param {Suite} suite\n * @param {Function} fn\n * @api private\n */\n\nRunner.prototype.runSuite = function(suite, fn){\n  var total = this.grepTotal(suite)\n    , self = this\n    , i = 0;\n\n  debug('run suite %s', suite.fullTitle());\n\n  if (!total) return fn();\n\n  this.emit('suite', this.suite = suite);\n\n  function next(errSuite) {\n    if (errSuite) {\n      // current suite failed on a hook from errSuite\n      if (errSuite == suite) {\n        // if errSuite is current suite\n        // continue to the next sibling suite\n        return done();\n      } else {\n        // errSuite is among the parents of current suite\n        // stop execution of errSuite and all sub-suites\n        return done(errSuite);\n      }\n    }\n\n    if (self._abort) return done();\n\n    var curr = suite.suites[i++];\n    if (!curr) return done();\n    self.runSuite(curr, next);\n  }\n\n  function done(errSuite) {\n    self.suite = suite;\n    self.hook('afterAll', function(){\n      self.emit('suite end', suite);\n      fn(errSuite);\n    });\n  }\n\n  this.hook('beforeAll', function(err){\n    if (err) return done();\n    self.runTests(suite, next);\n  });\n};\n\n/**\n * Handle uncaught exceptions.\n *\n * @param {Error} err\n * @api private\n */\n\nRunner.prototype.uncaught = function(err){\n  if (err) {\n    debug('uncaught exception %s', err !== function () {\n      return this;\n    }.call(err) ? err : ( err.message || err ));\n  } else {\n    debug('uncaught undefined exception');\n    err = utils.undefinedError();\n  }\n  err.uncaught = true;\n\n  var runnable = this.currentRunnable;\n  if (!runnable) return;\n\n  var wasAlreadyDone = runnable.state;\n  this.fail(runnable, err);\n\n  runnable.clearTimeout();\n\n  if (wasAlreadyDone) return;\n\n  // recover from test\n  if ('test' == runnable.type) {\n    this.emit('test end', runnable);\n    this.hookUp('afterEach', this.next);\n    return;\n  }\n\n  // bail on hooks\n  this.emit('end');\n};\n\n/**\n * Run the root suite and invoke `fn(failures)`\n * on completion.\n *\n * @param {Function} fn\n * @return {Runner} for chaining\n * @api public\n */\n\nRunner.prototype.run = function(fn){\n  var self = this\n    , fn = fn || function(){};\n\n  function uncaught(err){\n    self.uncaught(err);\n  }\n\n  debug('start');\n\n  // callback\n  this.on('end', function(){\n    debug('end');\n    process.removeListener('uncaughtException', uncaught);\n    fn(self.failures);\n  });\n\n  // run suites\n  this.emit('start');\n  this.runSuite(this.suite, function(){\n    debug('finished running');\n    self.emit('end');\n  });\n\n  // uncaught exception\n  process.on('uncaughtException', uncaught);\n\n  return this;\n};\n\n/**\n * Cleanly abort execution\n *\n * @return {Runner} for chaining\n * @api public\n */\nRunner.prototype.abort = function(){\n  debug('aborting');\n  this._abort = true;\n};\n\n/**\n * Filter leaks with the given globals flagged as `ok`.\n *\n * @param {Array} ok\n * @param {Array} globals\n * @return {Array}\n * @api private\n */\n\nfunction filterLeaks(ok, globals) {\n  return filter(globals, function(key){\n    // Firefox and Chrome exposes iframes as index inside the window object\n    if (/^d+/.test(key)) return false;\n\n    // in firefox\n    // if runner runs in an iframe, this iframe's window.getInterface method not init at first\n    // it is assigned in some seconds\n    if (global.navigator && /^getInterface/.test(key)) return false;\n\n    // an iframe could be approached by window[iframeIndex]\n    // in ie6,7,8 and opera, iframeIndex is enumerable, this could cause leak\n    if (global.navigator && /^\\d+/.test(key)) return false;\n\n    // Opera and IE expose global variables for HTML element IDs (issue #243)\n    if (/^mocha-/.test(key)) return false;\n\n    var matched = filter(ok, function(ok){\n      if (~ok.indexOf('*')) return 0 == key.indexOf(ok.split('*')[0]);\n      return key == ok;\n    });\n    return matched.length == 0 && (!global.navigator || 'onerror' !== key);\n  });\n}\n\n/**\n * Array of globals dependent on the environment.\n *\n * @return {Array}\n * @api private\n */\n\n function extraGlobals() {\n  if (typeof(process) === 'object' &&\n      typeof(process.version) === 'string') {\n\n    var nodeVersion = process.version.split('.').reduce(function(a, v) {\n      return a << 8 | v;\n    });\n\n    // 'errno' was renamed to process._errno in v0.9.11.\n\n    if (nodeVersion < 0x00090B) {\n      return ['errno'];\n    }\n  }\n\n  return [];\n }\n\n}); // module: runner.js\n\nrequire.register(\"suite.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar EventEmitter = require('browser/events').EventEmitter\n  , debug = require('browser/debug')('mocha:suite')\n  , milliseconds = require('./ms')\n  , utils = require('./utils')\n  , Hook = require('./hook');\n\n/**\n * Expose `Suite`.\n */\n\nexports = module.exports = Suite;\n\n/**\n * Create a new `Suite` with the given `title`\n * and parent `Suite`. When a suite with the\n * same title is already present, that suite\n * is returned to provide nicer reporter\n * and more flexible meta-testing.\n *\n * @param {Suite} parent\n * @param {String} title\n * @return {Suite}\n * @api public\n */\n\nexports.create = function(parent, title){\n  var suite = new Suite(title, parent.ctx);\n  suite.parent = parent;\n  if (parent.pending) suite.pending = true;\n  title = suite.fullTitle();\n  parent.addSuite(suite);\n  return suite;\n};\n\n/**\n * Initialize a new `Suite` with the given\n * `title` and `ctx`.\n *\n * @param {String} title\n * @param {Context} ctx\n * @api private\n */\n\nfunction Suite(title, parentContext) {\n  this.title = title;\n  var context = function() {};\n  context.prototype = parentContext;\n  this.ctx = new context();\n  this.suites = [];\n  this.tests = [];\n  this.pending = false;\n  this._beforeEach = [];\n  this._beforeAll = [];\n  this._afterEach = [];\n  this._afterAll = [];\n  this.root = !title;\n  this._timeout = 2000;\n  this._enableTimeouts = true;\n  this._slow = 75;\n  this._bail = false;\n}\n\n/**\n * Inherit from `EventEmitter.prototype`.\n */\n\nfunction F(){};\nF.prototype = EventEmitter.prototype;\nSuite.prototype = new F;\nSuite.prototype.constructor = Suite;\n\n\n/**\n * Return a clone of this `Suite`.\n *\n * @return {Suite}\n * @api private\n */\n\nSuite.prototype.clone = function(){\n  var suite = new Suite(this.title);\n  debug('clone');\n  suite.ctx = this.ctx;\n  suite.timeout(this.timeout());\n  suite.enableTimeouts(this.enableTimeouts());\n  suite.slow(this.slow());\n  suite.bail(this.bail());\n  return suite;\n};\n\n/**\n * Set timeout `ms` or short-hand such as \"2s\".\n *\n * @param {Number|String} ms\n * @return {Suite|Number} for chaining\n * @api private\n */\n\nSuite.prototype.timeout = function(ms){\n  if (0 == arguments.length) return this._timeout;\n  if (ms.toString() === '0') this._enableTimeouts = false;\n  if ('string' == typeof ms) ms = milliseconds(ms);\n  debug('timeout %d', ms);\n  this._timeout = parseInt(ms, 10);\n  return this;\n};\n\n/**\n  * Set timeout `enabled`.\n  *\n  * @param {Boolean} enabled\n  * @return {Suite|Boolean} self or enabled\n  * @api private\n  */\n\nSuite.prototype.enableTimeouts = function(enabled){\n  if (arguments.length === 0) return this._enableTimeouts;\n  debug('enableTimeouts %s', enabled);\n  this._enableTimeouts = enabled;\n  return this;\n};\n\n/**\n * Set slow `ms` or short-hand such as \"2s\".\n *\n * @param {Number|String} ms\n * @return {Suite|Number} for chaining\n * @api private\n */\n\nSuite.prototype.slow = function(ms){\n  if (0 === arguments.length) return this._slow;\n  if ('string' == typeof ms) ms = milliseconds(ms);\n  debug('slow %d', ms);\n  this._slow = ms;\n  return this;\n};\n\n/**\n * Sets whether to bail after first error.\n *\n * @param {Boolean} bail\n * @return {Suite|Number} for chaining\n * @api private\n */\n\nSuite.prototype.bail = function(bail){\n  if (0 == arguments.length) return this._bail;\n  debug('bail %s', bail);\n  this._bail = bail;\n  return this;\n};\n\n/**\n * Run `fn(test[, done])` before running tests.\n *\n * @param {Function} fn\n * @return {Suite} for chaining\n * @api private\n */\n\nSuite.prototype.beforeAll = function(title, fn){\n  if (this.pending) return this;\n  if ('function' === typeof title) {\n    fn = title;\n    title = fn.name;\n  }\n  title = '\"before all\" hook' + (title ? ': ' + title : '');\n\n  var hook = new Hook(title, fn);\n  hook.parent = this;\n  hook.timeout(this.timeout());\n  hook.enableTimeouts(this.enableTimeouts());\n  hook.slow(this.slow());\n  hook.ctx = this.ctx;\n  this._beforeAll.push(hook);\n  this.emit('beforeAll', hook);\n  return this;\n};\n\n/**\n * Run `fn(test[, done])` after running tests.\n *\n * @param {Function} fn\n * @return {Suite} for chaining\n * @api private\n */\n\nSuite.prototype.afterAll = function(title, fn){\n  if (this.pending) return this;\n  if ('function' === typeof title) {\n    fn = title;\n    title = fn.name;\n  }\n  title = '\"after all\" hook' + (title ? ': ' + title : '');\n\n  var hook = new Hook(title, fn);\n  hook.parent = this;\n  hook.timeout(this.timeout());\n  hook.enableTimeouts(this.enableTimeouts());\n  hook.slow(this.slow());\n  hook.ctx = this.ctx;\n  this._afterAll.push(hook);\n  this.emit('afterAll', hook);\n  return this;\n};\n\n/**\n * Run `fn(test[, done])` before each test case.\n *\n * @param {Function} fn\n * @return {Suite} for chaining\n * @api private\n */\n\nSuite.prototype.beforeEach = function(title, fn){\n  if (this.pending) return this;\n  if ('function' === typeof title) {\n    fn = title;\n    title = fn.name;\n  }\n  title = '\"before each\" hook' + (title ? ': ' + title : '');\n\n  var hook = new Hook(title, fn);\n  hook.parent = this;\n  hook.timeout(this.timeout());\n  hook.enableTimeouts(this.enableTimeouts());\n  hook.slow(this.slow());\n  hook.ctx = this.ctx;\n  this._beforeEach.push(hook);\n  this.emit('beforeEach', hook);\n  return this;\n};\n\n/**\n * Run `fn(test[, done])` after each test case.\n *\n * @param {Function} fn\n * @return {Suite} for chaining\n * @api private\n */\n\nSuite.prototype.afterEach = function(title, fn){\n  if (this.pending) return this;\n  if ('function' === typeof title) {\n    fn = title;\n    title = fn.name;\n  }\n  title = '\"after each\" hook' + (title ? ': ' + title : '');\n\n  var hook = new Hook(title, fn);\n  hook.parent = this;\n  hook.timeout(this.timeout());\n  hook.enableTimeouts(this.enableTimeouts());\n  hook.slow(this.slow());\n  hook.ctx = this.ctx;\n  this._afterEach.push(hook);\n  this.emit('afterEach', hook);\n  return this;\n};\n\n/**\n * Add a test `suite`.\n *\n * @param {Suite} suite\n * @return {Suite} for chaining\n * @api private\n */\n\nSuite.prototype.addSuite = function(suite){\n  suite.parent = this;\n  suite.timeout(this.timeout());\n  suite.enableTimeouts(this.enableTimeouts());\n  suite.slow(this.slow());\n  suite.bail(this.bail());\n  this.suites.push(suite);\n  this.emit('suite', suite);\n  return this;\n};\n\n/**\n * Add a `test` to this suite.\n *\n * @param {Test} test\n * @return {Suite} for chaining\n * @api private\n */\n\nSuite.prototype.addTest = function(test){\n  test.parent = this;\n  test.timeout(this.timeout());\n  test.enableTimeouts(this.enableTimeouts());\n  test.slow(this.slow());\n  test.ctx = this.ctx;\n  this.tests.push(test);\n  this.emit('test', test);\n  return this;\n};\n\n/**\n * Return the full title generated by recursively\n * concatenating the parent's full title.\n *\n * @return {String}\n * @api public\n */\n\nSuite.prototype.fullTitle = function(){\n  if (this.parent) {\n    var full = this.parent.fullTitle();\n    if (full) return full + ' ' + this.title;\n  }\n  return this.title;\n};\n\n/**\n * Return the total number of tests.\n *\n * @return {Number}\n * @api public\n */\n\nSuite.prototype.total = function(){\n  return utils.reduce(this.suites, function(sum, suite){\n    return sum + suite.total();\n  }, 0) + this.tests.length;\n};\n\n/**\n * Iterates through each suite recursively to find\n * all tests. Applies a function in the format\n * `fn(test)`.\n *\n * @param {Function} fn\n * @return {Suite}\n * @api private\n */\n\nSuite.prototype.eachTest = function(fn){\n  utils.forEach(this.tests, fn);\n  utils.forEach(this.suites, function(suite){\n    suite.eachTest(fn);\n  });\n  return this;\n};\n\n}); // module: suite.js\n\nrequire.register(\"test.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar Runnable = require('./runnable');\n\n/**\n * Expose `Test`.\n */\n\nmodule.exports = Test;\n\n/**\n * Initialize a new `Test` with the given `title` and callback `fn`.\n *\n * @param {String} title\n * @param {Function} fn\n * @api private\n */\n\nfunction Test(title, fn) {\n  Runnable.call(this, title, fn);\n  this.pending = !fn;\n  this.type = 'test';\n}\n\n/**\n * Inherit from `Runnable.prototype`.\n */\n\nfunction F(){};\nF.prototype = Runnable.prototype;\nTest.prototype = new F;\nTest.prototype.constructor = Test;\n\n\n}); // module: test.js\n\nrequire.register(\"utils.js\", function(module, exports, require){\n/**\n * Module dependencies.\n */\n\nvar fs = require('browser/fs')\n  , path = require('browser/path')\n  , basename = path.basename\n  , exists = fs.existsSync || path.existsSync\n  , glob = require('browser/glob')\n  , join = path.join\n  , debug = require('browser/debug')('mocha:watch');\n\n/**\n * Ignored directories.\n */\n\nvar ignore = ['node_modules', '.git'];\n\n/**\n * Escape special characters in the given string of html.\n *\n * @param  {String} html\n * @return {String}\n * @api private\n */\n\nexports.escape = function(html){\n  return String(html)\n    .replace(/&/g, '&amp;')\n    .replace(/\"/g, '&quot;')\n    .replace(/</g, '&lt;')\n    .replace(/>/g, '&gt;');\n};\n\n/**\n * Array#forEach (<=IE8)\n *\n * @param {Array} array\n * @param {Function} fn\n * @param {Object} scope\n * @api private\n */\n\nexports.forEach = function(arr, fn, scope){\n  for (var i = 0, l = arr.length; i < l; i++)\n    fn.call(scope, arr[i], i);\n};\n\n/**\n * Array#map (<=IE8)\n *\n * @param {Array} array\n * @param {Function} fn\n * @param {Object} scope\n * @api private\n */\n\nexports.map = function(arr, fn, scope){\n  var result = [];\n  for (var i = 0, l = arr.length; i < l; i++)\n    result.push(fn.call(scope, arr[i], i));\n  return result;\n};\n\n/**\n * Array#indexOf (<=IE8)\n *\n * @parma {Array} arr\n * @param {Object} obj to find index of\n * @param {Number} start\n * @api private\n */\n\nexports.indexOf = function(arr, obj, start){\n  for (var i = start || 0, l = arr.length; i < l; i++) {\n    if (arr[i] === obj)\n      return i;\n  }\n  return -1;\n};\n\n/**\n * Array#reduce (<=IE8)\n *\n * @param {Array} array\n * @param {Function} fn\n * @param {Object} initial value\n * @api private\n */\n\nexports.reduce = function(arr, fn, val){\n  var rval = val;\n\n  for (var i = 0, l = arr.length; i < l; i++) {\n    rval = fn(rval, arr[i], i, arr);\n  }\n\n  return rval;\n};\n\n/**\n * Array#filter (<=IE8)\n *\n * @param {Array} array\n * @param {Function} fn\n * @api private\n */\n\nexports.filter = function(arr, fn){\n  var ret = [];\n\n  for (var i = 0, l = arr.length; i < l; i++) {\n    var val = arr[i];\n    if (fn(val, i, arr)) ret.push(val);\n  }\n\n  return ret;\n};\n\n/**\n * Object.keys (<=IE8)\n *\n * @param {Object} obj\n * @return {Array} keys\n * @api private\n */\n\nexports.keys = Object.keys || function(obj) {\n  var keys = []\n    , has = Object.prototype.hasOwnProperty // for `window` on <=IE8\n\n  for (var key in obj) {\n    if (has.call(obj, key)) {\n      keys.push(key);\n    }\n  }\n\n  return keys;\n};\n\n/**\n * Watch the given `files` for changes\n * and invoke `fn(file)` on modification.\n *\n * @param {Array} files\n * @param {Function} fn\n * @api private\n */\n\nexports.watch = function(files, fn){\n  var options = { interval: 100 };\n  files.forEach(function(file){\n    debug('file %s', file);\n    fs.watchFile(file, options, function(curr, prev){\n      if (prev.mtime < curr.mtime) fn(file);\n    });\n  });\n};\n\n/**\n * Ignored files.\n */\n\nfunction ignored(path){\n  return !~ignore.indexOf(path);\n}\n\n/**\n * Lookup files in the given `dir`.\n *\n * @return {Array}\n * @api private\n */\n\nexports.files = function(dir, ext, ret){\n  ret = ret || [];\n  ext = ext || ['js'];\n\n  var re = new RegExp('\\\\.(' + ext.join('|') + ')$');\n\n  fs.readdirSync(dir)\n  .filter(ignored)\n  .forEach(function(path){\n    path = join(dir, path);\n    if (fs.statSync(path).isDirectory()) {\n      exports.files(path, ext, ret);\n    } else if (path.match(re)) {\n      ret.push(path);\n    }\n  });\n\n  return ret;\n};\n\n/**\n * Compute a slug from the given `str`.\n *\n * @param {String} str\n * @return {String}\n * @api private\n */\n\nexports.slug = function(str){\n  return str\n    .toLowerCase()\n    .replace(/ +/g, '-')\n    .replace(/[^-\\w]/g, '');\n};\n\n/**\n * Strip the function definition from `str`,\n * and re-indent for pre whitespace.\n */\n\nexports.clean = function(str) {\n  str = str\n    .replace(/\\r\\n?|[\\n\\u2028\\u2029]/g, \"\\n\").replace(/^\\uFEFF/, '')\n    .replace(/^function *\\(.*\\) *{|\\(.*\\) *=> *{?/, '')\n    .replace(/\\s+\\}$/, '');\n\n  var spaces = str.match(/^\\n?( *)/)[1].length\n    , tabs = str.match(/^\\n?(\\t*)/)[1].length\n    , re = new RegExp('^\\n?' + (tabs ? '\\t' : ' ') + '{' + (tabs ? tabs : spaces) + '}', 'gm');\n\n  str = str.replace(re, '');\n\n  return exports.trim(str);\n};\n\n/**\n * Trim the given `str`.\n *\n * @param {String} str\n * @return {String}\n * @api private\n */\n\nexports.trim = function(str){\n  return str.replace(/^\\s+|\\s+$/g, '');\n};\n\n/**\n * Parse the given `qs`.\n *\n * @param {String} qs\n * @return {Object}\n * @api private\n */\n\nexports.parseQuery = function(qs){\n  return exports.reduce(qs.replace('?', '').split('&'), function(obj, pair){\n    var i = pair.indexOf('=')\n      , key = pair.slice(0, i)\n      , val = pair.slice(++i);\n\n    obj[key] = decodeURIComponent(val);\n    return obj;\n  }, {});\n};\n\n/**\n * Highlight the given string of `js`.\n *\n * @param {String} js\n * @return {String}\n * @api private\n */\n\nfunction highlight(js) {\n  return js\n    .replace(/</g, '&lt;')\n    .replace(/>/g, '&gt;')\n    .replace(/\\/\\/(.*)/gm, '<span class=\"comment\">//$1</span>')\n    .replace(/('.*?')/gm, '<span class=\"string\">$1</span>')\n    .replace(/(\\d+\\.\\d+)/gm, '<span class=\"number\">$1</span>')\n    .replace(/(\\d+)/gm, '<span class=\"number\">$1</span>')\n    .replace(/\\bnew[ \\t]+(\\w+)/gm, '<span class=\"keyword\">new</span> <span class=\"init\">$1</span>')\n    .replace(/\\b(function|new|throw|return|var|if|else)\\b/gm, '<span class=\"keyword\">$1</span>')\n}\n\n/**\n * Highlight the contents of tag `name`.\n *\n * @param {String} name\n * @api private\n */\n\nexports.highlightTags = function(name) {\n  var code = document.getElementById('mocha').getElementsByTagName(name);\n  for (var i = 0, len = code.length; i < len; ++i) {\n    code[i].innerHTML = highlight(code[i].innerHTML);\n  }\n};\n\n/**\n * If a value could have properties, and has none, this function is called, which returns\n * a string representation of the empty value.\n *\n * Functions w/ no properties return `'[Function]'`\n * Arrays w/ length === 0 return `'[]'`\n * Objects w/ no properties return `'{}'`\n * All else: return result of `value.toString()`\n *\n * @param {*} value Value to inspect\n * @param {string} [type] The type of the value, if known.\n * @returns {string}\n */\nvar emptyRepresentation = function emptyRepresentation(value, type) {\n  type = type || exports.type(value);\n\n  switch(type) {\n    case 'function':\n      return '[Function]';\n    case 'object':\n      return '{}';\n    case 'array':\n      return '[]';\n    default:\n      return value.toString();\n  }\n};\n\n/**\n * Takes some variable and asks `{}.toString()` what it thinks it is.\n * @param {*} value Anything\n * @example\n * type({}) // 'object'\n * type([]) // 'array'\n * type(1) // 'number'\n * type(false) // 'boolean'\n * type(Infinity) // 'number'\n * type(null) // 'null'\n * type(new Date()) // 'date'\n * type(/foo/) // 'regexp'\n * type('type') // 'string'\n * type(global) // 'global'\n * @api private\n * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString\n * @returns {string}\n */\nexports.type = function type(value) {\n  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {\n    return 'buffer';\n  }\n  return Object.prototype.toString.call(value)\n    .replace(/^\\[.+\\s(.+?)\\]$/, '$1')\n    .toLowerCase();\n};\n\n/**\n * @summary Stringify `value`.\n * @description Different behavior depending on type of value.\n * - If `value` is undefined or null, return `'[undefined]'` or `'[null]'`, respectively.\n * - If `value` is not an object, function or array, return result of `value.toString()` wrapped in double-quotes.\n * - If `value` is an *empty* object, function, or array, return result of function\n *   {@link emptyRepresentation}.\n * - If `value` has properties, call {@link exports.canonicalize} on it, then return result of\n *   JSON.stringify().\n *\n * @see exports.type\n * @param {*} value\n * @return {string}\n * @api private\n */\n\nexports.stringify = function(value) {\n  var prop,\n    type = exports.type(value);\n\n  if (type === 'null' || type === 'undefined') {\n    return '[' + type + ']';\n  }\n\n  if (type === 'date') {\n    return '[Date: ' + value.toISOString() + ']';\n  }\n\n  if (!~exports.indexOf(['object', 'array', 'function'], type)) {\n    return value.toString();\n  }\n\n  for (prop in value) {\n    if (value.hasOwnProperty(prop)) {\n      return JSON.stringify(exports.canonicalize(value), null, 2).replace(/,(\\n|$)/g, '$1');\n    }\n  }\n\n  return emptyRepresentation(value, type);\n};\n\n/**\n * Return if obj is a Buffer\n * @param {Object} arg\n * @return {Boolean}\n * @api private\n */\nexports.isBuffer = function (arg) {\n  return typeof Buffer !== 'undefined' && Buffer.isBuffer(arg);\n};\n\n/**\n * @summary Return a new Thing that has the keys in sorted order.  Recursive.\n * @description If the Thing...\n * - has already been seen, return string `'[Circular]'`\n * - is `undefined`, return string `'[undefined]'`\n * - is `null`, return value `null`\n * - is some other primitive, return the value\n * - is not a primitive or an `Array`, `Object`, or `Function`, return the value of the Thing's `toString()` method\n * - is a non-empty `Array`, `Object`, or `Function`, return the result of calling this function again.\n * - is an empty `Array`, `Object`, or `Function`, return the result of calling `emptyRepresentation()`\n *\n * @param {*} value Thing to inspect.  May or may not have properties.\n * @param {Array} [stack=[]] Stack of seen values\n * @return {(Object|Array|Function|string|undefined)}\n * @see {@link exports.stringify}\n * @api private\n */\n\nexports.canonicalize = function(value, stack) {\n  var canonicalizedObj,\n    type = exports.type(value),\n    prop,\n    withStack = function withStack(value, fn) {\n      stack.push(value);\n      fn();\n      stack.pop();\n    };\n\n  stack = stack || [];\n\n  if (exports.indexOf(stack, value) !== -1) {\n    return '[Circular]';\n  }\n\n  switch(type) {\n    case 'undefined':\n      canonicalizedObj = '[undefined]';\n      break;\n    case 'buffer':\n    case 'null':\n      canonicalizedObj = value;\n      break;\n    case 'array':\n      withStack(value, function () {\n        canonicalizedObj = exports.map(value, function (item) {\n          return exports.canonicalize(item, stack);\n        });\n      });\n      break;\n    case 'date':\n      canonicalizedObj = '[Date: ' + value.toISOString() + ']';\n      break;\n    case 'function':\n      for (prop in value) {\n        canonicalizedObj = {};\n        break;\n      }\n      if (!canonicalizedObj) {\n        canonicalizedObj = emptyRepresentation(value, type);\n        break;\n      }\n    /* falls through */\n    case 'object':\n      canonicalizedObj = canonicalizedObj || {};\n      withStack(value, function () {\n        exports.forEach(exports.keys(value).sort(), function (key) {\n          canonicalizedObj[key] = exports.canonicalize(value[key], stack);\n        });\n      });\n      break;\n    case 'number':\n    case 'boolean':\n      canonicalizedObj = value;\n      break;\n    default:\n      canonicalizedObj = value.toString();\n  }\n\n  return canonicalizedObj;\n};\n\n/**\n * Lookup file names at the given `path`.\n */\nexports.lookupFiles = function lookupFiles(path, extensions, recursive) {\n  var files = [];\n  var re = new RegExp('\\\\.(' + extensions.join('|') + ')$');\n\n  if (!exists(path)) {\n    if (exists(path + '.js')) {\n      path += '.js';\n    } else {\n      files = glob.sync(path);\n      if (!files.length) throw new Error(\"cannot resolve path (or pattern) '\" + path + \"'\");\n      return files;\n    }\n  }\n\n  try {\n    var stat = fs.statSync(path);\n    if (stat.isFile()) return path;\n  }\n  catch (ignored) {\n    return;\n  }\n\n  fs.readdirSync(path).forEach(function(file){\n    file = join(path, file);\n    try {\n      var stat = fs.statSync(file);\n      if (stat.isDirectory()) {\n        if (recursive) {\n          files = files.concat(lookupFiles(file, extensions, recursive));\n        }\n        return;\n      }\n    }\n    catch (ignored) {\n      return;\n    }\n    if (!stat.isFile() || !re.test(file) || basename(file)[0] === '.') return;\n    files.push(file);\n  });\n\n  return files;\n};\n\n/**\n * Generate an undefined error with a message warning the user.\n *\n * @return {Error}\n */\n\nexports.undefinedError = function(){\n  return new Error('Caught undefined error, did you throw without specifying what?');\n};\n\n/**\n * Generate an undefined error if `err` is not defined.\n *\n * @param {Error} err\n * @return {Error}\n */\n\nexports.getError = function(err){\n  return err || exports.undefinedError();\n};\n\n\n}); // module: utils.js\n// The global object is \"self\" in Web Workers.\nvar global = (function() { return this; })();\n\n/**\n * Save timer references to avoid Sinon interfering (see GH-237).\n */\n\nvar Date = global.Date;\nvar setTimeout = global.setTimeout;\nvar setInterval = global.setInterval;\nvar clearTimeout = global.clearTimeout;\nvar clearInterval = global.clearInterval;\n\n/**\n * Node shims.\n *\n * These are meant only to allow\n * mocha.js to run untouched, not\n * to allow running node code in\n * the browser.\n */\n\nvar process = {};\nprocess.exit = function(status){};\nprocess.stdout = {};\n\nvar uncaughtExceptionHandlers = [];\n\nvar originalOnerrorHandler = global.onerror;\n\n/**\n * Remove uncaughtException listener.\n * Revert to original onerror handler if previously defined.\n */\n\nprocess.removeListener = function(e, fn){\n  if ('uncaughtException' == e) {\n    if (originalOnerrorHandler) {\n      global.onerror = originalOnerrorHandler;\n    } else {\n      global.onerror = function() {};\n    }\n    var i = Mocha.utils.indexOf(uncaughtExceptionHandlers, fn);\n    if (i != -1) { uncaughtExceptionHandlers.splice(i, 1); }\n  }\n};\n\n/**\n * Implements uncaughtException listener.\n */\n\nprocess.on = function(e, fn){\n  if ('uncaughtException' == e) {\n    global.onerror = function(err, url, line){\n      fn(new Error(err + ' (' + url + ':' + line + ')'));\n      return true;\n    };\n    uncaughtExceptionHandlers.push(fn);\n  }\n};\n\n/**\n * Expose mocha.\n */\n\nvar Mocha = global.Mocha = require('mocha'),\n    mocha = global.mocha = new Mocha({ reporter: 'html' });\n\n// The BDD UI is registered by default, but no UI will be functional in the\n// browser without an explicit call to the overridden `mocha.ui` (see below).\n// Ensure that this default UI does not expose its methods to the global scope.\nmocha.suite.removeAllListeners('pre-require');\n\nvar immediateQueue = []\n  , immediateTimeout;\n\nfunction timeslice() {\n  var immediateStart = new Date().getTime();\n  while (immediateQueue.length && (new Date().getTime() - immediateStart) < 100) {\n    immediateQueue.shift()();\n  }\n  if (immediateQueue.length) {\n    immediateTimeout = setTimeout(timeslice, 0);\n  } else {\n    immediateTimeout = null;\n  }\n}\n\n/**\n * High-performance override of Runner.immediately.\n */\n\nMocha.Runner.immediately = function(callback) {\n  immediateQueue.push(callback);\n  if (!immediateTimeout) {\n    immediateTimeout = setTimeout(timeslice, 0);\n  }\n};\n\n/**\n * Function to allow assertion libraries to throw errors directly into mocha.\n * This is useful when running tests in a browser because window.onerror will\n * only receive the 'message' attribute of the Error.\n */\nmocha.throwError = function(err) {\n  Mocha.utils.forEach(uncaughtExceptionHandlers, function (fn) {\n    fn(err);\n  });\n  throw err;\n};\n\n/**\n * Override ui to ensure that the ui functions are initialized.\n * Normally this would happen in Mocha.prototype.loadFiles.\n */\n\nmocha.ui = function(ui){\n  Mocha.prototype.ui.call(this, ui);\n  this.suite.emit('pre-require', global, null, this);\n  return this;\n};\n\n/**\n * Setup mocha with the given setting options.\n */\n\nmocha.setup = function(opts){\n  if ('string' == typeof opts) opts = { ui: opts };\n  for (var opt in opts) this[opt](opts[opt]);\n  return this;\n};\n\n/**\n * Run mocha, returning the Runner.\n */\n\nmocha.run = function(fn){\n  var options = mocha.options;\n  mocha.globals('location');\n\n  var query = Mocha.utils.parseQuery(global.location.search || '');\n  if (query.grep) mocha.grep(query.grep);\n  if (query.invert) mocha.invert();\n\n  return Mocha.prototype.run.call(mocha, function(err){\n    // The DOM Document is not available in Web Workers.\n    var document = global.document;\n    if (document && document.getElementById('mocha') && options.noHighlighting !== true) {\n      Mocha.utils.highlightTags('code');\n    }\n    if (fn) fn(err);\n  });\n};\n\n/**\n * Expose the process shim.\n */\n\nMocha.process = process;\n})();\n"

/***/ },
/* 26 */,
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(31);


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() {
		var list = [];
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
		return list;
	}

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _babelHelpers = __webpack_require__(14)["default"];
	
	var Typorama = _babelHelpers.interopRequire(__webpack_require__(21));
	
	module.exports = function (spec) {
	    var displayName = arguments[1] === undefined ? "unknown" : arguments[1];
	
	    var createSpec = typeof spec === "function" ? spec : function () {
	        return spec;
	    };
	
	    return Typorama.define(displayName, {
	        spec: createSpec
	    });
	};

/***/ },
/* 30 */,
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * chai
	 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	var used = []
	  , exports = module.exports = {};
	
	/*!
	 * Chai version
	 */
	
	exports.version = '2.1.0';
	
	/*!
	 * Assertion Error
	 */
	
	exports.AssertionError = __webpack_require__(39);
	
	/*!
	 * Utils for plugins (not exported)
	 */
	
	var util = __webpack_require__(38);
	
	/**
	 * # .use(function)
	 *
	 * Provides a way to extend the internals of Chai
	 *
	 * @param {Function}
	 * @returns {this} for chaining
	 * @api public
	 */
	
	exports.use = function (fn) {
	  if (!~used.indexOf(fn)) {
	    fn(this, util);
	    used.push(fn);
	  }
	
	  return this;
	};
	
	/*!
	 * Utility Functions
	 */
	
	exports.util = util;
	
	/*!
	 * Configuration
	 */
	
	var config = __webpack_require__(32);
	exports.config = config;
	
	/*!
	 * Primary `Assertion` prototype
	 */
	
	var assertion = __webpack_require__(33);
	exports.use(assertion);
	
	/*!
	 * Core Assertions
	 */
	
	var core = __webpack_require__(34);
	exports.use(core);
	
	/*!
	 * Expect interface
	 */
	
	var expect = __webpack_require__(35);
	exports.use(expect);
	
	/*!
	 * Should interface
	 */
	
	var should = __webpack_require__(36);
	exports.use(should);
	
	/*!
	 * Assert interface
	 */
	
	var assert = __webpack_require__(37);
	exports.use(assert);


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	
	  /**
	   * ### config.includeStack
	   *
	   * User configurable property, influences whether stack trace
	   * is included in Assertion error message. Default of false
	   * suppresses stack trace in the error message.
	   *
	   *     chai.config.includeStack = true;  // enable stack on error
	   *
	   * @param {Boolean}
	   * @api public
	   */
	
	   includeStack: false,
	
	  /**
	   * ### config.showDiff
	   *
	   * User configurable property, influences whether or not
	   * the `showDiff` flag should be included in the thrown
	   * AssertionErrors. `false` will always be `false`; `true`
	   * will be true when the assertion has requested a diff
	   * be shown.
	   *
	   * @param {Boolean}
	   * @api public
	   */
	
	  showDiff: true,
	
	  /**
	   * ### config.truncateThreshold
	   *
	   * User configurable property, sets length threshold for actual and
	   * expected values in assertion errors. If this threshold is exceeded,
	   * the value is truncated.
	   *
	   * Set it to zero if you want to disable truncating altogether.
	   *
	   *     chai.config.truncateThreshold = 0;  // disable truncating
	   *
	   * @param {Number}
	   * @api public
	   */
	
	  truncateThreshold: 40
	
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * chai
	 * http://chaijs.com
	 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	var config = __webpack_require__(32);
	
	module.exports = function (_chai, util) {
	  /*!
	   * Module dependencies.
	   */
	
	  var AssertionError = _chai.AssertionError
	    , flag = util.flag;
	
	  /*!
	   * Module export.
	   */
	
	  _chai.Assertion = Assertion;
	
	  /*!
	   * Assertion Constructor
	   *
	   * Creates object for chaining.
	   *
	   * @api private
	   */
	
	  function Assertion (obj, msg, stack) {
	    flag(this, 'ssfi', stack || arguments.callee);
	    flag(this, 'object', obj);
	    flag(this, 'message', msg);
	  }
	
	  Object.defineProperty(Assertion, 'includeStack', {
	    get: function() {
	      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
	      return config.includeStack;
	    },
	    set: function(value) {
	      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
	      config.includeStack = value;
	    }
	  });
	
	  Object.defineProperty(Assertion, 'showDiff', {
	    get: function() {
	      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
	      return config.showDiff;
	    },
	    set: function(value) {
	      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
	      config.showDiff = value;
	    }
	  });
	
	  Assertion.addProperty = function (name, fn) {
	    util.addProperty(this.prototype, name, fn);
	  };
	
	  Assertion.addMethod = function (name, fn) {
	    util.addMethod(this.prototype, name, fn);
	  };
	
	  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
	    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
	  };
	
	  Assertion.overwriteProperty = function (name, fn) {
	    util.overwriteProperty(this.prototype, name, fn);
	  };
	
	  Assertion.overwriteMethod = function (name, fn) {
	    util.overwriteMethod(this.prototype, name, fn);
	  };
	
	  Assertion.overwriteChainableMethod = function (name, fn, chainingBehavior) {
	    util.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);
	  };
	
	  /*!
	   * ### .assert(expression, message, negateMessage, expected, actual)
	   *
	   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
	   *
	   * @name assert
	   * @param {Philosophical} expression to be tested
	   * @param {String or Function} message or function that returns message to display if fails
	   * @param {String or Function} negatedMessage or function that returns negatedMessage to display if negated expression fails
	   * @param {Mixed} expected value (remember to check for negation)
	   * @param {Mixed} actual (optional) will default to `this.obj`
	   * @api private
	   */
	
	  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
	    var ok = util.test(this, arguments);
	    if (true !== showDiff) showDiff = false;
	    if (true !== config.showDiff) showDiff = false;
	
	    if (!ok) {
	      var msg = util.getMessage(this, arguments)
	        , actual = util.getActual(this, arguments);
	      throw new AssertionError(msg, {
	          actual: actual
	        , expected: expected
	        , showDiff: showDiff
	      }, (config.includeStack) ? this.assert : flag(this, 'ssfi'));
	    }
	  };
	
	  /*!
	   * ### ._obj
	   *
	   * Quick reference to stored `actual` value for plugin developers.
	   *
	   * @api private
	   */
	
	  Object.defineProperty(Assertion.prototype, '_obj',
	    { get: function () {
	        return flag(this, 'object');
	      }
	    , set: function (val) {
	        flag(this, 'object', val);
	      }
	  });
	};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * chai
	 * http://chaijs.com
	 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	module.exports = function (chai, _) {
	  var Assertion = chai.Assertion
	    , toString = Object.prototype.toString
	    , flag = _.flag;
	
	  /**
	   * ### Language Chains
	   *
	   * The following are provided as chainable getters to
	   * improve the readability of your assertions. They
	   * do not provide testing capabilities unless they
	   * have been overwritten by a plugin.
	   *
	   * **Chains**
	   *
	   * - to
	   * - be
	   * - been
	   * - is
	   * - that
	   * - which
	   * - and
	   * - has
	   * - have
	   * - with
	   * - at
	   * - of
	   * - same
	   *
	   * @name language chains
	   * @api public
	   */
	
	  [ 'to', 'be', 'been'
	  , 'is', 'and', 'has', 'have'
	  , 'with', 'that', 'which', 'at'
	  , 'of', 'same' ].forEach(function (chain) {
	    Assertion.addProperty(chain, function () {
	      return this;
	    });
	  });
	
	  /**
	   * ### .not
	   *
	   * Negates any of assertions following in the chain.
	   *
	   *     expect(foo).to.not.equal('bar');
	   *     expect(goodFn).to.not.throw(Error);
	   *     expect({ foo: 'baz' }).to.have.property('foo')
	   *       .and.not.equal('bar');
	   *
	   * @name not
	   * @api public
	   */
	
	  Assertion.addProperty('not', function () {
	    flag(this, 'negate', true);
	  });
	
	  /**
	   * ### .deep
	   *
	   * Sets the `deep` flag, later used by the `equal` and
	   * `property` assertions.
	   *
	   *     expect(foo).to.deep.equal({ bar: 'baz' });
	   *     expect({ foo: { bar: { baz: 'quux' } } })
	   *       .to.have.deep.property('foo.bar.baz', 'quux');
	   *
	   * @name deep
	   * @api public
	   */
	
	  Assertion.addProperty('deep', function () {
	    flag(this, 'deep', true);
	  });
	
	  /**
	   * ### .any
	   *
	   * Sets the `any` flag, (opposite of the `all` flag)
	   * later used in the `keys` assertion. 
	   *
	   *     expect(foo).to.have.any.keys('bar', 'baz');
	   *
	   * @name any
	   * @api public
	   */
	
	  Assertion.addProperty('any', function () {
	    flag(this, 'any', true);
	    flag(this, 'all', false)
	  });
	
	
	  /**
	   * ### .all
	   *
	   * Sets the `all` flag (opposite of the `any` flag) 
	   * later used by the `keys` assertion.
	   *
	   *     expect(foo).to.have.all.keys('bar', 'baz');
	   *
	   * @name all
	   * @api public
	   */
	
	  Assertion.addProperty('all', function () {
	    flag(this, 'all', true);
	    flag(this, 'any', false);
	  });
	
	  /**
	   * ### .a(type)
	   *
	   * The `a` and `an` assertions are aliases that can be
	   * used either as language chains or to assert a value's
	   * type.
	   *
	   *     // typeof
	   *     expect('test').to.be.a('string');
	   *     expect({ foo: 'bar' }).to.be.an('object');
	   *     expect(null).to.be.a('null');
	   *     expect(undefined).to.be.an('undefined');
	   *
	   *     // language chain
	   *     expect(foo).to.be.an.instanceof(Foo);
	   *
	   * @name a
	   * @alias an
	   * @param {String} type
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function an (type, msg) {
	    if (msg) flag(this, 'message', msg);
	    type = type.toLowerCase();
	    var obj = flag(this, 'object')
	      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';
	
	    this.assert(
	        type === _.type(obj)
	      , 'expected #{this} to be ' + article + type
	      , 'expected #{this} not to be ' + article + type
	    );
	  }
	
	  Assertion.addChainableMethod('an', an);
	  Assertion.addChainableMethod('a', an);
	
	  /**
	   * ### .include(value)
	   *
	   * The `include` and `contain` assertions can be used as either property
	   * based language chains or as methods to assert the inclusion of an object
	   * in an array or a substring in a string. When used as language chains,
	   * they toggle the `contains` flag for the `keys` assertion.
	   *
	   *     expect([1,2,3]).to.include(2);
	   *     expect('foobar').to.contain('foo');
	   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
	   *
	   * @name include
	   * @alias contain
	   * @alias includes
	   * @alias contains
	   * @param {Object|String|Number} obj
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function includeChainingBehavior () {
	    flag(this, 'contains', true);
	  }
	
	  function include (val, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    var expected = false;
	    if (_.type(obj) === 'array' && _.type(val) === 'object') {
	      for (var i in obj) {
	        if (_.eql(obj[i], val)) {
	          expected = true;
	          break;
	        }
	      }
	    } else if (_.type(val) === 'object') {
	      if (!flag(this, 'negate')) {
	        for (var k in val) new Assertion(obj).property(k, val[k]);
	        return;
	      }
	      var subset = {};
	      for (var k in val) subset[k] = obj[k];
	      expected = _.eql(subset, val);
	    } else {
	      expected = obj && ~obj.indexOf(val);
	    }
	    this.assert(
	        expected
	      , 'expected #{this} to include ' + _.inspect(val)
	      , 'expected #{this} to not include ' + _.inspect(val));
	  }
	
	  Assertion.addChainableMethod('include', include, includeChainingBehavior);
	  Assertion.addChainableMethod('contain', include, includeChainingBehavior);
	  Assertion.addChainableMethod('contains', include, includeChainingBehavior);
	  Assertion.addChainableMethod('includes', include, includeChainingBehavior);
	
	  /**
	   * ### .ok
	   *
	   * Asserts that the target is truthy.
	   *
	   *     expect('everthing').to.be.ok;
	   *     expect(1).to.be.ok;
	   *     expect(false).to.not.be.ok;
	   *     expect(undefined).to.not.be.ok;
	   *     expect(null).to.not.be.ok;
	   *
	   * @name ok
	   * @api public
	   */
	
	  Assertion.addProperty('ok', function () {
	    this.assert(
	        flag(this, 'object')
	      , 'expected #{this} to be truthy'
	      , 'expected #{this} to be falsy');
	  });
	
	  /**
	   * ### .true
	   *
	   * Asserts that the target is `true`.
	   *
	   *     expect(true).to.be.true;
	   *     expect(1).to.not.be.true;
	   *
	   * @name true
	   * @api public
	   */
	
	  Assertion.addProperty('true', function () {
	    this.assert(
	        true === flag(this, 'object')
	      , 'expected #{this} to be true'
	      , 'expected #{this} to be false'
	      , this.negate ? false : true
	    );
	  });
	
	  /**
	   * ### .false
	   *
	   * Asserts that the target is `false`.
	   *
	   *     expect(false).to.be.false;
	   *     expect(0).to.not.be.false;
	   *
	   * @name false
	   * @api public
	   */
	
	  Assertion.addProperty('false', function () {
	    this.assert(
	        false === flag(this, 'object')
	      , 'expected #{this} to be false'
	      , 'expected #{this} to be true'
	      , this.negate ? true : false
	    );
	  });
	
	  /**
	   * ### .null
	   *
	   * Asserts that the target is `null`.
	   *
	   *     expect(null).to.be.null;
	   *     expect(undefined).not.to.be.null;
	   *
	   * @name null
	   * @api public
	   */
	
	  Assertion.addProperty('null', function () {
	    this.assert(
	        null === flag(this, 'object')
	      , 'expected #{this} to be null'
	      , 'expected #{this} not to be null'
	    );
	  });
	
	  /**
	   * ### .undefined
	   *
	   * Asserts that the target is `undefined`.
	   *
	   *     expect(undefined).to.be.undefined;
	   *     expect(null).to.not.be.undefined;
	   *
	   * @name undefined
	   * @api public
	   */
	
	  Assertion.addProperty('undefined', function () {
	    this.assert(
	        undefined === flag(this, 'object')
	      , 'expected #{this} to be undefined'
	      , 'expected #{this} not to be undefined'
	    );
	  });
	
	  /**
	   * ### .exist
	   *
	   * Asserts that the target is neither `null` nor `undefined`.
	   *
	   *     var foo = 'hi'
	   *       , bar = null
	   *       , baz;
	   *
	   *     expect(foo).to.exist;
	   *     expect(bar).to.not.exist;
	   *     expect(baz).to.not.exist;
	   *
	   * @name exist
	   * @api public
	   */
	
	  Assertion.addProperty('exist', function () {
	    this.assert(
	        null != flag(this, 'object')
	      , 'expected #{this} to exist'
	      , 'expected #{this} to not exist'
	    );
	  });
	
	
	  /**
	   * ### .empty
	   *
	   * Asserts that the target's length is `0`. For arrays, it checks
	   * the `length` property. For objects, it gets the count of
	   * enumerable keys.
	   *
	   *     expect([]).to.be.empty;
	   *     expect('').to.be.empty;
	   *     expect({}).to.be.empty;
	   *
	   * @name empty
	   * @api public
	   */
	
	  Assertion.addProperty('empty', function () {
	    var obj = flag(this, 'object')
	      , expected = obj;
	
	    if (Array.isArray(obj) || 'string' === typeof object) {
	      expected = obj.length;
	    } else if (typeof obj === 'object') {
	      expected = Object.keys(obj).length;
	    }
	
	    this.assert(
	        !expected
	      , 'expected #{this} to be empty'
	      , 'expected #{this} not to be empty'
	    );
	  });
	
	  /**
	   * ### .arguments
	   *
	   * Asserts that the target is an arguments object.
	   *
	   *     function test () {
	   *       expect(arguments).to.be.arguments;
	   *     }
	   *
	   * @name arguments
	   * @alias Arguments
	   * @api public
	   */
	
	  function checkArguments () {
	    var obj = flag(this, 'object')
	      , type = Object.prototype.toString.call(obj);
	    this.assert(
	        '[object Arguments]' === type
	      , 'expected #{this} to be arguments but got ' + type
	      , 'expected #{this} to not be arguments'
	    );
	  }
	
	  Assertion.addProperty('arguments', checkArguments);
	  Assertion.addProperty('Arguments', checkArguments);
	
	  /**
	   * ### .equal(value)
	   *
	   * Asserts that the target is strictly equal (`===`) to `value`.
	   * Alternately, if the `deep` flag is set, asserts that
	   * the target is deeply equal to `value`.
	   *
	   *     expect('hello').to.equal('hello');
	   *     expect(42).to.equal(42);
	   *     expect(1).to.not.equal(true);
	   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
	   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
	   *
	   * @name equal
	   * @alias equals
	   * @alias eq
	   * @alias deep.equal
	   * @param {Mixed} value
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function assertEqual (val, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    if (flag(this, 'deep')) {
	      return this.eql(val);
	    } else {
	      this.assert(
	          val === obj
	        , 'expected #{this} to equal #{exp}'
	        , 'expected #{this} to not equal #{exp}'
	        , val
	        , this._obj
	        , true
	      );
	    }
	  }
	
	  Assertion.addMethod('equal', assertEqual);
	  Assertion.addMethod('equals', assertEqual);
	  Assertion.addMethod('eq', assertEqual);
	
	  /**
	   * ### .eql(value)
	   *
	   * Asserts that the target is deeply equal to `value`.
	   *
	   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
	   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
	   *
	   * @name eql
	   * @alias eqls
	   * @param {Mixed} value
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function assertEql(obj, msg) {
	    if (msg) flag(this, 'message', msg);
	    this.assert(
	        _.eql(obj, flag(this, 'object'))
	      , 'expected #{this} to deeply equal #{exp}'
	      , 'expected #{this} to not deeply equal #{exp}'
	      , obj
	      , this._obj
	      , true
	    );
	  }
	
	  Assertion.addMethod('eql', assertEql);
	  Assertion.addMethod('eqls', assertEql);
	
	  /**
	   * ### .above(value)
	   *
	   * Asserts that the target is greater than `value`.
	   *
	   *     expect(10).to.be.above(5);
	   *
	   * Can also be used in conjunction with `length` to
	   * assert a minimum length. The benefit being a
	   * more informative error message than if the length
	   * was supplied directly.
	   *
	   *     expect('foo').to.have.length.above(2);
	   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
	   *
	   * @name above
	   * @alias gt
	   * @alias greaterThan
	   * @param {Number} value
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function assertAbove (n, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    if (flag(this, 'doLength')) {
	      new Assertion(obj, msg).to.have.property('length');
	      var len = obj.length;
	      this.assert(
	          len > n
	        , 'expected #{this} to have a length above #{exp} but got #{act}'
	        , 'expected #{this} to not have a length above #{exp}'
	        , n
	        , len
	      );
	    } else {
	      this.assert(
	          obj > n
	        , 'expected #{this} to be above ' + n
	        , 'expected #{this} to be at most ' + n
	      );
	    }
	  }
	
	  Assertion.addMethod('above', assertAbove);
	  Assertion.addMethod('gt', assertAbove);
	  Assertion.addMethod('greaterThan', assertAbove);
	
	  /**
	   * ### .least(value)
	   *
	   * Asserts that the target is greater than or equal to `value`.
	   *
	   *     expect(10).to.be.at.least(10);
	   *
	   * Can also be used in conjunction with `length` to
	   * assert a minimum length. The benefit being a
	   * more informative error message than if the length
	   * was supplied directly.
	   *
	   *     expect('foo').to.have.length.of.at.least(2);
	   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);
	   *
	   * @name least
	   * @alias gte
	   * @param {Number} value
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function assertLeast (n, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    if (flag(this, 'doLength')) {
	      new Assertion(obj, msg).to.have.property('length');
	      var len = obj.length;
	      this.assert(
	          len >= n
	        , 'expected #{this} to have a length at least #{exp} but got #{act}'
	        , 'expected #{this} to have a length below #{exp}'
	        , n
	        , len
	      );
	    } else {
	      this.assert(
	          obj >= n
	        , 'expected #{this} to be at least ' + n
	        , 'expected #{this} to be below ' + n
	      );
	    }
	  }
	
	  Assertion.addMethod('least', assertLeast);
	  Assertion.addMethod('gte', assertLeast);
	
	  /**
	   * ### .below(value)
	   *
	   * Asserts that the target is less than `value`.
	   *
	   *     expect(5).to.be.below(10);
	   *
	   * Can also be used in conjunction with `length` to
	   * assert a maximum length. The benefit being a
	   * more informative error message than if the length
	   * was supplied directly.
	   *
	   *     expect('foo').to.have.length.below(4);
	   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
	   *
	   * @name below
	   * @alias lt
	   * @alias lessThan
	   * @param {Number} value
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function assertBelow (n, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    if (flag(this, 'doLength')) {
	      new Assertion(obj, msg).to.have.property('length');
	      var len = obj.length;
	      this.assert(
	          len < n
	        , 'expected #{this} to have a length below #{exp} but got #{act}'
	        , 'expected #{this} to not have a length below #{exp}'
	        , n
	        , len
	      );
	    } else {
	      this.assert(
	          obj < n
	        , 'expected #{this} to be below ' + n
	        , 'expected #{this} to be at least ' + n
	      );
	    }
	  }
	
	  Assertion.addMethod('below', assertBelow);
	  Assertion.addMethod('lt', assertBelow);
	  Assertion.addMethod('lessThan', assertBelow);
	
	  /**
	   * ### .most(value)
	   *
	   * Asserts that the target is less than or equal to `value`.
	   *
	   *     expect(5).to.be.at.most(5);
	   *
	   * Can also be used in conjunction with `length` to
	   * assert a maximum length. The benefit being a
	   * more informative error message than if the length
	   * was supplied directly.
	   *
	   *     expect('foo').to.have.length.of.at.most(4);
	   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);
	   *
	   * @name most
	   * @alias lte
	   * @param {Number} value
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function assertMost (n, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    if (flag(this, 'doLength')) {
	      new Assertion(obj, msg).to.have.property('length');
	      var len = obj.length;
	      this.assert(
	          len <= n
	        , 'expected #{this} to have a length at most #{exp} but got #{act}'
	        , 'expected #{this} to have a length above #{exp}'
	        , n
	        , len
	      );
	    } else {
	      this.assert(
	          obj <= n
	        , 'expected #{this} to be at most ' + n
	        , 'expected #{this} to be above ' + n
	      );
	    }
	  }
	
	  Assertion.addMethod('most', assertMost);
	  Assertion.addMethod('lte', assertMost);
	
	  /**
	   * ### .within(start, finish)
	   *
	   * Asserts that the target is within a range.
	   *
	   *     expect(7).to.be.within(5,10);
	   *
	   * Can also be used in conjunction with `length` to
	   * assert a length range. The benefit being a
	   * more informative error message than if the length
	   * was supplied directly.
	   *
	   *     expect('foo').to.have.length.within(2,4);
	   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
	   *
	   * @name within
	   * @param {Number} start lowerbound inclusive
	   * @param {Number} finish upperbound inclusive
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  Assertion.addMethod('within', function (start, finish, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object')
	      , range = start + '..' + finish;
	    if (flag(this, 'doLength')) {
	      new Assertion(obj, msg).to.have.property('length');
	      var len = obj.length;
	      this.assert(
	          len >= start && len <= finish
	        , 'expected #{this} to have a length within ' + range
	        , 'expected #{this} to not have a length within ' + range
	      );
	    } else {
	      this.assert(
	          obj >= start && obj <= finish
	        , 'expected #{this} to be within ' + range
	        , 'expected #{this} to not be within ' + range
	      );
	    }
	  });
	
	  /**
	   * ### .instanceof(constructor)
	   *
	   * Asserts that the target is an instance of `constructor`.
	   *
	   *     var Tea = function (name) { this.name = name; }
	   *       , Chai = new Tea('chai');
	   *
	   *     expect(Chai).to.be.an.instanceof(Tea);
	   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);
	   *
	   * @name instanceof
	   * @param {Constructor} constructor
	   * @param {String} message _optional_
	   * @alias instanceOf
	   * @api public
	   */
	
	  function assertInstanceOf (constructor, msg) {
	    if (msg) flag(this, 'message', msg);
	    var name = _.getName(constructor);
	    this.assert(
	        flag(this, 'object') instanceof constructor
	      , 'expected #{this} to be an instance of ' + name
	      , 'expected #{this} to not be an instance of ' + name
	    );
	  };
	
	  Assertion.addMethod('instanceof', assertInstanceOf);
	  Assertion.addMethod('instanceOf', assertInstanceOf);
	
	  /**
	   * ### .property(name, [value])
	   *
	   * Asserts that the target has a property `name`, optionally asserting that
	   * the value of that property is strictly equal to  `value`.
	   * If the `deep` flag is set, you can use dot- and bracket-notation for deep
	   * references into objects and arrays.
	   *
	   *     // simple referencing
	   *     var obj = { foo: 'bar' };
	   *     expect(obj).to.have.property('foo');
	   *     expect(obj).to.have.property('foo', 'bar');
	   *
	   *     // deep referencing
	   *     var deepObj = {
	   *         green: { tea: 'matcha' }
	   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]
	   *     };
	
	   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');
	   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
	   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');
	   *
	   * You can also use an array as the starting point of a `deep.property`
	   * assertion, or traverse nested arrays.
	   *
	   *     var arr = [
	   *         [ 'chai', 'matcha', 'konacha' ]
	   *       , [ { tea: 'chai' }
	   *         , { tea: 'matcha' }
	   *         , { tea: 'konacha' } ]
	   *     ];
	   *
	   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');
	   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
	   *
	   * Furthermore, `property` changes the subject of the assertion
	   * to be the value of that property from the original object. This
	   * permits for further chainable assertions on that property.
	   *
	   *     expect(obj).to.have.property('foo')
	   *       .that.is.a('string');
	   *     expect(deepObj).to.have.property('green')
	   *       .that.is.an('object')
	   *       .that.deep.equals({ tea: 'matcha' });
	   *     expect(deepObj).to.have.property('teas')
	   *       .that.is.an('array')
	   *       .with.deep.property('[2]')
	   *         .that.deep.equals({ tea: 'konacha' });
	   *
	   * @name property
	   * @alias deep.property
	   * @param {String} name
	   * @param {Mixed} value (optional)
	   * @param {String} message _optional_
	   * @returns value of property for chaining
	   * @api public
	   */
	
	  Assertion.addMethod('property', function (name, val, msg) {
	    if (msg) flag(this, 'message', msg);
	
	    var isDeep = !!flag(this, 'deep')
	      , descriptor = isDeep ? 'deep property ' : 'property '
	      , negate = flag(this, 'negate')
	      , obj = flag(this, 'object')
	      , pathInfo = isDeep ? _.getPathInfo(name, obj) : null
	      , hasProperty = isDeep
	        ? pathInfo.exists
	        : _.hasProperty(name, obj)
	      , value = isDeep
	        ? pathInfo.value
	        : obj[name];
	
	    if (negate && undefined !== val) {
	      if (undefined === value) {
	        msg = (msg != null) ? msg + ': ' : '';
	        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
	      }
	    } else {
	      this.assert(
	          hasProperty
	        , 'expected #{this} to have a ' + descriptor + _.inspect(name)
	        , 'expected #{this} to not have ' + descriptor + _.inspect(name));
	    }
	
	    if (undefined !== val) {
	      this.assert(
	          val === value
	        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
	        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
	        , val
	        , value
	      );
	    }
	
	    flag(this, 'object', value);
	  });
	
	
	  /**
	   * ### .ownProperty(name)
	   *
	   * Asserts that the target has an own property `name`.
	   *
	   *     expect('test').to.have.ownProperty('length');
	   *
	   * @name ownProperty
	   * @alias haveOwnProperty
	   * @param {String} name
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function assertOwnProperty (name, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    this.assert(
	        obj.hasOwnProperty(name)
	      , 'expected #{this} to have own property ' + _.inspect(name)
	      , 'expected #{this} to not have own property ' + _.inspect(name)
	    );
	  }
	
	  Assertion.addMethod('ownProperty', assertOwnProperty);
	  Assertion.addMethod('haveOwnProperty', assertOwnProperty);
	
	  /**
	   * ### .length(value)
	   *
	   * Asserts that the target's `length` property has
	   * the expected value.
	   *
	   *     expect([ 1, 2, 3]).to.have.length(3);
	   *     expect('foobar').to.have.length(6);
	   *
	   * Can also be used as a chain precursor to a value
	   * comparison for the length property.
	   *
	   *     expect('foo').to.have.length.above(2);
	   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
	   *     expect('foo').to.have.length.below(4);
	   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
	   *     expect('foo').to.have.length.within(2,4);
	   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
	   *
	   * @name length
	   * @alias lengthOf
	   * @param {Number} length
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function assertLengthChain () {
	    flag(this, 'doLength', true);
	  }
	
	  function assertLength (n, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    new Assertion(obj, msg).to.have.property('length');
	    var len = obj.length;
	
	    this.assert(
	        len == n
	      , 'expected #{this} to have a length of #{exp} but got #{act}'
	      , 'expected #{this} to not have a length of #{act}'
	      , n
	      , len
	    );
	  }
	
	  Assertion.addChainableMethod('length', assertLength, assertLengthChain);
	  Assertion.addMethod('lengthOf', assertLength);
	
	  /**
	   * ### .match(regexp)
	   *
	   * Asserts that the target matches a regular expression.
	   *
	   *     expect('foobar').to.match(/^foo/);
	   *
	   * @name match
	   * @param {RegExp} RegularExpression
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  Assertion.addMethod('match', function (re, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    this.assert(
	        re.exec(obj)
	      , 'expected #{this} to match ' + re
	      , 'expected #{this} not to match ' + re
	    );
	  });
	
	  /**
	   * ### .string(string)
	   *
	   * Asserts that the string target contains another string.
	   *
	   *     expect('foobar').to.have.string('bar');
	   *
	   * @name string
	   * @param {String} string
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  Assertion.addMethod('string', function (str, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    new Assertion(obj, msg).is.a('string');
	
	    this.assert(
	        ~obj.indexOf(str)
	      , 'expected #{this} to contain ' + _.inspect(str)
	      , 'expected #{this} to not contain ' + _.inspect(str)
	    );
	  });
	
	
	  /**
	   * ### .keys(key1, [key2], [...])
	   *
	   * Asserts that the target contains any or all of the passed-in keys.
	   * Use in combination with `any`, `all`, `contains`, or `have` will affect 
	   * what will pass.
	   * 
	   * When used in conjunction with `any`, at least one key that is passed 
	   * in must exist in the target object. This is regardless whether or not 
	   * the `have` or `contain` qualifiers are used. Note, either `any` or `all`
	   * should be used in the assertion. If neither are used, the assertion is
	   * defaulted to `all`.
	   * 
	   * When both `all` and `contain` are used, the target object must have at 
	   * least all of the passed-in keys but may have more keys not listed.
	   * 
	   * When both `all` and `have` are used, the target object must both contain
	   * all of the passed-in keys AND the number of keys in the target object must
	   * match the number of keys passed in (in other words, a target object must 
	   * have all and only all of the passed-in keys).
	   * 
	   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo', 'baz');
	   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo');
	   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys('bar', 'baz');
	   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys(['foo']);
	   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys({'foo': 6});
	   *     expect({ foo: 1, bar: 2 }).to.have.all.keys(['bar', 'foo']);
	   *     expect({ foo: 1, bar: 2 }).to.have.all.keys({'bar': 6, 'foo', 7});
	   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys(['bar', 'foo']);
	   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys([{'bar': 6}}]);
	   *
	   *
	   * @name keys
	   * @alias key
	   * @param {String...|Array|Object} keys
	   * @api public
	   */
	
	  function assertKeys (keys) {
	    var obj = flag(this, 'object')
	      , str
	      , ok = true
	      , mixedArgsMsg = 'keys must be given single argument of Array|Object|String, or multiple String arguments';
	
	    switch (_.type(keys)) {
	      case "array":
	        if (arguments.length > 1) throw (new Error(mixedArgsMsg));
	        break;
	      case "object":
	        if (arguments.length > 1) throw (new Error(mixedArgsMsg));
	        keys = Object.keys(keys);
	        break;
	      default:
	        keys = Array.prototype.slice.call(arguments);
	    }
	
	    if (!keys.length) throw new Error('keys required');
	
	    var actual = Object.keys(obj)
	      , expected = keys
	      , len = keys.length
	      , any = flag(this, 'any')
	      , all = flag(this, 'all');
	
	    if (!any && !all) {
	      all = true;
	    }
	
	    // Has any
	    if (any) {
	      var intersection = expected.filter(function(key) {
	        return ~actual.indexOf(key);
	      });
	      ok = intersection.length > 0;
	    }
	
	    // Has all
	    if (all) {
	      ok = keys.every(function(key){
	        return ~actual.indexOf(key);
	      });
	      if (!flag(this, 'negate') && !flag(this, 'contains')) {
	        ok = ok && keys.length == actual.length;
	      }
	    }
	
	    // Key string
	    if (len > 1) {
	      keys = keys.map(function(key){
	        return _.inspect(key);
	      });
	      var last = keys.pop();
	      if (all) {
	        str = keys.join(', ') + ', and ' + last;
	      }
	      if (any) {
	        str = keys.join(', ') + ', or ' + last;
	      }
	    } else {
	      str = _.inspect(keys[0]);
	    }
	
	    // Form
	    str = (len > 1 ? 'keys ' : 'key ') + str;
	
	    // Have / include
	    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;
	
	    // Assertion
	    this.assert(
	        ok
	      , 'expected #{this} to ' + str
	      , 'expected #{this} to not ' + str
	      , expected.slice(0).sort()
	      , actual.sort()
	      , true
	    );
	  }
	
	  Assertion.addMethod('keys', assertKeys);
	  Assertion.addMethod('key', assertKeys);
	
	  /**
	   * ### .throw(constructor)
	   *
	   * Asserts that the function target will throw a specific error, or specific type of error
	   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test
	   * for the error's message.
	   *
	   *     var err = new ReferenceError('This is a bad function.');
	   *     var fn = function () { throw err; }
	   *     expect(fn).to.throw(ReferenceError);
	   *     expect(fn).to.throw(Error);
	   *     expect(fn).to.throw(/bad function/);
	   *     expect(fn).to.not.throw('good function');
	   *     expect(fn).to.throw(ReferenceError, /bad function/);
	   *     expect(fn).to.throw(err);
	   *     expect(fn).to.not.throw(new RangeError('Out of range.'));
	   *
	   * Please note that when a throw expectation is negated, it will check each
	   * parameter independently, starting with error constructor type. The appropriate way
	   * to check for the existence of a type of error but for a message that does not match
	   * is to use `and`.
	   *
	   *     expect(fn).to.throw(ReferenceError)
	   *        .and.not.throw(/good function/);
	   *
	   * @name throw
	   * @alias throws
	   * @alias Throw
	   * @param {ErrorConstructor} constructor
	   * @param {String|RegExp} expected error message
	   * @param {String} message _optional_
	   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
	   * @returns error for chaining (null if no error)
	   * @api public
	   */
	
	  function assertThrows (constructor, errMsg, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    new Assertion(obj, msg).is.a('function');
	
	    var thrown = false
	      , desiredError = null
	      , name = null
	      , thrownError = null;
	
	    if (arguments.length === 0) {
	      errMsg = null;
	      constructor = null;
	    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
	      errMsg = constructor;
	      constructor = null;
	    } else if (constructor && constructor instanceof Error) {
	      desiredError = constructor;
	      constructor = null;
	      errMsg = null;
	    } else if (typeof constructor === 'function') {
	      name = constructor.prototype.name || constructor.name;
	      if (name === 'Error' && constructor !== Error) {
	        name = (new constructor()).name;
	      }
	    } else {
	      constructor = null;
	    }
	
	    try {
	      obj();
	    } catch (err) {
	      // first, check desired error
	      if (desiredError) {
	        this.assert(
	            err === desiredError
	          , 'expected #{this} to throw #{exp} but #{act} was thrown'
	          , 'expected #{this} to not throw #{exp}'
	          , (desiredError instanceof Error ? desiredError.toString() : desiredError)
	          , (err instanceof Error ? err.toString() : err)
	        );
	
	        flag(this, 'object', err);
	        return this;
	      }
	
	      // next, check constructor
	      if (constructor) {
	        this.assert(
	            err instanceof constructor
	          , 'expected #{this} to throw #{exp} but #{act} was thrown'
	          , 'expected #{this} to not throw #{exp} but #{act} was thrown'
	          , name
	          , (err instanceof Error ? err.toString() : err)
	        );
	
	        if (!errMsg) {
	          flag(this, 'object', err);
	          return this;
	        }
	      }
	
	      // next, check message
	      var message = 'object' === _.type(err) && "message" in err
	        ? err.message
	        : '' + err;
	
	      if ((message != null) && errMsg && errMsg instanceof RegExp) {
	        this.assert(
	            errMsg.exec(message)
	          , 'expected #{this} to throw error matching #{exp} but got #{act}'
	          , 'expected #{this} to throw error not matching #{exp}'
	          , errMsg
	          , message
	        );
	
	        flag(this, 'object', err);
	        return this;
	      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {
	        this.assert(
	            ~message.indexOf(errMsg)
	          , 'expected #{this} to throw error including #{exp} but got #{act}'
	          , 'expected #{this} to throw error not including #{act}'
	          , errMsg
	          , message
	        );
	
	        flag(this, 'object', err);
	        return this;
	      } else {
	        thrown = true;
	        thrownError = err;
	      }
	    }
	
	    var actuallyGot = ''
	      , expectedThrown = name !== null
	        ? name
	        : desiredError
	          ? '#{exp}' //_.inspect(desiredError)
	          : 'an error';
	
	    if (thrown) {
	      actuallyGot = ' but #{act} was thrown'
	    }
	
	    this.assert(
	        thrown === true
	      , 'expected #{this} to throw ' + expectedThrown + actuallyGot
	      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot
	      , (desiredError instanceof Error ? desiredError.toString() : desiredError)
	      , (thrownError instanceof Error ? thrownError.toString() : thrownError)
	    );
	
	    flag(this, 'object', thrownError);
	  };
	
	  Assertion.addMethod('throw', assertThrows);
	  Assertion.addMethod('throws', assertThrows);
	  Assertion.addMethod('Throw', assertThrows);
	
	  /**
	   * ### .respondTo(method)
	   *
	   * Asserts that the object or class target will respond to a method.
	   *
	   *     Klass.prototype.bar = function(){};
	   *     expect(Klass).to.respondTo('bar');
	   *     expect(obj).to.respondTo('bar');
	   *
	   * To check if a constructor will respond to a static function,
	   * set the `itself` flag.
	   *
	   *     Klass.baz = function(){};
	   *     expect(Klass).itself.to.respondTo('baz');
	   *
	   * @name respondTo
	   * @param {String} method
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  Assertion.addMethod('respondTo', function (method, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object')
	      , itself = flag(this, 'itself')
	      , context = ('function' === _.type(obj) && !itself)
	        ? obj.prototype[method]
	        : obj[method];
	
	    this.assert(
	        'function' === typeof context
	      , 'expected #{this} to respond to ' + _.inspect(method)
	      , 'expected #{this} to not respond to ' + _.inspect(method)
	    );
	  });
	
	  /**
	   * ### .itself
	   *
	   * Sets the `itself` flag, later used by the `respondTo` assertion.
	   *
	   *     function Foo() {}
	   *     Foo.bar = function() {}
	   *     Foo.prototype.baz = function() {}
	   *
	   *     expect(Foo).itself.to.respondTo('bar');
	   *     expect(Foo).itself.not.to.respondTo('baz');
	   *
	   * @name itself
	   * @api public
	   */
	
	  Assertion.addProperty('itself', function () {
	    flag(this, 'itself', true);
	  });
	
	  /**
	   * ### .satisfy(method)
	   *
	   * Asserts that the target passes a given truth test.
	   *
	   *     expect(1).to.satisfy(function(num) { return num > 0; });
	   *
	   * @name satisfy
	   * @param {Function} matcher
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  Assertion.addMethod('satisfy', function (matcher, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	    var result = matcher(obj);
	    this.assert(
	        result
	      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)
	      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)
	      , this.negate ? false : true
	      , result
	    );
	  });
	
	  /**
	   * ### .closeTo(expected, delta)
	   *
	   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
	   *
	   *     expect(1.5).to.be.closeTo(1, 0.5);
	   *
	   * @name closeTo
	   * @param {Number} expected
	   * @param {Number} delta
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  Assertion.addMethod('closeTo', function (expected, delta, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	
	    new Assertion(obj, msg).is.a('number');
	    if (_.type(expected) !== 'number' || _.type(delta) !== 'number') {
	      throw new Error('the arguments to closeTo must be numbers');
	    }
	
	    this.assert(
	        Math.abs(obj - expected) <= delta
	      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
	      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
	    );
	  });
	
	  function isSubsetOf(subset, superset, cmp) {
	    return subset.every(function(elem) {
	      if (!cmp) return superset.indexOf(elem) !== -1;
	
	      return superset.some(function(elem2) {
	        return cmp(elem, elem2);
	      });
	    })
	  }
	
	  /**
	   * ### .members(set)
	   *
	   * Asserts that the target is a superset of `set`,
	   * or that the target and `set` have the same strictly-equal (===) members.
	   * Alternately, if the `deep` flag is set, set members are compared for deep
	   * equality.
	   *
	   *     expect([1, 2, 3]).to.include.members([3, 2]);
	   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
	   *
	   *     expect([4, 2]).to.have.members([2, 4]);
	   *     expect([5, 2]).to.not.have.members([5, 2, 1]);
	   *
	   *     expect([{ id: 1 }]).to.deep.include.members([{ id: 1 }]);
	   *
	   * @name members
	   * @param {Array} set
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  Assertion.addMethod('members', function (subset, msg) {
	    if (msg) flag(this, 'message', msg);
	    var obj = flag(this, 'object');
	
	    new Assertion(obj).to.be.an('array');
	    new Assertion(subset).to.be.an('array');
	
	    var cmp = flag(this, 'deep') ? _.eql : undefined;
	
	    if (flag(this, 'contains')) {
	      return this.assert(
	          isSubsetOf(subset, obj, cmp)
	        , 'expected #{this} to be a superset of #{act}'
	        , 'expected #{this} to not be a superset of #{act}'
	        , obj
	        , subset
	      );
	    }
	
	    this.assert(
	        isSubsetOf(obj, subset, cmp) && isSubsetOf(subset, obj, cmp)
	        , 'expected #{this} to have the same members as #{act}'
	        , 'expected #{this} to not have the same members as #{act}'
	        , obj
	        , subset
	    );
	  });
	
	  /**
	   * ### .change(function)
	   *
	   * Asserts that a function changes an object property
	   *
	   *     var obj = { val: 10 };
	   *     var fn = function() { obj.val += 3 };
	   *     var noChangeFn = function() { return 'foo' + 'bar'; }
	   *     expect(fn).to.change(obj, 'val');
	   *     expect(noChangFn).to.not.change(obj, 'val')
	   *
	   * @name change
	   * @alias changes
	   * @alias Change
	   * @param {String} object
	   * @param {String} property name
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function assertChanges (object, prop, msg) {
	    if (msg) flag(this, 'message', msg);
	    var fn = flag(this, 'object');
	    new Assertion(object, msg).to.have.property(prop);
	    new Assertion(fn).is.a('function');
	
	    var initial = object[prop];
	    fn();
	
	    this.assert(
	      initial !== object[prop]
	      , 'expected .' + prop + ' to change'
	      , 'expected .' + prop + ' to not change'
	    );
	  }
	
	  Assertion.addChainableMethod('change', assertChanges);
	  Assertion.addChainableMethod('changes', assertChanges);
	
	  /**
	   * ### .increase(function)
	   *
	   * Asserts that a function increases an object property
	   *
	   *     var obj = { val: 10 };
	   *     var fn = function() { obj.val = 15 };
	   *     expect(fn).to.increase(obj, 'val');
	   *
	   * @name increase
	   * @alias increases
	   * @alias Increase
	   * @param {String} object
	   * @param {String} property name
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function assertIncreases (object, prop, msg) {
	    if (msg) flag(this, 'message', msg);
	    var fn = flag(this, 'object');
	    new Assertion(object, msg).to.have.property(prop);
	    new Assertion(fn).is.a('function');
	
	    var initial = object[prop];
	    fn();
	
	    this.assert(
	      object[prop] - initial > 0
	      , 'expected .' + prop + ' to increase'
	      , 'expected .' + prop + ' to not increase'
	    );
	  }
	
	  Assertion.addChainableMethod('increase', assertIncreases);
	  Assertion.addChainableMethod('increases', assertIncreases);
	
	  /**
	   * ### .decrease(function)
	   *
	   * Asserts that a function decreases an object property
	   *
	   *     var obj = { val: 10 };
	   *     var fn = function() { obj.val = 5 };
	   *     expect(fn).to.decrease(obj, 'val');
	   *
	   * @name decrease
	   * @alias decreases
	   * @alias Decrease
	   * @param {String} object
	   * @param {String} property name
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  function assertDecreases (object, prop, msg) {
	    if (msg) flag(this, 'message', msg);
	    var fn = flag(this, 'object');
	    new Assertion(object, msg).to.have.property(prop);
	    new Assertion(fn).is.a('function');
	
	    var initial = object[prop];
	    fn();
	
	    this.assert(
	      object[prop] - initial < 0
	      , 'expected .' + prop + ' to decrease'
	      , 'expected .' + prop + ' to not decrease'
	    );
	  }
	
	  Assertion.addChainableMethod('decrease', assertDecreases);
	  Assertion.addChainableMethod('decreases', assertDecreases);
	
	};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * chai
	 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	module.exports = function (chai, util) {
	  chai.expect = function (val, message) {
	    return new chai.Assertion(val, message);
	  };
	
	  /**
	   * ### .fail(actual, expected, [message], [operator])
	   *
	   * Throw a failure.
	   *
	   * @name fail
	   * @param {Mixed} actual
	   * @param {Mixed} expected
	   * @param {String} message
	   * @param {String} operator
	   * @api public
	   */
	
	  chai.expect.fail = function (actual, expected, message, operator) {
	    message = message || 'expect.fail()';
	    throw new chai.AssertionError(message, {
	        actual: actual
	      , expected: expected
	      , operator: operator
	    }, chai.expect.fail);
	  };
	};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * chai
	 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	module.exports = function (chai, util) {
	  var Assertion = chai.Assertion;
	
	  function loadShould () {
	    // explicitly define this method as function as to have it's name to include as `ssfi`
	    function shouldGetter() {
	      if (this instanceof String || this instanceof Number) {
	        return new Assertion(this.constructor(this), null, shouldGetter);
	      } else if (this instanceof Boolean) {
	        return new Assertion(this == true, null, shouldGetter);
	      }
	      return new Assertion(this, null, shouldGetter);
	    }
	    function shouldSetter(value) {
	      // See https://github.com/chaijs/chai/issues/86: this makes
	      // `whatever.should = someValue` actually set `someValue`, which is
	      // especially useful for `global.should = require('chai').should()`.
	      //
	      // Note that we have to use [[DefineProperty]] instead of [[Put]]
	      // since otherwise we would trigger this very setter!
	      Object.defineProperty(this, 'should', {
	        value: value,
	        enumerable: true,
	        configurable: true,
	        writable: true
	      });
	    }
	    // modify Object.prototype to have `should`
	    Object.defineProperty(Object.prototype, 'should', {
	      set: shouldSetter
	      , get: shouldGetter
	      , configurable: true
	    });
	
	    var should = {};
	
	    /**
	     * ### .fail(actual, expected, [message], [operator])
	     *
	     * Throw a failure.
	     *
	     * @name fail
	     * @param {Mixed} actual
	     * @param {Mixed} expected
	     * @param {String} message
	     * @param {String} operator
	     * @api public
	     */
	
	    should.fail = function (actual, expected, message, operator) {
	      message = message || 'should.fail()';
	      throw new chai.AssertionError(message, {
	          actual: actual
	        , expected: expected
	        , operator: operator
	      }, should.fail);
	    };
	
	    should.equal = function (val1, val2, msg) {
	      new Assertion(val1, msg).to.equal(val2);
	    };
	
	    should.Throw = function (fn, errt, errs, msg) {
	      new Assertion(fn, msg).to.Throw(errt, errs);
	    };
	
	    should.exist = function (val, msg) {
	      new Assertion(val, msg).to.exist;
	    }
	
	    // negation
	    should.not = {}
	
	    should.not.equal = function (val1, val2, msg) {
	      new Assertion(val1, msg).to.not.equal(val2);
	    };
	
	    should.not.Throw = function (fn, errt, errs, msg) {
	      new Assertion(fn, msg).to.not.Throw(errt, errs);
	    };
	
	    should.not.exist = function (val, msg) {
	      new Assertion(val, msg).to.not.exist;
	    }
	
	    should['throw'] = should['Throw'];
	    should.not['throw'] = should.not['Throw'];
	
	    return should;
	  };
	
	  chai.should = loadShould;
	  chai.Should = loadShould;
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * chai
	 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	
	module.exports = function (chai, util) {
	
	  /*!
	   * Chai dependencies.
	   */
	
	  var Assertion = chai.Assertion
	    , flag = util.flag;
	
	  /*!
	   * Module export.
	   */
	
	  /**
	   * ### assert(expression, message)
	   *
	   * Write your own test expressions.
	   *
	   *     assert('foo' !== 'bar', 'foo is not bar');
	   *     assert(Array.isArray([]), 'empty arrays are arrays');
	   *
	   * @param {Mixed} expression to test for truthiness
	   * @param {String} message to display on error
	   * @name assert
	   * @api public
	   */
	
	  var assert = chai.assert = function (express, errmsg) {
	    var test = new Assertion(null, null, chai.assert);
	    test.assert(
	        express
	      , errmsg
	      , '[ negation message unavailable ]'
	    );
	  };
	
	  /**
	   * ### .fail(actual, expected, [message], [operator])
	   *
	   * Throw a failure. Node.js `assert` module-compatible.
	   *
	   * @name fail
	   * @param {Mixed} actual
	   * @param {Mixed} expected
	   * @param {String} message
	   * @param {String} operator
	   * @api public
	   */
	
	  assert.fail = function (actual, expected, message, operator) {
	    message = message || 'assert.fail()';
	    throw new chai.AssertionError(message, {
	        actual: actual
	      , expected: expected
	      , operator: operator
	    }, assert.fail);
	  };
	
	  /**
	   * ### .ok(object, [message])
	   *
	   * Asserts that `object` is truthy.
	   *
	   *     assert.ok('everything', 'everything is ok');
	   *     assert.ok(false, 'this will fail');
	   *
	   * @name ok
	   * @param {Mixed} object to test
	   * @param {String} message
	   * @api public
	   */
	
	  assert.ok = function (val, msg) {
	    new Assertion(val, msg).is.ok;
	  };
	
	  /**
	   * ### .notOk(object, [message])
	   *
	   * Asserts that `object` is falsy.
	   *
	   *     assert.notOk('everything', 'this will fail');
	   *     assert.notOk(false, 'this will pass');
	   *
	   * @name notOk
	   * @param {Mixed} object to test
	   * @param {String} message
	   * @api public
	   */
	
	  assert.notOk = function (val, msg) {
	    new Assertion(val, msg).is.not.ok;
	  };
	
	  /**
	   * ### .equal(actual, expected, [message])
	   *
	   * Asserts non-strict equality (`==`) of `actual` and `expected`.
	   *
	   *     assert.equal(3, '3', '== coerces values to strings');
	   *
	   * @name equal
	   * @param {Mixed} actual
	   * @param {Mixed} expected
	   * @param {String} message
	   * @api public
	   */
	
	  assert.equal = function (act, exp, msg) {
	    var test = new Assertion(act, msg, assert.equal);
	
	    test.assert(
	        exp == flag(test, 'object')
	      , 'expected #{this} to equal #{exp}'
	      , 'expected #{this} to not equal #{act}'
	      , exp
	      , act
	    );
	  };
	
	  /**
	   * ### .notEqual(actual, expected, [message])
	   *
	   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
	   *
	   *     assert.notEqual(3, 4, 'these numbers are not equal');
	   *
	   * @name notEqual
	   * @param {Mixed} actual
	   * @param {Mixed} expected
	   * @param {String} message
	   * @api public
	   */
	
	  assert.notEqual = function (act, exp, msg) {
	    var test = new Assertion(act, msg, assert.notEqual);
	
	    test.assert(
	        exp != flag(test, 'object')
	      , 'expected #{this} to not equal #{exp}'
	      , 'expected #{this} to equal #{act}'
	      , exp
	      , act
	    );
	  };
	
	  /**
	   * ### .strictEqual(actual, expected, [message])
	   *
	   * Asserts strict equality (`===`) of `actual` and `expected`.
	   *
	   *     assert.strictEqual(true, true, 'these booleans are strictly equal');
	   *
	   * @name strictEqual
	   * @param {Mixed} actual
	   * @param {Mixed} expected
	   * @param {String} message
	   * @api public
	   */
	
	  assert.strictEqual = function (act, exp, msg) {
	    new Assertion(act, msg).to.equal(exp);
	  };
	
	  /**
	   * ### .notStrictEqual(actual, expected, [message])
	   *
	   * Asserts strict inequality (`!==`) of `actual` and `expected`.
	   *
	   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');
	   *
	   * @name notStrictEqual
	   * @param {Mixed} actual
	   * @param {Mixed} expected
	   * @param {String} message
	   * @api public
	   */
	
	  assert.notStrictEqual = function (act, exp, msg) {
	    new Assertion(act, msg).to.not.equal(exp);
	  };
	
	  /**
	   * ### .deepEqual(actual, expected, [message])
	   *
	   * Asserts that `actual` is deeply equal to `expected`.
	   *
	   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });
	   *
	   * @name deepEqual
	   * @param {Mixed} actual
	   * @param {Mixed} expected
	   * @param {String} message
	   * @api public
	   */
	
	  assert.deepEqual = function (act, exp, msg) {
	    new Assertion(act, msg).to.eql(exp);
	  };
	
	  /**
	   * ### .notDeepEqual(actual, expected, [message])
	   *
	   * Assert that `actual` is not deeply equal to `expected`.
	   *
	   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });
	   *
	   * @name notDeepEqual
	   * @param {Mixed} actual
	   * @param {Mixed} expected
	   * @param {String} message
	   * @api public
	   */
	
	  assert.notDeepEqual = function (act, exp, msg) {
	    new Assertion(act, msg).to.not.eql(exp);
	  };
	
	  /**
	   * ### .isTrue(value, [message])
	   *
	   * Asserts that `value` is true.
	   *
	   *     var teaServed = true;
	   *     assert.isTrue(teaServed, 'the tea has been served');
	   *
	   * @name isTrue
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isAbove = function (val, abv, msg) {
	    new Assertion(val, msg).to.be.above(abv);
	  };
	
	   /**
	   * ### .isAbove(valueToCheck, valueToBeAbove, [message])
	   *
	   * Asserts `valueToCheck` is strictly greater than (>) `valueToBeAbove`
	   *
	   *     assert.isAbove(5, 2, '5 is strictly greater than 2');
	   *
	   * @name isAbove
	   * @param {Mixed} valueToCheck
	   * @param {Mixed} valueToBeAbove
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isBelow = function (val, blw, msg) {
	    new Assertion(val, msg).to.be.below(blw);
	  };
	
	   /**
	   * ### .isBelow(valueToCheck, valueToBeBelow, [message])
	   *
	   * Asserts `valueToCheck` is strictly less than (<) `valueToBeBelow`
	   *
	   *     assert.isBelow(3, 6, '3 is strictly less than 6');
	   *
	   * @name isBelow
	   * @param {Mixed} valueToCheck
	   * @param {Mixed} valueToBeBelow
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isTrue = function (val, msg) {
	    new Assertion(val, msg).is['true'];
	  };
	
	  /**
	   * ### .isFalse(value, [message])
	   *
	   * Asserts that `value` is false.
	   *
	   *     var teaServed = false;
	   *     assert.isFalse(teaServed, 'no tea yet? hmm...');
	   *
	   * @name isFalse
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isFalse = function (val, msg) {
	    new Assertion(val, msg).is['false'];
	  };
	
	  /**
	   * ### .isNull(value, [message])
	   *
	   * Asserts that `value` is null.
	   *
	   *     assert.isNull(err, 'there was no error');
	   *
	   * @name isNull
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isNull = function (val, msg) {
	    new Assertion(val, msg).to.equal(null);
	  };
	
	  /**
	   * ### .isNotNull(value, [message])
	   *
	   * Asserts that `value` is not null.
	   *
	   *     var tea = 'tasty chai';
	   *     assert.isNotNull(tea, 'great, time for tea!');
	   *
	   * @name isNotNull
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isNotNull = function (val, msg) {
	    new Assertion(val, msg).to.not.equal(null);
	  };
	
	  /**
	   * ### .isUndefined(value, [message])
	   *
	   * Asserts that `value` is `undefined`.
	   *
	   *     var tea;
	   *     assert.isUndefined(tea, 'no tea defined');
	   *
	   * @name isUndefined
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isUndefined = function (val, msg) {
	    new Assertion(val, msg).to.equal(undefined);
	  };
	
	  /**
	   * ### .isDefined(value, [message])
	   *
	   * Asserts that `value` is not `undefined`.
	   *
	   *     var tea = 'cup of chai';
	   *     assert.isDefined(tea, 'tea has been defined');
	   *
	   * @name isDefined
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isDefined = function (val, msg) {
	    new Assertion(val, msg).to.not.equal(undefined);
	  };
	
	  /**
	   * ### .isFunction(value, [message])
	   *
	   * Asserts that `value` is a function.
	   *
	   *     function serveTea() { return 'cup of tea'; };
	   *     assert.isFunction(serveTea, 'great, we can have tea now');
	   *
	   * @name isFunction
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isFunction = function (val, msg) {
	    new Assertion(val, msg).to.be.a('function');
	  };
	
	  /**
	   * ### .isNotFunction(value, [message])
	   *
	   * Asserts that `value` is _not_ a function.
	   *
	   *     var serveTea = [ 'heat', 'pour', 'sip' ];
	   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');
	   *
	   * @name isNotFunction
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isNotFunction = function (val, msg) {
	    new Assertion(val, msg).to.not.be.a('function');
	  };
	
	  /**
	   * ### .isObject(value, [message])
	   *
	   * Asserts that `value` is an object (as revealed by
	   * `Object.prototype.toString`).
	   *
	   *     var selection = { name: 'Chai', serve: 'with spices' };
	   *     assert.isObject(selection, 'tea selection is an object');
	   *
	   * @name isObject
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isObject = function (val, msg) {
	    new Assertion(val, msg).to.be.a('object');
	  };
	
	  /**
	   * ### .isNotObject(value, [message])
	   *
	   * Asserts that `value` is _not_ an object.
	   *
	   *     var selection = 'chai'
	   *     assert.isNotObject(selection, 'tea selection is not an object');
	   *     assert.isNotObject(null, 'null is not an object');
	   *
	   * @name isNotObject
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isNotObject = function (val, msg) {
	    new Assertion(val, msg).to.not.be.a('object');
	  };
	
	  /**
	   * ### .isArray(value, [message])
	   *
	   * Asserts that `value` is an array.
	   *
	   *     var menu = [ 'green', 'chai', 'oolong' ];
	   *     assert.isArray(menu, 'what kind of tea do we want?');
	   *
	   * @name isArray
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isArray = function (val, msg) {
	    new Assertion(val, msg).to.be.an('array');
	  };
	
	  /**
	   * ### .isNotArray(value, [message])
	   *
	   * Asserts that `value` is _not_ an array.
	   *
	   *     var menu = 'green|chai|oolong';
	   *     assert.isNotArray(menu, 'what kind of tea do we want?');
	   *
	   * @name isNotArray
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isNotArray = function (val, msg) {
	    new Assertion(val, msg).to.not.be.an('array');
	  };
	
	  /**
	   * ### .isString(value, [message])
	   *
	   * Asserts that `value` is a string.
	   *
	   *     var teaOrder = 'chai';
	   *     assert.isString(teaOrder, 'order placed');
	   *
	   * @name isString
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isString = function (val, msg) {
	    new Assertion(val, msg).to.be.a('string');
	  };
	
	  /**
	   * ### .isNotString(value, [message])
	   *
	   * Asserts that `value` is _not_ a string.
	   *
	   *     var teaOrder = 4;
	   *     assert.isNotString(teaOrder, 'order placed');
	   *
	   * @name isNotString
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isNotString = function (val, msg) {
	    new Assertion(val, msg).to.not.be.a('string');
	  };
	
	  /**
	   * ### .isNumber(value, [message])
	   *
	   * Asserts that `value` is a number.
	   *
	   *     var cups = 2;
	   *     assert.isNumber(cups, 'how many cups');
	   *
	   * @name isNumber
	   * @param {Number} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isNumber = function (val, msg) {
	    new Assertion(val, msg).to.be.a('number');
	  };
	
	  /**
	   * ### .isNotNumber(value, [message])
	   *
	   * Asserts that `value` is _not_ a number.
	   *
	   *     var cups = '2 cups please';
	   *     assert.isNotNumber(cups, 'how many cups');
	   *
	   * @name isNotNumber
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isNotNumber = function (val, msg) {
	    new Assertion(val, msg).to.not.be.a('number');
	  };
	
	  /**
	   * ### .isBoolean(value, [message])
	   *
	   * Asserts that `value` is a boolean.
	   *
	   *     var teaReady = true
	   *       , teaServed = false;
	   *
	   *     assert.isBoolean(teaReady, 'is the tea ready');
	   *     assert.isBoolean(teaServed, 'has tea been served');
	   *
	   * @name isBoolean
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isBoolean = function (val, msg) {
	    new Assertion(val, msg).to.be.a('boolean');
	  };
	
	  /**
	   * ### .isNotBoolean(value, [message])
	   *
	   * Asserts that `value` is _not_ a boolean.
	   *
	   *     var teaReady = 'yep'
	   *       , teaServed = 'nope';
	   *
	   *     assert.isNotBoolean(teaReady, 'is the tea ready');
	   *     assert.isNotBoolean(teaServed, 'has tea been served');
	   *
	   * @name isNotBoolean
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.isNotBoolean = function (val, msg) {
	    new Assertion(val, msg).to.not.be.a('boolean');
	  };
	
	  /**
	   * ### .typeOf(value, name, [message])
	   *
	   * Asserts that `value`'s type is `name`, as determined by
	   * `Object.prototype.toString`.
	   *
	   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');
	   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');
	   *     assert.typeOf('tea', 'string', 'we have a string');
	   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');
	   *     assert.typeOf(null, 'null', 'we have a null');
	   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');
	   *
	   * @name typeOf
	   * @param {Mixed} value
	   * @param {String} name
	   * @param {String} message
	   * @api public
	   */
	
	  assert.typeOf = function (val, type, msg) {
	    new Assertion(val, msg).to.be.a(type);
	  };
	
	  /**
	   * ### .notTypeOf(value, name, [message])
	   *
	   * Asserts that `value`'s type is _not_ `name`, as determined by
	   * `Object.prototype.toString`.
	   *
	   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');
	   *
	   * @name notTypeOf
	   * @param {Mixed} value
	   * @param {String} typeof name
	   * @param {String} message
	   * @api public
	   */
	
	  assert.notTypeOf = function (val, type, msg) {
	    new Assertion(val, msg).to.not.be.a(type);
	  };
	
	  /**
	   * ### .instanceOf(object, constructor, [message])
	   *
	   * Asserts that `value` is an instance of `constructor`.
	   *
	   *     var Tea = function (name) { this.name = name; }
	   *       , chai = new Tea('chai');
	   *
	   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');
	   *
	   * @name instanceOf
	   * @param {Object} object
	   * @param {Constructor} constructor
	   * @param {String} message
	   * @api public
	   */
	
	  assert.instanceOf = function (val, type, msg) {
	    new Assertion(val, msg).to.be.instanceOf(type);
	  };
	
	  /**
	   * ### .notInstanceOf(object, constructor, [message])
	   *
	   * Asserts `value` is not an instance of `constructor`.
	   *
	   *     var Tea = function (name) { this.name = name; }
	   *       , chai = new String('chai');
	   *
	   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');
	   *
	   * @name notInstanceOf
	   * @param {Object} object
	   * @param {Constructor} constructor
	   * @param {String} message
	   * @api public
	   */
	
	  assert.notInstanceOf = function (val, type, msg) {
	    new Assertion(val, msg).to.not.be.instanceOf(type);
	  };
	
	  /**
	   * ### .include(haystack, needle, [message])
	   *
	   * Asserts that `haystack` includes `needle`. Works
	   * for strings and arrays.
	   *
	   *     assert.include('foobar', 'bar', 'foobar contains string "bar"');
	   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');
	   *
	   * @name include
	   * @param {Array|String} haystack
	   * @param {Mixed} needle
	   * @param {String} message
	   * @api public
	   */
	
	  assert.include = function (exp, inc, msg) {
	    new Assertion(exp, msg, assert.include).include(inc);
	  };
	
	  /**
	   * ### .notInclude(haystack, needle, [message])
	   *
	   * Asserts that `haystack` does not include `needle`. Works
	   * for strings and arrays.
	   *i
	   *     assert.notInclude('foobar', 'baz', 'string not include substring');
	   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');
	   *
	   * @name notInclude
	   * @param {Array|String} haystack
	   * @param {Mixed} needle
	   * @param {String} message
	   * @api public
	   */
	
	  assert.notInclude = function (exp, inc, msg) {
	    new Assertion(exp, msg, assert.notInclude).not.include(inc);
	  };
	
	  /**
	   * ### .match(value, regexp, [message])
	   *
	   * Asserts that `value` matches the regular expression `regexp`.
	   *
	   *     assert.match('foobar', /^foo/, 'regexp matches');
	   *
	   * @name match
	   * @param {Mixed} value
	   * @param {RegExp} regexp
	   * @param {String} message
	   * @api public
	   */
	
	  assert.match = function (exp, re, msg) {
	    new Assertion(exp, msg).to.match(re);
	  };
	
	  /**
	   * ### .notMatch(value, regexp, [message])
	   *
	   * Asserts that `value` does not match the regular expression `regexp`.
	   *
	   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');
	   *
	   * @name notMatch
	   * @param {Mixed} value
	   * @param {RegExp} regexp
	   * @param {String} message
	   * @api public
	   */
	
	  assert.notMatch = function (exp, re, msg) {
	    new Assertion(exp, msg).to.not.match(re);
	  };
	
	  /**
	   * ### .property(object, property, [message])
	   *
	   * Asserts that `object` has a property named by `property`.
	   *
	   *     assert.property({ tea: { green: 'matcha' }}, 'tea');
	   *
	   * @name property
	   * @param {Object} object
	   * @param {String} property
	   * @param {String} message
	   * @api public
	   */
	
	  assert.property = function (obj, prop, msg) {
	    new Assertion(obj, msg).to.have.property(prop);
	  };
	
	  /**
	   * ### .notProperty(object, property, [message])
	   *
	   * Asserts that `object` does _not_ have a property named by `property`.
	   *
	   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');
	   *
	   * @name notProperty
	   * @param {Object} object
	   * @param {String} property
	   * @param {String} message
	   * @api public
	   */
	
	  assert.notProperty = function (obj, prop, msg) {
	    new Assertion(obj, msg).to.not.have.property(prop);
	  };
	
	  /**
	   * ### .deepProperty(object, property, [message])
	   *
	   * Asserts that `object` has a property named by `property`, which can be a
	   * string using dot- and bracket-notation for deep reference.
	   *
	   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');
	   *
	   * @name deepProperty
	   * @param {Object} object
	   * @param {String} property
	   * @param {String} message
	   * @api public
	   */
	
	  assert.deepProperty = function (obj, prop, msg) {
	    new Assertion(obj, msg).to.have.deep.property(prop);
	  };
	
	  /**
	   * ### .notDeepProperty(object, property, [message])
	   *
	   * Asserts that `object` does _not_ have a property named by `property`, which
	   * can be a string using dot- and bracket-notation for deep reference.
	   *
	   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');
	   *
	   * @name notDeepProperty
	   * @param {Object} object
	   * @param {String} property
	   * @param {String} message
	   * @api public
	   */
	
	  assert.notDeepProperty = function (obj, prop, msg) {
	    new Assertion(obj, msg).to.not.have.deep.property(prop);
	  };
	
	  /**
	   * ### .propertyVal(object, property, value, [message])
	   *
	   * Asserts that `object` has a property named by `property` with value given
	   * by `value`.
	   *
	   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');
	   *
	   * @name propertyVal
	   * @param {Object} object
	   * @param {String} property
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.propertyVal = function (obj, prop, val, msg) {
	    new Assertion(obj, msg).to.have.property(prop, val);
	  };
	
	  /**
	   * ### .propertyNotVal(object, property, value, [message])
	   *
	   * Asserts that `object` has a property named by `property`, but with a value
	   * different from that given by `value`.
	   *
	   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');
	   *
	   * @name propertyNotVal
	   * @param {Object} object
	   * @param {String} property
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.propertyNotVal = function (obj, prop, val, msg) {
	    new Assertion(obj, msg).to.not.have.property(prop, val);
	  };
	
	  /**
	   * ### .deepPropertyVal(object, property, value, [message])
	   *
	   * Asserts that `object` has a property named by `property` with value given
	   * by `value`. `property` can use dot- and bracket-notation for deep
	   * reference.
	   *
	   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');
	   *
	   * @name deepPropertyVal
	   * @param {Object} object
	   * @param {String} property
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.deepPropertyVal = function (obj, prop, val, msg) {
	    new Assertion(obj, msg).to.have.deep.property(prop, val);
	  };
	
	  /**
	   * ### .deepPropertyNotVal(object, property, value, [message])
	   *
	   * Asserts that `object` has a property named by `property`, but with a value
	   * different from that given by `value`. `property` can use dot- and
	   * bracket-notation for deep reference.
	   *
	   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');
	   *
	   * @name deepPropertyNotVal
	   * @param {Object} object
	   * @param {String} property
	   * @param {Mixed} value
	   * @param {String} message
	   * @api public
	   */
	
	  assert.deepPropertyNotVal = function (obj, prop, val, msg) {
	    new Assertion(obj, msg).to.not.have.deep.property(prop, val);
	  };
	
	  /**
	   * ### .lengthOf(object, length, [message])
	   *
	   * Asserts that `object` has a `length` property with the expected value.
	   *
	   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');
	   *     assert.lengthOf('foobar', 5, 'string has length of 6');
	   *
	   * @name lengthOf
	   * @param {Mixed} object
	   * @param {Number} length
	   * @param {String} message
	   * @api public
	   */
	
	  assert.lengthOf = function (exp, len, msg) {
	    new Assertion(exp, msg).to.have.length(len);
	  };
	
	  /**
	   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])
	   *
	   * Asserts that `function` will throw an error that is an instance of
	   * `constructor`, or alternately that it will throw an error with message
	   * matching `regexp`.
	   *
	   *     assert.throw(fn, 'function throws a reference error');
	   *     assert.throw(fn, /function throws a reference error/);
	   *     assert.throw(fn, ReferenceError);
	   *     assert.throw(fn, ReferenceError, 'function throws a reference error');
	   *     assert.throw(fn, ReferenceError, /function throws a reference error/);
	   *
	   * @name throws
	   * @alias throw
	   * @alias Throw
	   * @param {Function} function
	   * @param {ErrorConstructor} constructor
	   * @param {RegExp} regexp
	   * @param {String} message
	   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
	   * @api public
	   */
	
	  assert.Throw = function (fn, errt, errs, msg) {
	    if ('string' === typeof errt || errt instanceof RegExp) {
	      errs = errt;
	      errt = null;
	    }
	
	    var assertErr = new Assertion(fn, msg).to.Throw(errt, errs);
	    return flag(assertErr, 'object');
	  };
	
	  /**
	   * ### .doesNotThrow(function, [constructor/regexp], [message])
	   *
	   * Asserts that `function` will _not_ throw an error that is an instance of
	   * `constructor`, or alternately that it will not throw an error with message
	   * matching `regexp`.
	   *
	   *     assert.doesNotThrow(fn, Error, 'function does not throw');
	   *
	   * @name doesNotThrow
	   * @param {Function} function
	   * @param {ErrorConstructor} constructor
	   * @param {RegExp} regexp
	   * @param {String} message
	   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
	   * @api public
	   */
	
	  assert.doesNotThrow = function (fn, type, msg) {
	    if ('string' === typeof type) {
	      msg = type;
	      type = null;
	    }
	
	    new Assertion(fn, msg).to.not.Throw(type);
	  };
	
	  /**
	   * ### .operator(val1, operator, val2, [message])
	   *
	   * Compares two values using `operator`.
	   *
	   *     assert.operator(1, '<', 2, 'everything is ok');
	   *     assert.operator(1, '>', 2, 'this will fail');
	   *
	   * @name operator
	   * @param {Mixed} val1
	   * @param {String} operator
	   * @param {Mixed} val2
	   * @param {String} message
	   * @api public
	   */
	
	  assert.operator = function (val, operator, val2, msg) {
	    if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {
	      throw new Error('Invalid operator "' + operator + '"');
	    }
	    var test = new Assertion(eval(val + operator + val2), msg);
	    test.assert(
	        true === flag(test, 'object')
	      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
	      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
	  };
	
	  /**
	   * ### .closeTo(actual, expected, delta, [message])
	   *
	   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
	   *
	   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');
	   *
	   * @name closeTo
	   * @param {Number} actual
	   * @param {Number} expected
	   * @param {Number} delta
	   * @param {String} message
	   * @api public
	   */
	
	  assert.closeTo = function (act, exp, delta, msg) {
	    new Assertion(act, msg).to.be.closeTo(exp, delta);
	  };
	
	  /**
	   * ### .sameMembers(set1, set2, [message])
	   *
	   * Asserts that `set1` and `set2` have the same members.
	   * Order is not taken into account.
	   *
	   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');
	   *
	   * @name sameMembers
	   * @param {Array} set1
	   * @param {Array} set2
	   * @param {String} message
	   * @api public
	   */
	
	  assert.sameMembers = function (set1, set2, msg) {
	    new Assertion(set1, msg).to.have.same.members(set2);
	  }
	
	  /**
	   * ### .sameDeepMembers(set1, set2, [message])
	   *
	   * Asserts that `set1` and `set2` have the same members - using a deep equality checking.
	   * Order is not taken into account.
	   *
	   *     assert.sameDeepMembers([ {b: 3}, {a: 2}, {c: 5} ], [ {c: 5}, {b: 3}, {a: 2} ], 'same deep members');
	   *
	   * @name sameDeepMembers
	   * @param {Array} set1
	   * @param {Array} set2
	   * @param {String} message
	   * @api public
	   */
	
	  assert.sameDeepMembers = function (set1, set2, msg) {
	    new Assertion(set1, msg).to.have.same.deep.members(set2);
	  }
	
	  /**
	   * ### .includeMembers(superset, subset, [message])
	   *
	   * Asserts that `subset` is included in `superset`.
	   * Order is not taken into account.
	   *
	   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');
	   *
	   * @name includeMembers
	   * @param {Array} superset
	   * @param {Array} subset
	   * @param {String} message
	   * @api public
	   */
	
	  assert.includeMembers = function (superset, subset, msg) {
	    new Assertion(superset, msg).to.include.members(subset);
	  }
	
	   /**
	   * ### .changes(function, object, property)
	   *
	   * Asserts that a function changes the value of a property
	   *
	   *     var obj = { val: 10 };
	   *     var fn = function() { obj.val = 22 };
	   *     assert.changes(fn, obj, 'val');
	   *
	   * @name changes
	   * @param {Function} modifier function
	   * @param {Object} object
	   * @param {String} property name
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  assert.changes = function (fn, obj, prop) {
	    new Assertion(fn).to.change(obj, prop);
	  }
	
	   /**
	   * ### .doesNotChange(function, object, property)
	   *
	   * Asserts that a function does not changes the value of a property
	   *
	   *     var obj = { val: 10 };
	   *     var fn = function() { console.log('foo'); };
	   *     assert.doesNotChange(fn, obj, 'val');
	   *
	   * @name doesNotChange
	   * @param {Function} modifier function
	   * @param {Object} object
	   * @param {String} property name
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  assert.doesNotChange = function (fn, obj, prop) {
	    new Assertion(fn).to.not.change(obj, prop);
	  }
	
	   /**
	   * ### .increases(function, object, property)
	   *
	   * Asserts that a function increases an object property
	   *
	   *     var obj = { val: 10 };
	   *     var fn = function() { obj.val = 13 };
	   *     assert.increases(fn, obj, 'val');
	   *
	   * @name increases
	   * @param {Function} modifier function
	   * @param {Object} object
	   * @param {String} property name
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  assert.increases = function (fn, obj, prop) {
	    new Assertion(fn).to.increase(obj, prop);
	  }
	
	   /**
	   * ### .doesNotIncrease(function, object, property)
	   *
	   * Asserts that a function does not increase object property
	   *
	   *     var obj = { val: 10 };
	   *     var fn = function() { obj.val = 8 };
	   *     assert.doesNotIncrease(fn, obj, 'val');
	   *
	   * @name doesNotIncrease
	   * @param {Function} modifier function
	   * @param {Object} object
	   * @param {String} property name
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  assert.doesNotIncrease = function (fn, obj, prop) {
	    new Assertion(fn).to.not.increase(obj, prop);
	  }
	
	   /**
	   * ### .decreases(function, object, property)
	   *
	   * Asserts that a function decreases an object property
	   *
	   *     var obj = { val: 10 };
	   *     var fn = function() { obj.val = 5 };
	   *     assert.decreases(fn, obj, 'val');
	   *
	   * @name decreases
	   * @param {Function} modifier function
	   * @param {Object} object
	   * @param {String} property name
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  assert.decreases = function (fn, obj, prop) {
	    new Assertion(fn).to.decrease(obj, prop);
	  }
	
	   /**
	   * ### .doesNotDecrease(function, object, property)
	   *
	   * Asserts that a function does not decreases an object property
	   *
	   *     var obj = { val: 10 };
	   *     var fn = function() { obj.val = 15 };
	   *     assert.doesNotDecrease(fn, obj, 'val');
	   *
	   * @name doesNotDecrease
	   * @param {Function} modifier function
	   * @param {Object} object
	   * @param {String} property name
	   * @param {String} message _optional_
	   * @api public
	   */
	
	  assert.doesNotDecrease = function (fn, obj, prop) {
	    new Assertion(fn).to.not.decrease(obj, prop);
	  }
	
	  /*!
	   * Undocumented / untested
	   */
	
	  assert.ifError = function (val, msg) {
	    new Assertion(val, msg).to.not.be.ok;
	  };
	
	  /*!
	   * Aliases.
	   */
	
	  (function alias(name, as){
	    assert[as] = assert[name];
	    return alias;
	  })
	  ('Throw', 'throw')
	  ('Throw', 'throws');
	};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * chai
	 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/*!
	 * Main exports
	 */
	
	var exports = module.exports = {};
	
	/*!
	 * test utility
	 */
	
	exports.test = __webpack_require__(40);
	
	/*!
	 * type utility
	 */
	
	exports.type = __webpack_require__(41);
	
	/*!
	 * message utility
	 */
	
	exports.getMessage = __webpack_require__(42);
	
	/*!
	 * actual utility
	 */
	
	exports.getActual = __webpack_require__(43);
	
	/*!
	 * Inspect util
	 */
	
	exports.inspect = __webpack_require__(44);
	
	/*!
	 * Object Display util
	 */
	
	exports.objDisplay = __webpack_require__(45);
	
	/*!
	 * Flag utility
	 */
	
	exports.flag = __webpack_require__(46);
	
	/*!
	 * Flag transferring utility
	 */
	
	exports.transferFlags = __webpack_require__(47);
	
	/*!
	 * Deep equal utility
	 */
	
	exports.eql = __webpack_require__(58);
	
	/*!
	 * Deep path value
	 */
	
	exports.getPathValue = __webpack_require__(48);
	
	/*!
	 * Deep path info
	 */
	
	exports.getPathInfo = __webpack_require__(49);
	
	/*!
	 * Check if a property exists
	 */
	
	exports.hasProperty = __webpack_require__(50);
	
	/*!
	 * Function name
	 */
	
	exports.getName = __webpack_require__(51);
	
	/*!
	 * add Property
	 */
	
	exports.addProperty = __webpack_require__(52);
	
	/*!
	 * add Method
	 */
	
	exports.addMethod = __webpack_require__(53);
	
	/*!
	 * overwrite Property
	 */
	
	exports.overwriteProperty = __webpack_require__(54);
	
	/*!
	 * overwrite Method
	 */
	
	exports.overwriteMethod = __webpack_require__(55);
	
	/*!
	 * Add a chainable method
	 */
	
	exports.addChainableMethod = __webpack_require__(56);
	
	/*!
	 * Overwrite chainable method
	 */
	
	exports.overwriteChainableMethod = __webpack_require__(57);
	


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * assertion-error
	 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
	 * MIT Licensed
	 */
	
	/*!
	 * Return a function that will copy properties from
	 * one object to another excluding any originally
	 * listed. Returned function will create a new `{}`.
	 *
	 * @param {String} excluded properties ...
	 * @return {Function}
	 */
	
	function exclude () {
	  var excludes = [].slice.call(arguments);
	
	  function excludeProps (res, obj) {
	    Object.keys(obj).forEach(function (key) {
	      if (!~excludes.indexOf(key)) res[key] = obj[key];
	    });
	  }
	
	  return function extendExclude () {
	    var args = [].slice.call(arguments)
	      , i = 0
	      , res = {};
	
	    for (; i < args.length; i++) {
	      excludeProps(res, args[i]);
	    }
	
	    return res;
	  };
	};
	
	/*!
	 * Primary Exports
	 */
	
	module.exports = AssertionError;
	
	/**
	 * ### AssertionError
	 *
	 * An extension of the JavaScript `Error` constructor for
	 * assertion and validation scenarios.
	 *
	 * @param {String} message
	 * @param {Object} properties to include (optional)
	 * @param {callee} start stack function (optional)
	 */
	
	function AssertionError (message, _props, ssf) {
	  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')
	    , props = extend(_props || {});
	
	  // default values
	  this.message = message || 'Unspecified AssertionError';
	  this.showDiff = false;
	
	  // copy from properties
	  for (var key in props) {
	    this[key] = props[key];
	  }
	
	  // capture stack trace
	  ssf = ssf || arguments.callee;
	  if (ssf && Error.captureStackTrace) {
	    Error.captureStackTrace(this, ssf);
	  }
	}
	
	/*!
	 * Inherit from Error.prototype
	 */
	
	AssertionError.prototype = Object.create(Error.prototype);
	
	/*!
	 * Statically set name
	 */
	
	AssertionError.prototype.name = 'AssertionError';
	
	/*!
	 * Ensure correct constructor
	 */
	
	AssertionError.prototype.constructor = AssertionError;
	
	/**
	 * Allow errors to be converted to JSON for static transfer.
	 *
	 * @param {Boolean} include stack (default: `true`)
	 * @return {Object} object that can be `JSON.stringify`
	 */
	
	AssertionError.prototype.toJSON = function (stack) {
	  var extend = exclude('constructor', 'toJSON', 'stack')
	    , props = extend({ name: this.name }, this);
	
	  // include stack if exists and not turned off
	  if (false !== stack && this.stack) {
	    props.stack = this.stack;
	  }
	
	  return props;
	};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - test utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/*!
	 * Module dependancies
	 */
	
	var flag = __webpack_require__(46);
	
	/**
	 * # test(object, expression)
	 *
	 * Test and object for expression.
	 *
	 * @param {Object} object (constructed Assertion)
	 * @param {Arguments} chai.Assertion.prototype.assert arguments
	 */
	
	module.exports = function (obj, args) {
	  var negate = flag(obj, 'negate')
	    , expr = args[0];
	  return negate ? !expr : expr;
	};


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - type utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/*!
	 * Detectable javascript natives
	 */
	
	var natives = {
	    '[object Arguments]': 'arguments'
	  , '[object Array]': 'array'
	  , '[object Date]': 'date'
	  , '[object Function]': 'function'
	  , '[object Number]': 'number'
	  , '[object RegExp]': 'regexp'
	  , '[object String]': 'string'
	};
	
	/**
	 * ### type(object)
	 *
	 * Better implementation of `typeof` detection that can
	 * be used cross-browser. Handles the inconsistencies of
	 * Array, `null`, and `undefined` detection.
	 *
	 *     utils.type({}) // 'object'
	 *     utils.type(null) // `null'
	 *     utils.type(undefined) // `undefined`
	 *     utils.type([]) // `array`
	 *
	 * @param {Mixed} object to detect type of
	 * @name type
	 * @api private
	 */
	
	module.exports = function (obj) {
	  var str = Object.prototype.toString.call(obj);
	  if (natives[str]) return natives[str];
	  if (obj === null) return 'null';
	  if (obj === undefined) return 'undefined';
	  if (obj === Object(obj)) return 'object';
	  return typeof obj;
	};


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - message composition utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/*!
	 * Module dependancies
	 */
	
	var flag = __webpack_require__(46)
	  , getActual = __webpack_require__(43)
	  , inspect = __webpack_require__(44)
	  , objDisplay = __webpack_require__(45);
	
	/**
	 * ### .getMessage(object, message, negateMessage)
	 *
	 * Construct the error message based on flags
	 * and template tags. Template tags will return
	 * a stringified inspection of the object referenced.
	 *
	 * Message template tags:
	 * - `#{this}` current asserted object
	 * - `#{act}` actual value
	 * - `#{exp}` expected value
	 *
	 * @param {Object} object (constructed Assertion)
	 * @param {Arguments} chai.Assertion.prototype.assert arguments
	 * @name getMessage
	 * @api public
	 */
	
	module.exports = function (obj, args) {
	  var negate = flag(obj, 'negate')
	    , val = flag(obj, 'object')
	    , expected = args[3]
	    , actual = getActual(obj, args)
	    , msg = negate ? args[2] : args[1]
	    , flagMsg = flag(obj, 'message');
	
	  if(typeof msg === "function") msg = msg();
	  msg = msg || '';
	  msg = msg
	    .replace(/#{this}/g, objDisplay(val))
	    .replace(/#{act}/g, objDisplay(actual))
	    .replace(/#{exp}/g, objDisplay(expected));
	
	  return flagMsg ? flagMsg + ': ' + msg : msg;
	};


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - getActual utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/**
	 * # getActual(object, [actual])
	 *
	 * Returns the `actual` value for an Assertion
	 *
	 * @param {Object} object (constructed Assertion)
	 * @param {Arguments} chai.Assertion.prototype.assert arguments
	 */
	
	module.exports = function (obj, args) {
	  return args.length > 4 ? args[4] : obj._obj;
	};


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	// This is (almost) directly from Node.js utils
	// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js
	
	var getName = __webpack_require__(51);
	var getProperties = __webpack_require__(59);
	var getEnumerableProperties = __webpack_require__(60);
	
	module.exports = inspect;
	
	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
	 *    properties of objects.
	 * @param {Number} depth Depth in which to descend in object. Default is 2.
	 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
	 *    output. Default is false (no coloring).
	 */
	function inspect(obj, showHidden, depth, colors) {
	  var ctx = {
	    showHidden: showHidden,
	    seen: [],
	    stylize: function (str) { return str; }
	  };
	  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
	}
	
	// Returns true if object is a DOM element.
	var isDOMElement = function (object) {
	  if (typeof HTMLElement === 'object') {
	    return object instanceof HTMLElement;
	  } else {
	    return object &&
	      typeof object === 'object' &&
	      object.nodeType === 1 &&
	      typeof object.nodeName === 'string';
	  }
	};
	
	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (value && typeof value.inspect === 'function' &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes);
	    if (typeof ret !== 'string') {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }
	
	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }
	
	  // If this is a DOM element, try to get the outer HTML.
	  if (isDOMElement(value)) {
	    if ('outerHTML' in value) {
	      return value.outerHTML;
	      // This value does not have an outerHTML attribute,
	      //   it could still be an XML element
	    } else {
	      // Attempt to serialize it
	      try {
	        if (document.xmlVersion) {
	          var xmlSerializer = new XMLSerializer();
	          return xmlSerializer.serializeToString(value);
	        } else {
	          // Firefox 11- do not support outerHTML
	          //   It does, however, support innerHTML
	          //   Use the following to render the element
	          var ns = "http://www.w3.org/1999/xhtml";
	          var container = document.createElementNS(ns, '_');
	
	          container.appendChild(value.cloneNode(false));
	          html = container.innerHTML
	            .replace('><', '>' + value.innerHTML + '<');
	          container.innerHTML = '';
	          return html;
	        }
	      } catch (err) {
	        // This could be a non-native DOM implementation,
	        //   continue with the normal flow:
	        //   printing the element as if it is an object.
	      }
	    }
	  }
	
	  // Look up the keys of the object.
	  var visibleKeys = getEnumerableProperties(value);
	  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;
	
	  // Some type of object without properties can be shortcutted.
	  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
	  // a `stack` plus `description` property; ignore those for consistency.
	  if (keys.length === 0 || (isError(value) && (
	      (keys.length === 1 && keys[0] === 'stack') ||
	      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
	     ))) {
	    if (typeof value === 'function') {
	      var name = getName(value);
	      var nameSuffix = name ? ': ' + name : '';
	      return ctx.stylize('[Function' + nameSuffix + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }
	
	  var base = '', array = false, braces = ['{', '}'];
	
	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }
	
	  // Make functions say that they are functions
	  if (typeof value === 'function') {
	    var name = getName(value);
	    var nameSuffix = name ? ': ' + name : '';
	    base = ' [Function' + nameSuffix + ']';
	  }
	
	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }
	
	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }
	
	  // Make error with message first say the error
	  if (isError(value)) {
	    return formatError(value);
	  }
	
	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }
	
	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }
	
	  ctx.seen.push(value);
	
	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }
	
	  ctx.seen.pop();
	
	  return reduceToSingleString(output, base, braces);
	}
	
	
	function formatPrimitive(ctx, value) {
	  switch (typeof value) {
	    case 'undefined':
	      return ctx.stylize('undefined', 'undefined');
	
	    case 'string':
	      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                               .replace(/'/g, "\\'")
	                                               .replace(/\\"/g, '"') + '\'';
	      return ctx.stylize(simple, 'string');
	
	    case 'number':
	      if (value === 0 && (1/value) === -Infinity) {
	        return ctx.stylize('-0', 'number');
	      }
	      return ctx.stylize('' + value, 'number');
	
	    case 'boolean':
	      return ctx.stylize('' + value, 'boolean');
	  }
	  // For some reason typeof null is "object", so special case here.
	  if (value === null) {
	    return ctx.stylize('null', 'null');
	  }
	}
	
	
	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}
	
	
	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (Object.prototype.hasOwnProperty.call(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}
	
	
	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str;
	  if (value.__lookupGetter__) {
	    if (value.__lookupGetter__(key)) {
	      if (value.__lookupSetter__(key)) {
	        str = ctx.stylize('[Getter/Setter]', 'special');
	      } else {
	        str = ctx.stylize('[Getter]', 'special');
	      }
	    } else {
	      if (value.__lookupSetter__(key)) {
	        str = ctx.stylize('[Setter]', 'special');
	      }
	    }
	  }
	  if (visibleKeys.indexOf(key) < 0) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(value[key]) < 0) {
	      if (recurseTimes === null) {
	        str = formatValue(ctx, value[key], null);
	      } else {
	        str = formatValue(ctx, value[key], recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (typeof name === 'undefined') {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }
	
	  return name + ': ' + str;
	}
	
	
	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.length + 1;
	  }, 0);
	
	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }
	
	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}
	
	function isArray(ar) {
	  return Array.isArray(ar) ||
	         (typeof ar === 'object' && objectToString(ar) === '[object Array]');
	}
	
	function isRegExp(re) {
	  return typeof re === 'object' && objectToString(re) === '[object RegExp]';
	}
	
	function isDate(d) {
	  return typeof d === 'object' && objectToString(d) === '[object Date]';
	}
	
	function isError(e) {
	  return typeof e === 'object' && objectToString(e) === '[object Error]';
	}
	
	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - flag utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/*!
	 * Module dependancies
	 */
	
	var inspect = __webpack_require__(44);
	var config = __webpack_require__(32);
	
	/**
	 * ### .objDisplay (object)
	 *
	 * Determines if an object or an array matches
	 * criteria to be inspected in-line for error
	 * messages or should be truncated.
	 *
	 * @param {Mixed} javascript object to inspect
	 * @name objDisplay
	 * @api public
	 */
	
	module.exports = function (obj) {
	  var str = inspect(obj)
	    , type = Object.prototype.toString.call(obj);
	
	  if (config.truncateThreshold && str.length >= config.truncateThreshold) {
	    if (type === '[object Function]') {
	      return !obj.name || obj.name === ''
	        ? '[Function]'
	        : '[Function: ' + obj.name + ']';
	    } else if (type === '[object Array]') {
	      return '[ Array(' + obj.length + ') ]';
	    } else if (type === '[object Object]') {
	      var keys = Object.keys(obj)
	        , kstr = keys.length > 2
	          ? keys.splice(0, 2).join(', ') + ', ...'
	          : keys.join(', ');
	      return '{ Object (' + kstr + ') }';
	    } else {
	      return str;
	    }
	  } else {
	    return str;
	  }
	};


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - flag utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/**
	 * ### flag(object, key, [value])
	 *
	 * Get or set a flag value on an object. If a
	 * value is provided it will be set, else it will
	 * return the currently set value or `undefined` if
	 * the value is not set.
	 *
	 *     utils.flag(this, 'foo', 'bar'); // setter
	 *     utils.flag(this, 'foo'); // getter, returns `bar`
	 *
	 * @param {Object} object constructed Assertion
	 * @param {String} key
	 * @param {Mixed} value (optional)
	 * @name flag
	 * @api private
	 */
	
	module.exports = function (obj, key, value) {
	  var flags = obj.__flags || (obj.__flags = Object.create(null));
	  if (arguments.length === 3) {
	    flags[key] = value;
	  } else {
	    return flags[key];
	  }
	};


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - transferFlags utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/**
	 * ### transferFlags(assertion, object, includeAll = true)
	 *
	 * Transfer all the flags for `assertion` to `object`. If
	 * `includeAll` is set to `false`, then the base Chai
	 * assertion flags (namely `object`, `ssfi`, and `message`)
	 * will not be transferred.
	 *
	 *
	 *     var newAssertion = new Assertion();
	 *     utils.transferFlags(assertion, newAssertion);
	 *
	 *     var anotherAsseriton = new Assertion(myObj);
	 *     utils.transferFlags(assertion, anotherAssertion, false);
	 *
	 * @param {Assertion} assertion the assertion to transfer the flags from
	 * @param {Object} object the object to transfer the flags to; usually a new assertion
	 * @param {Boolean} includeAll
	 * @name transferFlags
	 * @api private
	 */
	
	module.exports = function (assertion, object, includeAll) {
	  var flags = assertion.__flags || (assertion.__flags = Object.create(null));
	
	  if (!object.__flags) {
	    object.__flags = Object.create(null);
	  }
	
	  includeAll = arguments.length === 3 ? includeAll : true;
	
	  for (var flag in flags) {
	    if (includeAll ||
	        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
	      object.__flags[flag] = flags[flag];
	    }
	  }
	};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - getPathValue utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * @see https://github.com/logicalparadox/filtr
	 * MIT Licensed
	 */
	
	var getPathInfo = __webpack_require__(49);
	
	/**
	 * ### .getPathValue(path, object)
	 *
	 * This allows the retrieval of values in an
	 * object given a string path.
	 *
	 *     var obj = {
	 *         prop1: {
	 *             arr: ['a', 'b', 'c']
	 *           , str: 'Hello'
	 *         }
	 *       , prop2: {
	 *             arr: [ { nested: 'Universe' } ]
	 *           , str: 'Hello again!'
	 *         }
	 *     }
	 *
	 * The following would be the results.
	 *
	 *     getPathValue('prop1.str', obj); // Hello
	 *     getPathValue('prop1.att[2]', obj); // b
	 *     getPathValue('prop2.arr[0].nested', obj); // Universe
	 *
	 * @param {String} path
	 * @param {Object} object
	 * @returns {Object} value or `undefined`
	 * @name getPathValue
	 * @api public
	 */
	module.exports = function(path, obj) {
	  var info = getPathInfo(path, obj);
	  return info.value;
	}; 


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - getPathInfo utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	var hasProperty = __webpack_require__(50);
	
	/**
	 * ### .getPathInfo(path, object)
	 *
	 * This allows the retrieval of property info in an
	 * object given a string path.
	 *
	 * The path info consists of an object with the
	 * following properties:
	 *
	 * * parent - The parent object of the property referenced by `path`
	 * * name - The name of the final property, a number if it was an array indexer
	 * * value - The value of the property, if it exists, otherwise `undefined`
	 * * exists - Whether the property exists or not
	 *
	 * @param {String} path
	 * @param {Object} object
	 * @returns {Object} info
	 * @name getPathInfo
	 * @api public
	 */
	
	module.exports = function getPathInfo(path, obj) {
	  var parsed = parsePath(path),
	      last = parsed[parsed.length - 1];
	
	  var info = {
	    parent: _getPathValue(parsed, obj, parsed.length - 1),
	    name: last.p || last.i,
	    value: _getPathValue(parsed, obj),
	  };
	  info.exists = hasProperty(info.name, info.parent);
	
	  return info;
	};
	
	
	/*!
	 * ## parsePath(path)
	 *
	 * Helper function used to parse string object
	 * paths. Use in conjunction with `_getPathValue`.
	 *
	 *      var parsed = parsePath('myobject.property.subprop');
	 *
	 * ### Paths:
	 *
	 * * Can be as near infinitely deep and nested
	 * * Arrays are also valid using the formal `myobject.document[3].property`.
	 *
	 * @param {String} path
	 * @returns {Object} parsed
	 * @api private
	 */
	
	function parsePath (path) {
	  var str = path.replace(/\[/g, '.[')
	    , parts = str.match(/(\\\.|[^.]+?)+/g);
	  return parts.map(function (value) {
	    var re = /\[(\d+)\]$/
	      , mArr = re.exec(value);
	    if (mArr) return { i: parseFloat(mArr[1]) };
	    else return { p: value };
	  });
	}
	
	
	/*!
	 * ## _getPathValue(parsed, obj)
	 *
	 * Helper companion function for `.parsePath` that returns
	 * the value located at the parsed address.
	 *
	 *      var value = getPathValue(parsed, obj);
	 *
	 * @param {Object} parsed definition from `parsePath`.
	 * @param {Object} object to search against
	 * @param {Number} object to search against
	 * @returns {Object|Undefined} value
	 * @api private
	 */
	
	function _getPathValue (parsed, obj, index) {
	  var tmp = obj
	    , res;
	
	  index = (index === undefined ? parsed.length : index);
	
	  for (var i = 0, l = index; i < l; i++) {
	    var part = parsed[i];
	    if (tmp) {
	      if ('undefined' !== typeof part.p)
	        tmp = tmp[part.p];
	      else if ('undefined' !== typeof part.i)
	        tmp = tmp[part.i];
	      if (i == (l - 1)) res = tmp;
	    } else {
	      res = undefined;
	    }
	  }
	  return res;
	}


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - hasProperty utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	var type = __webpack_require__(41);
	
	/**
	 * ### .hasProperty(object, name)
	 *
	 * This allows checking whether an object has
	 * named property or numeric array index.
	 *
	 * Basically does the same thing as the `in`
	 * operator but works properly with natives
	 * and null/undefined values.
	 *
	 *     var obj = {
	 *         arr: ['a', 'b', 'c']
	 *       , str: 'Hello'
	 *     }
	 *
	 * The following would be the results.
	 *
	 *     hasProperty('str', obj);  // true
	 *     hasProperty('constructor', obj);  // true
	 *     hasProperty('bar', obj);  // false
	 *     
	 *     hasProperty('length', obj.str); // true
	 *     hasProperty(1, obj.str);  // true
	 *     hasProperty(5, obj.str);  // false
	 *
	 *     hasProperty('length', obj.arr);  // true
	 *     hasProperty(2, obj.arr);  // true
	 *     hasProperty(3, obj.arr);  // false
	 *
	 * @param {Objuect} object
	 * @param {String|Number} name
	 * @returns {Boolean} whether it exists
	 * @name getPathInfo
	 * @api public
	 */
	
	var literals = {
	    'number': Number
	  , 'string': String
	};
	
	module.exports = function hasProperty(name, obj) {
	  var ot = type(obj);
	
	  // Bad Object, obviously no props at all
	  if(ot === 'null' || ot === 'undefined')
	    return false;
	
	  // The `in` operator does not work with certain literals
	  // box these before the check
	  if(literals[ot] && typeof obj !== 'object')
	    obj = new literals[ot](obj);
	
	  return name in obj;
	};


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - getName utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/**
	 * # getName(func)
	 *
	 * Gets the name of a function, in a cross-browser way.
	 *
	 * @param {Function} a function (usually a constructor)
	 */
	
	module.exports = function (func) {
	  if (func.name) return func.name;
	
	  var match = /^\s?function ([^(]*)\(/.exec(func);
	  return match && match[1] ? match[1] : "";
	};


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - addProperty utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/**
	 * ### addProperty (ctx, name, getter)
	 *
	 * Adds a property to the prototype of an object.
	 *
	 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {
	 *       var obj = utils.flag(this, 'object');
	 *       new chai.Assertion(obj).to.be.instanceof(Foo);
	 *     });
	 *
	 * Can also be accessed directly from `chai.Assertion`.
	 *
	 *     chai.Assertion.addProperty('foo', fn);
	 *
	 * Then can be used as any other assertion.
	 *
	 *     expect(myFoo).to.be.foo;
	 *
	 * @param {Object} ctx object to which the property is added
	 * @param {String} name of property to add
	 * @param {Function} getter function to be used for name
	 * @name addProperty
	 * @api public
	 */
	
	module.exports = function (ctx, name, getter) {
	  Object.defineProperty(ctx, name,
	    { get: function () {
	        var result = getter.call(this);
	        return result === undefined ? this : result;
	      }
	    , configurable: true
	  });
	};


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - addMethod utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	var config = __webpack_require__(32);
	
	/**
	 * ### .addMethod (ctx, name, method)
	 *
	 * Adds a method to the prototype of an object.
	 *
	 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {
	 *       var obj = utils.flag(this, 'object');
	 *       new chai.Assertion(obj).to.be.equal(str);
	 *     });
	 *
	 * Can also be accessed directly from `chai.Assertion`.
	 *
	 *     chai.Assertion.addMethod('foo', fn);
	 *
	 * Then can be used as any other assertion.
	 *
	 *     expect(fooStr).to.be.foo('bar');
	 *
	 * @param {Object} ctx object to which the method is added
	 * @param {String} name of method to add
	 * @param {Function} method function to be used for name
	 * @name addMethod
	 * @api public
	 */
	var flag = __webpack_require__(46);
	
	module.exports = function (ctx, name, method) {
	  ctx[name] = function () {
	    var old_ssfi = flag(this, 'ssfi');
	    if (old_ssfi && config.includeStack === false)
	      flag(this, 'ssfi', ctx[name]);
	    var result = method.apply(this, arguments);
	    return result === undefined ? this : result;
	  };
	};


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - overwriteProperty utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/**
	 * ### overwriteProperty (ctx, name, fn)
	 *
	 * Overwites an already existing property getter and provides
	 * access to previous value. Must return function to use as getter.
	 *
	 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {
	 *       return function () {
	 *         var obj = utils.flag(this, 'object');
	 *         if (obj instanceof Foo) {
	 *           new chai.Assertion(obj.name).to.equal('bar');
	 *         } else {
	 *           _super.call(this);
	 *         }
	 *       }
	 *     });
	 *
	 *
	 * Can also be accessed directly from `chai.Assertion`.
	 *
	 *     chai.Assertion.overwriteProperty('foo', fn);
	 *
	 * Then can be used as any other assertion.
	 *
	 *     expect(myFoo).to.be.ok;
	 *
	 * @param {Object} ctx object whose property is to be overwritten
	 * @param {String} name of property to overwrite
	 * @param {Function} getter function that returns a getter function to be used for name
	 * @name overwriteProperty
	 * @api public
	 */
	
	module.exports = function (ctx, name, getter) {
	  var _get = Object.getOwnPropertyDescriptor(ctx, name)
	    , _super = function () {};
	
	  if (_get && 'function' === typeof _get.get)
	    _super = _get.get
	
	  Object.defineProperty(ctx, name,
	    { get: function () {
	        var result = getter(_super).call(this);
	        return result === undefined ? this : result;
	      }
	    , configurable: true
	  });
	};


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - overwriteMethod utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/**
	 * ### overwriteMethod (ctx, name, fn)
	 *
	 * Overwites an already existing method and provides
	 * access to previous function. Must return function
	 * to be used for name.
	 *
	 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {
	 *       return function (str) {
	 *         var obj = utils.flag(this, 'object');
	 *         if (obj instanceof Foo) {
	 *           new chai.Assertion(obj.value).to.equal(str);
	 *         } else {
	 *           _super.apply(this, arguments);
	 *         }
	 *       }
	 *     });
	 *
	 * Can also be accessed directly from `chai.Assertion`.
	 *
	 *     chai.Assertion.overwriteMethod('foo', fn);
	 *
	 * Then can be used as any other assertion.
	 *
	 *     expect(myFoo).to.equal('bar');
	 *
	 * @param {Object} ctx object whose method is to be overwritten
	 * @param {String} name of method to overwrite
	 * @param {Function} method function that returns a function to be used for name
	 * @name overwriteMethod
	 * @api public
	 */
	
	module.exports = function (ctx, name, method) {
	  var _method = ctx[name]
	    , _super = function () { return this; };
	
	  if (_method && 'function' === typeof _method)
	    _super = _method;
	
	  ctx[name] = function () {
	    var result = method(_super).apply(this, arguments);
	    return result === undefined ? this : result;
	  }
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - addChainingMethod utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/*!
	 * Module dependencies
	 */
	
	var transferFlags = __webpack_require__(47);
	var flag = __webpack_require__(46);
	var config = __webpack_require__(32);
	
	/*!
	 * Module variables
	 */
	
	// Check whether `__proto__` is supported
	var hasProtoSupport = '__proto__' in Object;
	
	// Without `__proto__` support, this module will need to add properties to a function.
	// However, some Function.prototype methods cannot be overwritten,
	// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).
	var excludeNames = /^(?:length|name|arguments|caller)$/;
	
	// Cache `Function` properties
	var call  = Function.prototype.call,
	    apply = Function.prototype.apply;
	
	/**
	 * ### addChainableMethod (ctx, name, method, chainingBehavior)
	 *
	 * Adds a method to an object, such that the method can also be chained.
	 *
	 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
	 *       var obj = utils.flag(this, 'object');
	 *       new chai.Assertion(obj).to.be.equal(str);
	 *     });
	 *
	 * Can also be accessed directly from `chai.Assertion`.
	 *
	 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
	 *
	 * The result can then be used as both a method assertion, executing both `method` and
	 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
	 *
	 *     expect(fooStr).to.be.foo('bar');
	 *     expect(fooStr).to.be.foo.equal('foo');
	 *
	 * @param {Object} ctx object to which the method is added
	 * @param {String} name of method to add
	 * @param {Function} method function to be used for `name`, when called
	 * @param {Function} chainingBehavior function to be called every time the property is accessed
	 * @name addChainableMethod
	 * @api public
	 */
	
	module.exports = function (ctx, name, method, chainingBehavior) {
	  if (typeof chainingBehavior !== 'function') {
	    chainingBehavior = function () { };
	  }
	
	  var chainableBehavior = {
	      method: method
	    , chainingBehavior: chainingBehavior
	  };
	
	  // save the methods so we can overwrite them later, if we need to.
	  if (!ctx.__methods) {
	    ctx.__methods = {};
	  }
	  ctx.__methods[name] = chainableBehavior;
	
	  Object.defineProperty(ctx, name,
	    { get: function () {
	        chainableBehavior.chainingBehavior.call(this);
	
	        var assert = function assert() {
	          var old_ssfi = flag(this, 'ssfi');
	          if (old_ssfi && config.includeStack === false)
	            flag(this, 'ssfi', assert);
	          var result = chainableBehavior.method.apply(this, arguments);
	          return result === undefined ? this : result;
	        };
	
	        // Use `__proto__` if available
	        if (hasProtoSupport) {
	          // Inherit all properties from the object by replacing the `Function` prototype
	          var prototype = assert.__proto__ = Object.create(this);
	          // Restore the `call` and `apply` methods from `Function`
	          prototype.call = call;
	          prototype.apply = apply;
	        }
	        // Otherwise, redefine all properties (slow!)
	        else {
	          var asserterNames = Object.getOwnPropertyNames(ctx);
	          asserterNames.forEach(function (asserterName) {
	            if (!excludeNames.test(asserterName)) {
	              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
	              Object.defineProperty(assert, asserterName, pd);
	            }
	          });
	        }
	
	        transferFlags(this, assert);
	        return assert;
	      }
	    , configurable: true
	  });
	};


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - overwriteChainableMethod utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/**
	 * ### overwriteChainableMethod (ctx, name, method, chainingBehavior)
	 *
	 * Overwites an already existing chainable method
	 * and provides access to the previous function or
	 * property.  Must return functions to be used for
	 * name.
	 *
	 *     utils.overwriteChainableMethod(chai.Assertion.prototype, 'length',
	 *       function (_super) {
	 *       }
	 *     , function (_super) {
	 *       }
	 *     );
	 *
	 * Can also be accessed directly from `chai.Assertion`.
	 *
	 *     chai.Assertion.overwriteChainableMethod('foo', fn, fn);
	 *
	 * Then can be used as any other assertion.
	 *
	 *     expect(myFoo).to.have.length(3);
	 *     expect(myFoo).to.have.length.above(3);
	 *
	 * @param {Object} ctx object whose method / property is to be overwritten
	 * @param {String} name of method / property to overwrite
	 * @param {Function} method function that returns a function to be used for name
	 * @param {Function} chainingBehavior function that returns a function to be used for property
	 * @name overwriteChainableMethod
	 * @api public
	 */
	
	module.exports = function (ctx, name, method, chainingBehavior) {
	  var chainableBehavior = ctx.__methods[name];
	
	  var _chainingBehavior = chainableBehavior.chainingBehavior;
	  chainableBehavior.chainingBehavior = function () {
	    var result = chainingBehavior(_chainingBehavior).call(this);
	    return result === undefined ? this : result;
	  };
	
	  var _method = chainableBehavior.method;
	  chainableBehavior.method = function () {
	    var result = method(_method).apply(this, arguments);
	    return result === undefined ? this : result;
	  };
	};


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(61);


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - getProperties utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/**
	 * ### .getProperties(object)
	 *
	 * This allows the retrieval of property names of an object, enumerable or not,
	 * inherited or not.
	 *
	 * @param {Object} object
	 * @returns {Array}
	 * @name getProperties
	 * @api public
	 */
	
	module.exports = function getProperties(object) {
	  var result = Object.getOwnPropertyNames(subject);
	
	  function addProperty(property) {
	    if (result.indexOf(property) === -1) {
	      result.push(property);
	    }
	  }
	
	  var proto = Object.getPrototypeOf(subject);
	  while (proto !== null) {
	    Object.getOwnPropertyNames(proto).forEach(addProperty);
	    proto = Object.getPrototypeOf(proto);
	  }
	
	  return result;
	};


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Chai - getEnumerableProperties utility
	 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/**
	 * ### .getEnumerableProperties(object)
	 *
	 * This allows the retrieval of enumerable property names of an object,
	 * inherited or not.
	 *
	 * @param {Object} object
	 * @returns {Array}
	 * @name getEnumerableProperties
	 * @api public
	 */
	
	module.exports = function getEnumerableProperties(object) {
	  var result = [];
	  for (var name in object) {
	    result.push(name);
	  }
	  return result;
	};


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * deep-eql
	 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/*!
	 * Module dependencies
	 */
	
	var type = __webpack_require__(63);
	
	/*!
	 * Buffer.isBuffer browser shim
	 */
	
	var Buffer;
	try { Buffer = __webpack_require__(62).Buffer; }
	catch(ex) {
	  Buffer = {};
	  Buffer.isBuffer = function() { return false; }
	}
	
	/*!
	 * Primary Export
	 */
	
	module.exports = deepEqual;
	
	/**
	 * Assert super-strict (egal) equality between
	 * two objects of any type.
	 *
	 * @param {Mixed} a
	 * @param {Mixed} b
	 * @param {Array} memoised (optional)
	 * @return {Boolean} equal match
	 */
	
	function deepEqual(a, b, m) {
	  if (sameValue(a, b)) {
	    return true;
	  } else if ('date' === type(a)) {
	    return dateEqual(a, b);
	  } else if ('regexp' === type(a)) {
	    return regexpEqual(a, b);
	  } else if (Buffer.isBuffer(a)) {
	    return bufferEqual(a, b);
	  } else if ('arguments' === type(a)) {
	    return argumentsEqual(a, b, m);
	  } else if (!typeEqual(a, b)) {
	    return false;
	  } else if (('object' !== type(a) && 'object' !== type(b))
	  && ('array' !== type(a) && 'array' !== type(b))) {
	    return sameValue(a, b);
	  } else {
	    return objectEqual(a, b, m);
	  }
	}
	
	/*!
	 * Strict (egal) equality test. Ensures that NaN always
	 * equals NaN and `-0` does not equal `+0`.
	 *
	 * @param {Mixed} a
	 * @param {Mixed} b
	 * @return {Boolean} equal match
	 */
	
	function sameValue(a, b) {
	  if (a === b) return a !== 0 || 1 / a === 1 / b;
	  return a !== a && b !== b;
	}
	
	/*!
	 * Compare the types of two given objects and
	 * return if they are equal. Note that an Array
	 * has a type of `array` (not `object`) and arguments
	 * have a type of `arguments` (not `array`/`object`).
	 *
	 * @param {Mixed} a
	 * @param {Mixed} b
	 * @return {Boolean} result
	 */
	
	function typeEqual(a, b) {
	  return type(a) === type(b);
	}
	
	/*!
	 * Compare two Date objects by asserting that
	 * the time values are equal using `saveValue`.
	 *
	 * @param {Date} a
	 * @param {Date} b
	 * @return {Boolean} result
	 */
	
	function dateEqual(a, b) {
	  if ('date' !== type(b)) return false;
	  return sameValue(a.getTime(), b.getTime());
	}
	
	/*!
	 * Compare two regular expressions by converting them
	 * to string and checking for `sameValue`.
	 *
	 * @param {RegExp} a
	 * @param {RegExp} b
	 * @return {Boolean} result
	 */
	
	function regexpEqual(a, b) {
	  if ('regexp' !== type(b)) return false;
	  return sameValue(a.toString(), b.toString());
	}
	
	/*!
	 * Assert deep equality of two `arguments` objects.
	 * Unfortunately, these must be sliced to arrays
	 * prior to test to ensure no bad behavior.
	 *
	 * @param {Arguments} a
	 * @param {Arguments} b
	 * @param {Array} memoize (optional)
	 * @return {Boolean} result
	 */
	
	function argumentsEqual(a, b, m) {
	  if ('arguments' !== type(b)) return false;
	  a = [].slice.call(a);
	  b = [].slice.call(b);
	  return deepEqual(a, b, m);
	}
	
	/*!
	 * Get enumerable properties of a given object.
	 *
	 * @param {Object} a
	 * @return {Array} property names
	 */
	
	function enumerable(a) {
	  var res = [];
	  for (var key in a) res.push(key);
	  return res;
	}
	
	/*!
	 * Simple equality for flat iterable objects
	 * such as Arrays or Node.js buffers.
	 *
	 * @param {Iterable} a
	 * @param {Iterable} b
	 * @return {Boolean} result
	 */
	
	function iterableEqual(a, b) {
	  if (a.length !==  b.length) return false;
	
	  var i = 0;
	  var match = true;
	
	  for (; i < a.length; i++) {
	    if (a[i] !== b[i]) {
	      match = false;
	      break;
	    }
	  }
	
	  return match;
	}
	
	/*!
	 * Extension to `iterableEqual` specifically
	 * for Node.js Buffers.
	 *
	 * @param {Buffer} a
	 * @param {Mixed} b
	 * @return {Boolean} result
	 */
	
	function bufferEqual(a, b) {
	  if (!Buffer.isBuffer(b)) return false;
	  return iterableEqual(a, b);
	}
	
	/*!
	 * Block for `objectEqual` ensuring non-existing
	 * values don't get in.
	 *
	 * @param {Mixed} object
	 * @return {Boolean} result
	 */
	
	function isValue(a) {
	  return a !== null && a !== undefined;
	}
	
	/*!
	 * Recursively check the equality of two objects.
	 * Once basic sameness has been established it will
	 * defer to `deepEqual` for each enumerable key
	 * in the object.
	 *
	 * @param {Mixed} a
	 * @param {Mixed} b
	 * @return {Boolean} result
	 */
	
	function objectEqual(a, b, m) {
	  if (!isValue(a) || !isValue(b)) {
	    return false;
	  }
	
	  if (a.prototype !== b.prototype) {
	    return false;
	  }
	
	  var i;
	  if (m) {
	    for (i = 0; i < m.length; i++) {
	      if ((m[i][0] === a && m[i][1] === b)
	      ||  (m[i][0] === b && m[i][1] === a)) {
	        return true;
	      }
	    }
	  } else {
	    m = [];
	  }
	
	  try {
	    var ka = enumerable(a);
	    var kb = enumerable(b);
	  } catch (ex) {
	    return false;
	  }
	
	  ka.sort();
	  kb.sort();
	
	  if (!iterableEqual(ka, kb)) {
	    return false;
	  }
	
	  m.push([ a, b ]);
	
	  var key;
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!deepEqual(a[key], b[key], m)) {
	      return false;
	    }
	  }
	
	  return true;
	}


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	
	var base64 = __webpack_require__(67)
	var ieee754 = __webpack_require__(65)
	var isArray = __webpack_require__(66)
	
	exports.Buffer = Buffer
	exports.SlowBuffer = Buffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation
	
	var kMaxLength = 0x3fffffff
	
	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Note:
	 *
	 * - Implementation must support adding new properties to `Uint8Array` instances.
	 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
	 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *    incorrect length in some situations.
	 *
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
	 * get the Object implementation, which is slower but will work correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = (function () {
	  try {
	    var buf = new ArrayBuffer(0)
	    var arr = new Uint8Array(buf)
	    arr.foo = function () { return 42 }
	    return 42 === arr.foo() && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	})()
	
	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (subject, encoding, noZero) {
	  if (!(this instanceof Buffer))
	    return new Buffer(subject, encoding, noZero)
	
	  var type = typeof subject
	
	  // Find the length
	  var length
	  if (type === 'number')
	    length = subject > 0 ? subject >>> 0 : 0
	  else if (type === 'string') {
	    if (encoding === 'base64')
	      subject = base64clean(subject)
	    length = Buffer.byteLength(subject, encoding)
	  } else if (type === 'object' && subject !== null) { // assume object is array-like
	    if (subject.type === 'Buffer' && isArray(subject.data))
	      subject = subject.data
	    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
	  } else
	    throw new TypeError('must start with number, buffer, array or string')
	
	  if (this.length > kMaxLength)
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	      'size: 0x' + kMaxLength.toString(16) + ' bytes')
	
	  var buf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Preferred: Return an augmented `Uint8Array` instance for best performance
	    buf = Buffer._augment(new Uint8Array(length))
	  } else {
	    // Fallback: Return THIS instance of Buffer (created by `new`)
	    buf = this
	    buf.length = length
	    buf._isBuffer = true
	  }
	
	  var i
	  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
	    // Speed optimization -- use set if we're copying from a typed array
	    buf._set(subject)
	  } else if (isArrayish(subject)) {
	    // Treat array-ish objects as a byte array
	    if (Buffer.isBuffer(subject)) {
	      for (i = 0; i < length; i++)
	        buf[i] = subject.readUInt8(i)
	    } else {
	      for (i = 0; i < length; i++)
	        buf[i] = ((subject[i] % 256) + 256) % 256
	    }
	  } else if (type === 'string') {
	    buf.write(subject, 0, encoding)
	  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
	    for (i = 0; i < length; i++) {
	      buf[i] = 0
	    }
	  }
	
	  return buf
	}
	
	Buffer.isBuffer = function (b) {
	  return !!(b != null && b._isBuffer)
	}
	
	Buffer.compare = function (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
	    throw new TypeError('Arguments must be Buffers')
	
	  var x = a.length
	  var y = b.length
	  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	Buffer.isEncoding = function (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}
	
	Buffer.concat = function (list, totalLength) {
	  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')
	
	  if (list.length === 0) {
	    return new Buffer(0)
	  } else if (list.length === 1) {
	    return list[0]
	  }
	
	  var i
	  if (totalLength === undefined) {
	    totalLength = 0
	    for (i = 0; i < list.length; i++) {
	      totalLength += list[i].length
	    }
	  }
	
	  var buf = new Buffer(totalLength)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}
	
	Buffer.byteLength = function (str, encoding) {
	  var ret
	  str = str + ''
	  switch (encoding || 'utf8') {
	    case 'ascii':
	    case 'binary':
	    case 'raw':
	      ret = str.length
	      break
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      ret = str.length * 2
	      break
	    case 'hex':
	      ret = str.length >>> 1
	      break
	    case 'utf8':
	    case 'utf-8':
	      ret = utf8ToBytes(str).length
	      break
	    case 'base64':
	      ret = base64ToBytes(str).length
	      break
	    default:
	      ret = str.length
	  }
	  return ret
	}
	
	// pre-set for values that may exist in the future
	Buffer.prototype.length = undefined
	Buffer.prototype.parent = undefined
	
	// toString(encoding, start=0, end=buffer.length)
	Buffer.prototype.toString = function (encoding, start, end) {
	  var loweredCase = false
	
	  start = start >>> 0
	  end = end === undefined || end === Infinity ? this.length : end >>> 0
	
	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''
	
	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)
	
	      case 'ascii':
	        return asciiSlice(this, start, end)
	
	      case 'binary':
	        return binarySlice(this, start, end)
	
	      case 'base64':
	        return base64Slice(this, start, end)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)
	
	      default:
	        if (loweredCase)
	          throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.equals = function (b) {
	  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  return Buffer.compare(this, b) === 0
	}
	
	Buffer.prototype.inspect = function () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max)
	      str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}
	
	Buffer.prototype.compare = function (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  return Buffer.compare(this, b)
	}
	
	// `get` will be removed in Node 0.13+
	Buffer.prototype.get = function (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}
	
	// `set` will be removed in Node 0.13+
	Buffer.prototype.set = function (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}
	
	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	
	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')
	
	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var byte = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(byte)) throw new Error('Invalid hex string')
	    buf[offset + i] = byte
	  }
	  return i
	}
	
	function utf8Write (buf, string, offset, length) {
	  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
	  return charsWritten
	}
	
	function asciiWrite (buf, string, offset, length) {
	  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
	  return charsWritten
	}
	
	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}
	
	function base64Write (buf, string, offset, length) {
	  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
	  return charsWritten
	}
	
	function utf16leWrite (buf, string, offset, length) {
	  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length, 2)
	  return charsWritten
	}
	
	Buffer.prototype.write = function (string, offset, length, encoding) {
	  // Support both (string, offset, length, encoding)
	  // and the legacy (string, encoding, offset, length)
	  if (isFinite(offset)) {
	    if (!isFinite(length)) {
	      encoding = length
	      length = undefined
	    }
	  } else {  // legacy
	    var swap = encoding
	    encoding = offset
	    offset = length
	    length = swap
	  }
	
	  offset = Number(offset) || 0
	  var remaining = this.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	  encoding = String(encoding || 'utf8').toLowerCase()
	
	  var ret
	  switch (encoding) {
	    case 'hex':
	      ret = hexWrite(this, string, offset, length)
	      break
	    case 'utf8':
	    case 'utf-8':
	      ret = utf8Write(this, string, offset, length)
	      break
	    case 'ascii':
	      ret = asciiWrite(this, string, offset, length)
	      break
	    case 'binary':
	      ret = binaryWrite(this, string, offset, length)
	      break
	    case 'base64':
	      ret = base64Write(this, string, offset, length)
	      break
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      ret = utf16leWrite(this, string, offset, length)
	      break
	    default:
	      throw new TypeError('Unknown encoding: ' + encoding)
	  }
	  return ret
	}
	
	Buffer.prototype.toJSON = function () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}
	
	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}
	
	function utf8Slice (buf, start, end) {
	  var res = ''
	  var tmp = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    if (buf[i] <= 0x7F) {
	      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
	      tmp = ''
	    } else {
	      tmp += '%' + buf[i].toString(16)
	    }
	  }
	
	  return res + decodeUtf8Char(tmp)
	}
	
	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}
	
	function binarySlice (buf, start, end) {
	  return asciiSlice(buf, start, end)
	}
	
	function hexSlice (buf, start, end) {
	  var len = buf.length
	
	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len
	
	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}
	
	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}
	
	Buffer.prototype.slice = function (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end
	
	  if (start < 0) {
	    start += len;
	    if (start < 0)
	      start = 0
	  } else if (start > len) {
	    start = len
	  }
	
	  if (end < 0) {
	    end += len
	    if (end < 0)
	      end = 0
	  } else if (end > len) {
	    end = len
	  }
	
	  if (end < start)
	    end = start
	
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    return Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    var newBuf = new Buffer(sliceLen, undefined, true)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	    return newBuf
	  }
	}
	
	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0)
	    throw new RangeError('offset is not uint')
	  if (offset + ext > length)
	    throw new RangeError('Trying to access beyond buffer length')
	}
	
	Buffer.prototype.readUInt8 = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 1, this.length)
	  return this[offset]
	}
	
	Buffer.prototype.readUInt16LE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}
	
	Buffer.prototype.readUInt16BE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}
	
	Buffer.prototype.readUInt32LE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	
	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}
	
	Buffer.prototype.readUInt32BE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	
	  return (this[offset] * 0x1000000) +
	      ((this[offset + 1] << 16) |
	      (this[offset + 2] << 8) |
	      this[offset + 3])
	}
	
	Buffer.prototype.readInt8 = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80))
	    return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}
	
	Buffer.prototype.readInt16LE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt16BE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt32LE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	
	  return (this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16) |
	      (this[offset + 3] << 24)
	}
	
	Buffer.prototype.readInt32BE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	
	  return (this[offset] << 24) |
	      (this[offset + 1] << 16) |
	      (this[offset + 2] << 8) |
	      (this[offset + 3])
	}
	
	Buffer.prototype.readFloatLE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}
	
	Buffer.prototype.readFloatBE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}
	
	Buffer.prototype.readDoubleLE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}
	
	Buffer.prototype.readDoubleBE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}
	
	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new TypeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new TypeError('index out of range')
	}
	
	Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = value
	  return offset + 1
	}
	
	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}
	
	Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else objectWriteUInt16(this, value, offset, true)
	  return offset + 2
	}
	
	Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else objectWriteUInt16(this, value, offset, false)
	  return offset + 2
	}
	
	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}
	
	Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = value
	  } else objectWriteUInt32(this, value, offset, true)
	  return offset + 4
	}
	
	Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else objectWriteUInt32(this, value, offset, false)
	  return offset + 4
	}
	
	Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = value
	  return offset + 1
	}
	
	Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else objectWriteUInt16(this, value, offset, true)
	  return offset + 2
	}
	
	Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else objectWriteUInt16(this, value, offset, false)
	  return offset + 2
	}
	
	Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else objectWriteUInt32(this, value, offset, true)
	  return offset + 4
	}
	
	Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else objectWriteUInt32(this, value, offset, false)
	  return offset + 4
	}
	
	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new TypeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new TypeError('index out of range')
	}
	
	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert)
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}
	
	Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}
	
	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert)
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}
	
	Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}
	
	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function (target, target_start, start, end) {
	  var source = this
	
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (!target_start) target_start = 0
	
	  // Copy 0 bytes; we're done
	  if (end === start) return
	  if (target.length === 0 || source.length === 0) return
	
	  // Fatal error conditions
	  if (end < start) throw new TypeError('sourceEnd < sourceStart')
	  if (target_start < 0 || target_start >= target.length)
	    throw new TypeError('targetStart out of bounds')
	  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
	  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')
	
	  // Are we oob?
	  if (end > this.length)
	    end = this.length
	  if (target.length - target_start < end - start)
	    end = target.length - target_start + start
	
	  var len = end - start
	
	  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < len; i++) {
	      target[i + target_start] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), target_start)
	  }
	}
	
	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length
	
	  if (end < start) throw new TypeError('end < start')
	
	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return
	
	  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')
	
	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }
	
	  return this
	}
	
	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}
	
	// HELPER FUNCTIONS
	// ================
	
	var BP = Buffer.prototype
	
	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true
	
	  // save reference to original Uint8Array get/set methods before overwriting
	  arr._get = arr.get
	  arr._set = arr.set
	
	  // deprecated, will be removed in node 0.13+
	  arr.get = BP.get
	  arr.set = BP.set
	
	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer
	
	  return arr
	}
	
	var INVALID_BASE64_RE = /[^+\/0-9A-z]/g
	
	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}
	
	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}
	
	function isArrayish (subject) {
	  return isArray(subject) || Buffer.isBuffer(subject) ||
	      subject && typeof subject === 'object' &&
	      typeof subject.length === 'number'
	}
	
	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}
	
	function utf8ToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    var b = str.charCodeAt(i)
	    if (b <= 0x7F) {
	      byteArray.push(b)
	    } else {
	      var start = i
	      if (b >= 0xD800 && b <= 0xDFFF) i++
	      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
	      for (var j = 0; j < h.length; j++) {
	        byteArray.push(parseInt(h[j], 16))
	      }
	    }
	  }
	  return byteArray
	}
	
	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}
	
	function utf16leToBytes (str) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }
	
	  return byteArray
	}
	
	function base64ToBytes (str) {
	  return base64.toByteArray(str)
	}
	
	function blitBuffer (src, dst, offset, length, unitSize) {
	  if (unitSize) length -= length % unitSize;
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length))
	      break
	    dst[i + offset] = src[i]
	  }
	  return i
	}
	
	function decodeUtf8Char (str) {
	  try {
	    return decodeURIComponent(str)
	  } catch (err) {
	    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(62).Buffer))

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(64);


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * type-detect
	 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
	 * MIT Licensed
	 */
	
	/*!
	 * Primary Exports
	 */
	
	var exports = module.exports = getType;
	
	/*!
	 * Detectable javascript natives
	 */
	
	var natives = {
	    '[object Array]': 'array'
	  , '[object RegExp]': 'regexp'
	  , '[object Function]': 'function'
	  , '[object Arguments]': 'arguments'
	  , '[object Date]': 'date'
	};
	
	/**
	 * ### typeOf (obj)
	 *
	 * Use several different techniques to determine
	 * the type of object being tested.
	 *
	 *
	 * @param {Mixed} object
	 * @return {String} object type
	 * @api public
	 */
	
	function getType (obj) {
	  var str = Object.prototype.toString.call(obj);
	  if (natives[str]) return natives[str];
	  if (obj === null) return 'null';
	  if (obj === undefined) return 'undefined';
	  if (obj === Object(obj)) return 'object';
	  return typeof obj;
	}
	
	exports.Library = Library;
	
	/**
	 * ### Library
	 *
	 * Create a repository for custom type detection.
	 *
	 * ```js
	 * var lib = new type.Library;
	 * ```
	 *
	 */
	
	function Library () {
	  this.tests = {};
	}
	
	/**
	 * #### .of (obj)
	 *
	 * Expose replacement `typeof` detection to the library.
	 *
	 * ```js
	 * if ('string' === lib.of('hello world')) {
	 *   // ...
	 * }
	 * ```
	 *
	 * @param {Mixed} object to test
	 * @return {String} type
	 */
	
	Library.prototype.of = getType;
	
	/**
	 * #### .define (type, test)
	 *
	 * Add a test to for the `.test()` assertion.
	 *
	 * Can be defined as a regular expression:
	 *
	 * ```js
	 * lib.define('int', /^[0-9]+$/);
	 * ```
	 *
	 * ... or as a function:
	 *
	 * ```js
	 * lib.define('bln', function (obj) {
	 *   if ('boolean' === lib.of(obj)) return true;
	 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
	 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();
	 *   return !! ~blns.indexOf(obj);
	 * });
	 * ```
	 *
	 * @param {String} type
	 * @param {RegExp|Function} test
	 * @api public
	 */
	
	Library.prototype.define = function (type, test) {
	  if (arguments.length === 1) return this.tests[type];
	  this.tests[type] = test;
	  return this;
	};
	
	/**
	 * #### .test (obj, test)
	 *
	 * Assert that an object is of type. Will first
	 * check natives, and if that does not pass it will
	 * use the user defined custom tests.
	 *
	 * ```js
	 * assert(lib.test('1', 'int'));
	 * assert(lib.test('yes', 'bln'));
	 * ```
	 *
	 * @param {Mixed} object
	 * @param {String} type
	 * @return {Boolean} result
	 * @api public
	 */
	
	Library.prototype.test = function (obj, type) {
	  if (type === getType(obj)) return true;
	  var test = this.tests[type];
	
	  if (test && 'regexp' === getType(test)) {
	    return test.test(obj);
	  } else if (test && 'function' === getType(test)) {
	    return test(obj);
	  } else {
	    throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
	  }
	};


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	exports.read = function(buffer, offset, isLE, mLen, nBytes) {
	  var e, m,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      nBits = -7,
	      i = isLE ? (nBytes - 1) : 0,
	      d = isLE ? -1 : 1,
	      s = buffer[offset + i];
	
	  i += d;
	
	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);
	
	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);
	
	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity);
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
	};
	
	exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
	      i = isLE ? 0 : (nBytes - 1),
	      d = isLE ? 1 : -1,
	      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
	
	  value = Math.abs(value);
	
	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }
	
	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }
	
	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);
	
	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);
	
	  buffer[offset + i - d] |= s * 128;
	};


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * isArray
	 */
	
	var isArray = Array.isArray;
	
	/**
	 * toString
	 */
	
	var str = Object.prototype.toString;
	
	/**
	 * Whether or not the given `val`
	 * is an array.
	 *
	 * example:
	 *
	 *        isArray([]);
	 *        // > true
	 *        isArray(arguments);
	 *        // > false
	 *        isArray('');
	 *        // > false
	 *
	 * @param {mixed} val
	 * @return {bool}
	 */
	
	module.exports = isArray || function (val) {
	  return !! val && '[object Array]' == str.call(val);
	};


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	
	;(function (exports) {
		'use strict';
	
	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array
	
		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
	
		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS)
				return 62 // '+'
			if (code === SLASH)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}
	
		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr
	
			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}
	
			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0
	
			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)
	
			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length
	
			var L = 0
	
			function push (v) {
				arr[L++] = v
			}
	
			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}
	
			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}
	
			return arr
		}
	
		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length
	
			function encode (num) {
				return lookup.charAt(num)
			}
	
			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}
	
			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}
	
			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}
	
			return output
		}
	
		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}(false ? (this.base64js = {}) : exports))


/***/ }
/******/ ])
//# sourceMappingURL=test.bundle.js.map