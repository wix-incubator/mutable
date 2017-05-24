import {forEach, map} from 'lodash';

interface IteratorResult<T> {
    done: boolean;
    value: T;
}

interface Iterator<T> {
    next(value?: any): IteratorResult<T>;
    return?(value?: any): IteratorResult<T>;
    throw?(e?: any): IteratorResult<T>;
}

interface ReadOnlyMap<T>{
    forEach(callbackfn: (value: T, index: string, map: ReadOnlyMap<T>) => void, thisArg?: any): void;
    get(key: string): T | undefined;
    has(key: string): boolean;
    entries(): [string, T][];
    keys(): string[];
    values(): T[];
    readonly size: number;
}
interface Dictionary<T>{
    [k:string]:T
}
export class MapWrapperOverDictionary<T, S> implements ReadOnlyMap<T> {

    constructor(ref: () => Dictionary<S>, private mapper:(e:S, k:string)=>T){
        Object.defineProperty(this, "ref", {
            enumerable: false,
            configurable: true,
            get: () => {
                return ref();
            }
        });
    }
    private get ref():Dictionary<S> {return {};}

    get size(): number{
        return this.keys().length;
    }

    forEach(callbackfn: (value: T, key: string, map: ReadOnlyMap<T>) => void, thisArg?: any): void {
        forEach<S>(this.ref, (value: S, key: string, map: Dictionary<S>) => callbackfn(this.mapper(value, key), key, this));
    }

    get(key: string): any|T {
        return this.mapper(this.ref[key], key);
    }

    has(key: string): boolean {
        return this.ref.hasOwnProperty(key)
    }

    keys(): string[] {
        let data = this.ref;
        return Object.keys(data).filter(k => data.hasOwnProperty(k));
    }

    entries(): [string, T][] {
        return map<S, [string, T]>(this.ref, (value: S, key: string, map: Dictionary<S>) => [key, this.mapper(value, key)]);
    }

    values(): T[] {
        return map(this.ref, (value: S, key: string, map: Dictionary<S>) => this.mapper(value, key));
    }

}
