// import {BaseAtom} from 'mobx';
//
// /*
//  proto: getter, setter
//  proto.fields : type
//  this. : atom
//  this.value : values
//  */
//
// /**
//  * an instance of any mutable type
//  */
// interface Instance {
//     __value__ : {[fieldName:string]:any};
//     //  TODO: add this
//     //   __atoms__ : {[fieldName:string]:BaseAtom};
//     __fields__ : {[fieldName:string]:Field<any>};
// }
//
// type Constructor = new (...args: any[]) => any;
//
// interface TypeValidator{
//     isTyped(instance:any):boolean;
//     isValidPlain(instance:any):boolean;
// }
//
// export class FieldBuilder<T>{
//     constructor(private name:string, private spec:T) {}
//
//     defineType<T>(ctor:T): T & {
//
//     }
// }
//
// export class FieldSpec<T>{
//     constructor(private name:string, private spec:T) {}
// }
//
// export class Field<T>{
//     constructor(private name:string, private spec:T) {}
//
//     atom(instance:Instance){
//         return instance.__atoms__[this.name];
//     }
//
//     value(instance:Instance){
//         return instance.__value__[this.name];
//     }
// }
//
// //
// // // "inherit" type API
// // [
// //     '_matchValue',
// //     'allowPlainVal',
// //     'isNullable',
// //     'create',
// //     'defaults',
// //     'validate',
// //     'validateType',
// //     'isJsAssignableFrom'
// // ].forEach(funcName => {
// //     Field.prototype[funcName] = function () {
// //         return this.fieldSpec[funcName].apply(this.fieldSpec, arguments);
// //     };
// // });
