import {getMailBox} from 'escalate';
import {BaseAtom} from 'mobx';
import {isMutable, CompositeType, Mutable} from './types';
const MAILBOX = getMailBox('Mutable.lifecycle');

interface BoundableAtom extends BaseAtom{
    $mutableOriginalReportObserved:undefined|(() => void);
}
interface BoundAtom extends BaseAtom{
    $mutableOriginalReportObserved:() => void;
}

export class LifeCycleManager {
    private __readOnly__ = false;
    private __tracked__ = true;

    // we need to filter calls to reportObserved of the state tree when this.__tracked__ is false.
    // create an unbound wrappingReportObserved function that has this instance of LifeCycleManager in its closure.
    private $wrappingReportObserved = (() => {
        const managerInstance = this;
        return function wrappingReportObserved(this:BoundAtom){
            if (managerInstance.__tracked__){
                this.$mutableOriginalReportObserved.apply(this, arguments);
            }
        };
    })();

    allowChange() {
        this.__readOnly__ = false;
    }
    forbidChange() {
        this.__readOnly__ = true;
    }
    isDirtyable(){
        return !this.__readOnly__;
    }
    alowTracking() {
        this.__tracked__ = true;
    }
    forbidTracking() {
        this.__tracked__ = false;
    }
    $bindAtom = (atom:BoundableAtom) => {
        if (!atom.$mutableOriginalReportObserved) {
            atom.$mutableOriginalReportObserved = atom.reportObserved;
            atom.reportObserved = this.$wrappingReportObserved;
        }
    }
}

// called when a new lifecycle manager is introduced to this object
function setManager(lifecycleManager:LifeCycleManager) {
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
function setManagerToDirtyableElement(container:Mutable<any>, element:any) {
    optionalSetManager(element, container.__lifecycleManager__);
}

// used by setters to determine if changes are allowed to the dirty flag
function isDirtyable(this:Mutable<any>) {
    return !this.__isReadOnly__ && (!this.__lifecycleManager__ || this.__lifecycleManager__.isDirtyable());
}

export function makeDirtyable(type:CompositeType<Mutable<any>, any>) {
    type.prototype.$setManager = setManager;
    type.prototype.$isDirtyable = isDirtyable;
}

export function optionalSetManager(itemValue:any, lifeCycle?:LifeCycleManager|null) {
    if (isMutable(itemValue) && !itemValue.$isReadOnly()) {
        itemValue.$setManager(lifeCycle);
    }
}


