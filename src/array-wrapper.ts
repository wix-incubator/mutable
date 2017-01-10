import {getMailBox} from 'escalate';
import {untracked} from "mobx";

const MAILBOX = getMailBox('mutable.ArrayWrapper');

export interface ReadonlyArrayConstructor {
    new<T> (): ReadonlyArray<T>;
}

const _Array = class _Array {
} as any as ReadonlyArrayConstructor;
_Array.prototype = [];

export class ArrayWrapper<T, S> extends _Array<T>{
    constructor(ref: () => Array<S>, public mapper:(e:S, i:number)=>T){
        super();
        Object.defineProperty(this, "ref", {
            enumerable: false,
            configurable: true,
            get: () => {
                const res = arr = ref();
                untracked(updateArrayLength);
                return res;
            }
        });
    }
    // here for static type checker only
    get ref():Array<S> {return [];}
    get length():number{return 0;}
}

Object.defineProperties(ArrayWrapper.prototype, {
    constructor : {enumerable: false}, // to have no enumerable properties
    mapper : {enumerable: false, writable:true}, // to have no enumerable properties
    length : {enumerable: false, get:function(this:ArrayWrapper<any, any>){return this.ref.length;}}
});

let ARRAY_BUFFER_SIZE = 0;

let arr:Array<any>;
function updateArrayLength(){
    const length = arr? arr.length : 0;
    if (length > ARRAY_BUFFER_SIZE){
        reserveArrayBuffer(length + 1);
    }
}

function reserveArrayBuffer(max: number) {
    for (let index = ARRAY_BUFFER_SIZE; index < max; index++) {
        createArrayBufferItem(index);
    }
    ARRAY_BUFFER_SIZE = max;
}

function createArrayBufferItem(index: number) {
    const get = function<T, S> (this:ArrayWrapper<T, S>) {
        const v = this.ref;
        if (index < v.length) {
            return this.mapper ? this.mapper(v[index], index) : v[index];
        }
        MAILBOX.warn(`Attempt to read an array index (${index}) that is out of bounds (length is ${v.length})`);
        return undefined;
    };
    Object.defineProperty(ArrayWrapper.prototype, "" + index, {
        enumerable: false,
        configurable: true,
        get
    });
}
reserveArrayBuffer(1000);
