import {BaseAtom} from 'mobx';

/*
proto: getter, setter
proto.fields : type
this. : atom
this.value : values



*/



/**
 * A Field is a typed reference to a mutable object.
 */

export class FieldBuilder{
    spec;
    name;
    constructor(name, spec) {
        this.name = name;
        this.spec = spec;
    }


}

export class Field{
    spec;

    constructor(name, spec) {
        super(name);
        this.spec = spec;
    }

    atom(instance){
        return instance.__atoms__[name];
    }

    value(instance){
        return instance.__value__[name];
    }

}

//
// // "inherit" type API
// [
//     '_matchValue',
//     'allowPlainVal',
//     'isNullable',
//     'create',
//     'defaults',
//     'validate',
//     'validateType',
//     'isJsAssignableFrom'
// ].forEach(funcName => {
//     Field.prototype[funcName] = function () {
//         return this.fieldSpec[funcName].apply(this.fieldSpec, arguments);
//     };
// });
