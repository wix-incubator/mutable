import _ from "lodash"

// immutable enum type for fuzzy-logic dirty flag
const dirty = {
    yes : {
        isDirty : true,
        isKnown : true
    },
    no : {
        isDirty : false,
        isKnown : true
    },
    unKnown : {
        isKnown : false
    }
};

export class LifeCycleManager{

    constructor(){
        this.__change__ = true;
    }

    onChange(){}

    allowChange(){
        this.__change__ = true;
    }

    forbidChange(){
        this.__change__ = false;
    }

    $change(){
        return this.__change__;
    }
}

export function makeDirtyable(Type){
// add a default dirty state for all objects
    Type.prototype.__dirty__ = dirty.unKnown;


// called when a new lifecycle manager is introduced to this object
    Type.prototype.$setManager = function $setManager(lifecycleManager) {
        if (!this.__isReadOnly__ && lifecycleManager instanceof LifeCycleManager) {
            if (this.__lifecycleManager__ && this.__lifecycleManager__ !== lifecycleManager){
                throw new Error('lifecycle management already exists');
            }
            this.__lifecycleManager__ = lifecycleManager;
            _.forEach(this.__value__, (val) => {
                if (val.$setManager && _.isFunction(val.$setManager)) {
                    val.$setManager(lifecycleManager);
                }
            });
        }
    };

// used by $setDirty to determine if changes are allowed to the dirty flag
    Type.prototype.$isDirtyable = function $isDirtyable() {
        return (!this.__isReadOnly__  && (!this.__lifecycleManager__ || this.__lifecycleManager__.$change()));
    };

// called when a change has been made to this object directly or after changes are paused
    Type.prototype.$setDirty = function $setDirty() {
        if (this.$isDirtyable()){
            this.__dirty__ = dirty.yes;
            if (this.__lifecycleManager__) {
                this.__lifecycleManager__.onChange();
            }
            return true;
        }
        return false;
    };

// may be called at any time
    Type.prototype.$isDirty = function $isDirty() {
        if (this.__dirty__.isKnown){
            return this.__dirty__.isDirty;
        }
        var isDirty = _.any(this.__value__, (val) => val.$isDirty && val.$isDirty());
        // optional caching
        if (!this.__isReadOnly__ && this.__lifecycleManager__ && !this.__lifecycleManager__.$change()) {
            // only cache in managed mutable instances which don't expect changes
            this.__dirty__ = isDirty ? dirty.yes : dirty.no;
        }
        return isDirty;
    };

// resets the dirty state to unknown
    Type.prototype.$resetDirty = function $resetDirty() {
        if (this.__isReadOnly__) {
            // todo:warn hook
            console.warn('resetting dirty flag on read only!');
        } else {
            this.__dirty__ = dirty.unKnown;
            _.forEach(this.__value__, (val) => {
                if (val.$resetDirty && _.isFunction(val.$resetDirty)) {
                    val.$resetDirty();
                }
            });
        }
    };
}