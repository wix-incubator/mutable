import {getMailBox} from 'gopostal';

const MAILBOX = getMailBox('Typorama.lifecycle');


export let revision = {
	__count__ : 1,
	read : function(){return this.__count__;},
	advance : function(){ this.__count__++;},
};

export class LifeCycleManager{

	onChange(){}

	allowChange(){
		delete this.__lockToken__;
	}

	forbidChange(){
		this.__lockToken__ = Math.random() + 1;
	}

	$getLockToken(){
		return this.__lockToken__;
	}
}

var unlockedToken = {};

export function makeDirtyable(Type){
// add a default dirty state for all objects
	Type.prototype.__lastChange__ = 1;
	Type.prototype.__cacheLockToken__ = unlockedToken;

// called when a new lifecycle manager is introduced to this object
	Type.prototype.$setManager = function $setManager(lifecycleManager) {
		if (lifecycleManager) {
			if (lifecycleManager instanceof LifeCycleManager) {
				this.__lifecycleManager__ = lifecycleManager;
				if (this.$dirtyableElementsIterator) {
					this.$dirtyableElementsIterator(setContainerManagerToElement);
				}
			} else {
				MAILBOX.error('Attempt to set wrong type of lifecycle manager');
			}
		}
	};

	Type.prototype.$getManagerLockToken = function $getManagerLockToken() {
		return this.__lifecycleManager__ && this.__lifecycleManager__.$getLockToken();
	};

// used by $setDirty to determine if changes are allowed to the dirty flag
	Type.prototype.$isDirtyable = function $isDirtyable() {
		return !this.__isReadOnly__  && !this.$getManagerLockToken();
	};

// called when a change has been made to this object directly or after changes are paused
	Type.prototype.$setDirty = function $setDirty() {
		if (this.$isDirtyable()){
			this.__lastChange__ = revision.read();
			if (this.__lifecycleManager__) {
				this.__lifecycleManager__.onChange();
			}
			return true;
		}
		return false;
	};

// may be called at any time
	Type.prototype.$calcLastChange = function $calcLastChange() {
		if (this.$isReadOnly()){
			return this.$asReadWrite().$calcLastChange();
		} else if (this.$getManagerLockToken() !== this.__cacheLockToken__){
			// no cache, go recursive
			if (this.$dirtyableElementsIterator) {
				this.$dirtyableElementsIterator(setContainerLastChangeFromElement);
			}
			this.__cacheLockToken__ = this.$getManagerLockToken() || unlockedToken;
		}
		return this.__lastChange__;
	};

	Type.prototype.$isDirty = function $isDirty(r) {
		return this.$calcLastChange() >= r;
	}

}

// functions to be used as callbacks to $dirtyableElementsIterator
function setContainerManagerToElement(container, element){
	element.$setManager(container.__lifecycleManager__);
}

function setContainerLastChangeFromElement(container, element){
	let lastChange = element.$calcLastChange();
	if (lastChange > container.__lastChange__) {
		container.__lastChange__ = lastChange;
	}
}
