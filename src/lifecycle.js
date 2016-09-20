import {getMailBox} from 'escalate';
import {untracked} from 'mobx';
const MAILBOX = getMailBox('Mutable.lifecycle');

export class LifeCycleManager {

    allowChange() {
        delete this.__lockToken__;
    }

    forbidChange() {
        this.__lockToken__ = Math.random() + 1;
    }

    $getLockToken() {
        return this.__lockToken__;
    }
}

function $setManager(lifecycleManager) {
    if (lifecycleManager) {
        if (this.__lifecycleManager__ && this.__lifecycleManager__ !== lifecycleManager) {
            MAILBOX.error('Moving mutable private state instances between containers');
        } else if (lifecycleManager instanceof LifeCycleManager) {
            this.__lifecycleManager__ = lifecycleManager;
            if (this.$dirtyableElementsIterator) {
                this.$dirtyableElementsIterator(setContainerManagerToElement);
            }
        } else {
            MAILBOX.error('Attempt to set wrong type of lifecycle manager');
        }
    }
}

export function makeDirtyable(Type) {
    // called when a new lifecycle manager is introduced to this object
    Type.prototype.$setManager = function outerSetManager(lifecycleManager){
        untracked($setManager.bind(this, lifecycleManager));
    };

    // used by setters to determine if changes are allowed to the dirty flag
    Type.prototype.$isDirtyable = function $isDirtyable() {
        return !this.__isReadOnly__ && (!this.__lifecycleManager__ || !this.__lifecycleManager__.$getLockToken());
    };
}

export function optionalSetManager(itemValue, lifeCycle) {
    if (itemValue && itemValue.$setManager && typeof itemValue.$setManager === 'function' && !itemValue.$isReadOnly()) {
        $setManager.call(itemValue, lifeCycle); // avoid unnecessary calls to untracked
    }
}

// functions to be used as callbacks to $dirtyableElementsIterator
function setContainerManagerToElement(container, element) {
    optionalSetManager(element, container.__lifecycleManager__);
}
