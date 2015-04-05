
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