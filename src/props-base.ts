import {defineClass} from './objects/define';
import {clone} from 'lodash';
import {Class} from "./objects/types";

type PropBase = {
    getFieldsSpec:()=>{}
} & Class<{}>;

export const propsBase :PropBase= defineClass('propsBase', { spec: () => ({}) }) as any;

function getFieldsSpec(){
    return clone(this._spec);
}

propsBase.getFieldsSpec = getFieldsSpec;
