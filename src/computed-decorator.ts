import {computed as mobxComputed, runInAction} from 'mobx';


export function computed<T>(proto:T, memberName:keyof T, descriptor?:PropertyDescriptor) {
    if(!descriptor) {
        descriptor = Object.getOwnPropertyDescriptor(proto, memberName);
    }
    const implementation = descriptor.value;
    descriptor.value = function bootstrapComputed(this:T) {
       // const computedValue = mobxComputed(implementation.bind(this));
        const computedValue = mobxComputed(() => {
            return implementation.apply(this);
        });
        // this[memberName] = (()=> computedValue.get()) as any;
        this[memberName] = (()=> {
            return computedValue.get();
        }) as any;
        return (this[memberName]as any)();
    } as any;

    return descriptor;
}


/*
export function computed(context:any, memberName:any, descriptor:any) {
    debugger;
    if(!descriptor) {
        descriptor = Object.getOwnPropertyDescriptor(context, memberName);
    }
    Object.defineProperty(context, memberName, {
        value: lazy2(context, memberName, descriptor.value)
    });
}

function lazy2(proto:any, fnName:any, fn:any) {
    return function () {
        const mfn = mobxComputed(() => {
            return fn.apply(this);
        });
        this[fnName] = ()=> {
            return mfn.get();
        };
        return this[fnName]();
    }
}
*/
