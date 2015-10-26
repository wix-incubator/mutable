import _ from "lodash"

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


	Type.prototype.$optionalSetManager = function $optionalSetManager(itemValue, lifeCycle) {
		if (itemValue && itemValue.$setManager && _.isFunction(itemValue.$setManager) && !itemValue.$isReadOnly()) {
			itemValue.$setManager(lifeCycle);
		}
	}
// called when a new lifecycle manager is introduced to this object
    Type.prototype.$setManager = function $setManager(lifecycleManager) {
        if (lifecycleManager) {
            if (this.__isReadOnly__) {
                MAILBOX.error('Attempt to set lifecycle manager on a read-only instance');
            } else if (lifecycleManager instanceof LifeCycleManager) {
                if (this.__lifecycleManager__ && this.__lifecycleManager__ !== lifecycleManager) {
                    MAILBOX.error('Attempt to set lifecycle manager on a read-write instance with another manager already set');
                }
                this.__lifecycleManager__ = lifecycleManager;
                _.forEach(this.__value__, (val) => {
                    if (val.$setManager && _.isFunction(val.$setManager)) {
                        val.$setManager(lifecycleManager);
                    }
                });
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
			// todo this condition should be refactored to a flag for collection types
			if(this.constructor.id === 'Array'){

				var lastModifiedChild = _.max(this.__value__, (v) => (v && v.$calcLastChange) ? v.$calcLastChange() : -1);
				if (lastModifiedChild && lastModifiedChild.__lastChange__){
					this.__lastChange__ = Math.max(this.__lastChange__, lastModifiedChild.__lastChange__);
				}
				
			} else if(this.constructor._complex){
				this.__lastChange__ = _.reduce(this.constructor._complex, function(acc, key){
					var value = this.__value__[key];
					return value ? Math.max(value.$calcLastChange(), acc) : acc;
				}, this.__lastChange__, this);
			}
			
			this.__cacheLockToken__ = this.$getManagerLockToken() || unlockedToken;
        }
        return this.__lastChange__;
    };

    Type.prototype.$isDirty = function $isDirty(r) {
        return this.$calcLastChange() >= r;
    }

}
