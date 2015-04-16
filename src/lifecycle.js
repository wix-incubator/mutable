
// immutable enum type for fuzzy-logic dirty flag
export const dirty = {
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

export function makeDirtyable(Type){
// add a default dirty state for all objects
    Type.prototype.__dirty__ = dirty.unKnown;

// called when a change has been made to this object directly or after changes are paused
    Type.prototype.$setDirty = function $setDirty(isDirty) {
        if (!this.__isReadOnly__ && isDirty !== undefined) {
            this.__dirty__ = isDirty ? dirty.yes : dirty.no;
        }
    };

// may be called at any time
    Type.prototype.$isDirty = function $isDirty() {
        return this.__dirty__.isKnown ? this.__dirty__.isDirty :
            _.any(this.__value__, (val) => val.$isDirty && val.$isDirty());
    };

// resets the dirty state to unknown
    Type.prototype.$resetDirty = function $resetDirty() {
        if (!this.__isReadOnly__) {
            this.__dirty__ = dirty.unKnown;
            _.forEach(this.__value__, (val) => {
                if (val.$resetDirty && _.isFunction(val.$resetDirty)) {
                    val.$resetDirty();
                }
            });
        } else {
            // todo:warn hook
            console.warn('resetting dirty flag on read only!');
        }
    };
}