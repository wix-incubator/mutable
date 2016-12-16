import {Level} from 'escalate';
import {BaseAtom} from 'mobx';

export interface ClassOptions{}

export type Validator = (value:any) => boolean;

export type LifeCycleManager = {};

export interface MutableObj{
    __lifecycleManager__? : LifeCycleManager;
    $setManager(newManager:LifeCycleManager):void;
    $dirtyableElementsIterator: (yielder:DirtyableYielder)=>void;
    $atomsIterator: (yielder:AtomYielder)=>void;
}

export interface ErrorContext {
    level: Level;
    entryPoint : string;
    path : string;
}

export interface ErrorMessage {
    path:string;
    message: string;
}

export type DirtyableYielder = (container:MutableObj, element:MutableObj)=>void;

export type AtomYielder = (atom:BaseAtom)=>void;
