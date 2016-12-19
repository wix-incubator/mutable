import {getMailBox} from 'escalate';
const MAILBOX = getMailBox('Mutable.lifecycle');

export class LifeCycleManager {
    __readOnly__ = false;
    __tracked__ = true;

    constructor(){
        const managerInstance = this;
        // we need to filter calls to reportObserved of the state tree when this.__tracked__ is false.
        // create an unbound wrappingReportObserved function that has this instance of LifeCycleManager in its closure.
        this.$wrappingReportObserved = function wrappingReportObserved(){
            if (managerInstance.__tracked__){
                this.$mutableOriginalReportObserved.apply(this, arguments);
            }
        };
    }
    allowChange() {
        this.__readOnly__ = false;
    }
    forbidChange() {
        this.__readOnly__ = true;
    }
    alowTracking() {
        this.__tracked__ = true;
    }
    forbidTracking() {
        this.__tracked__ = false;
    }
    $bindAtom = (atom) => {
        if (!atom.$mutableOriginalReportObserved) {
            atom.$mutableOriginalReportObserved = atom.reportObserved;
            atom.reportObserved = this.$wrappingReportObserved;
        }
    }
}

// called when a new lifecycle manager is introduced to this object
function setManager(lifecycleManager) {
    if (lifecycleManager) {
        if (this.__lifecycleManager__ && this.__lifecycleManager__ !== lifecycleManager) {
            MAILBOX.error('Moving mutable private state instances between containers');
        } else if (lifecycleManager instanceof LifeCycleManager) {
            this.__lifecycleManager__ = lifecycleManager;
            if (this.$atomsIterator) {
                this.$atomsIterator(lifecycleManager.$bindAtom);
            }
            if (this.$dirtyableElementsIterator) {
                this.$dirtyableElementsIterator(setManagerToDirtyableElement);
            }
        } else {
            MAILBOX.error('Attempt to set wrong type of lifecycle manager');
        }
    }
}
function setManagerToDirtyableElement(container, element) {
    optionalSetManager(element, container.__lifecycleManager__);
}

// used by setters to determine if changes are allowed to the dirty flag
function isDirtyable() {
    return !this.__isReadOnly__ && (!this.__lifecycleManager__ || !this.__lifecycleManager__.__readOnly__);
}

export function makeDirtyable(Type) {
    Type.prototype.$setManager = setManager;
    Type.prototype.$isDirtyable = isDirtyable;
}

export function optionalSetManager(itemValue, lifeCycle) {
    if (itemValue && itemValue.$setManager && typeof itemValue.$setManager === 'function' && !itemValue.$isReadOnly()) {
        itemValue.$setManager(lifeCycle);
    }
}


