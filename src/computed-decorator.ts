import {computed as mobxComputed} from 'mobx';


export function computed<T>(proto:T, memberName:keyof T, descriptor?:PropertyDescriptor) {
    if(!descriptor) {
        descriptor = Object.getOwnPropertyDescriptor(proto, memberName);
    }
    const implementation = descriptor.value;
    descriptor.value = function bootstrapComputed(this:T) {
        const computedValue = mobxComputed(() => {
            return implementation.apply(this);
        });
        this[memberName] = (()=> {
            return computedValue.get();
        }) as any;
        return (this[memberName]as any)();
    } as any;

    return descriptor;
}
