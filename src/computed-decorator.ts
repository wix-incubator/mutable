import {computed as mobxComputed} from 'mobx';


export function computed<T>(proto:T, memberName:keyof T, descriptor?:PropertyDescriptor) {
    if(!descriptor) {
        descriptor = Object.getOwnPropertyDescriptor(proto, memberName);
    }
    Object.defineProperty(proto, memberName, {
        value: lazy2<T>(memberName, descriptor.value)
    });
}

function lazy2<T>(fnName:keyof T, fn:Function) {
    return function (this:T) {
        const mfn = mobxComputed(() => {
            return fn.apply(this);
        });
        this[fnName] = (()=> {
            return mfn.get();
        }) as any;
        return (this[fnName]as any)();
    }
}
