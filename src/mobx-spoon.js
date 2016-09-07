/**
 * A hacky way to expose of Mobx's async transactions.
 * all logic here is copy-pasted from Mobx 2.4.4 sources with minimal changes.
 */
import {extras} from 'mobx';

const globalCtx = (typeof self === 'object' && self.self === self && self) ||
    (typeof global === 'object' && global.global === global && global) ||
    this;

const globalState = globalCtx.__mobxGlobal;

export function isInTransaction(){
    return globalState.inTransaction > 0;
}

function invariant(check, message, thing) {
    if (!check)
        throw new Error("[mobx] Invariant failed: " + message + (thing ? " in '" + thing + "'" : ""));
}

var MAX_REACTION_ITERATIONS = 100;
function runReactions() {
    if (globalState.isRunningReactions === true || globalState.inTransaction > 0)
        return;
    globalState.isRunningReactions = true;
    var allReactions = globalState.pendingReactions;
    var iterations = 0;
    while (allReactions.length > 0) {
        if (++iterations === MAX_REACTION_ITERATIONS)
            throw new Error(("Reaction doesn't converge to a stable state after " + MAX_REACTION_ITERATIONS + " iterations.")
                + (" Probably there is a cycle in the reactive function: " + allReactions[0]));
        var remainingReactions = allReactions.splice(0);
        for (var i = 0, l = remainingReactions.length; i < l; i++)
            remainingReactions[i].runReaction();
    }
    globalState.isRunningReactions = false;
}

function notifyDependencyReady(derivation, dependencyDidChange) {
    invariant(derivation.dependencyStaleCount > 0, "unexpected ready notification");
    if (dependencyDidChange)
        derivation.dependencyChangeCount += 1;
    if (--derivation.dependencyStaleCount === 0) {
        if (derivation.dependencyChangeCount > 0) {
            derivation.dependencyChangeCount = 0;
            var changed = derivation.onDependenciesReady();
            propagateReadiness(derivation, changed);
        }
        else {
            propagateReadiness(derivation, false);
        }
    }
}

function propagateReadiness(observable, valueDidActuallyChange) {
    observable.staleObservers.splice(0).forEach(function (o) { return notifyDependencyReady(o, valueDidActuallyChange); });
}

function propagateAtomReady(atom) {
    invariant(atom.isDirty, "atom not dirty");
    atom.isDirty = false;
    propagateReadiness(atom, true);
}

export function transactionStart(name, thisArg, report) {
    if (thisArg === void 0) { thisArg = undefined; }
    if (report === void 0) { report = true; }
    globalState.inTransaction += 1;
    if (report && extras.isSpyEnabled()) {
        extras.spyReportStart({
            type: "transaction",
            target: thisArg,
            name: name
        });
    }
}
export function transactionEnd(report) {
    if (report === void 0) { report = true; }
    if (--globalState.inTransaction === 0) {
        var values = globalState.changedAtoms.splice(0);
        for (var i = 0, l = values.length; i < l; i++)
            propagateAtomReady(values[i]);
        runReactions();
    }
    if (report && extras.isSpyEnabled())
        extras.spyReportEnd();
}
