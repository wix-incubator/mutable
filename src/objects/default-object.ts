import {defineClass} from './define';
import {Class} from "./types";

let DefaultClass: Class<{}|null>|null = null;
export function defaultObject(value:any){
    if (!DefaultClass){
        // lazy class definition because `defineClass` is a circular reference
        DefaultClass = defineClass('Default', { spec: () => ({}) }).nullable() as Class<{}|null>;
    }
    return DefaultClass.create(value);
}
