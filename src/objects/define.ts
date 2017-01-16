import {Spec, Type, Class, isNonPrimitiveType, ReferenceType, Mutable} from '../types';
import {getMailBox} from 'escalate';
import {getPrimeType, inherit, getValueFromRootRef, getReferenceWrapper} from '../utils';
import {forEach, isFunction, extend} from 'lodash';
import {misMatchMessage} from '../validation';
import {untracked, extras} from 'mobx';
import {DirtyableYielder, AtomYielder} from "../lifecycle";
import {MuObject} from "./object";
import {defineNonPrimitive} from '../base';

/**
 * the schema of the class to define (input format)
 */
interface Schema{
    [fieldName:string] :  Type<any, any>;
}
/**
 * the metadata of the type to define
 */
interface Metadata{
    spec(self:Class<any>) : Schema;
}


const MAILBOX = getMailBox('mutable.extend');
const RESERVED_FIELDS = Object.keys(extend({}, MuObject.prototype));

export function defineClass<T>(id:string, typeDefinition: Metadata):Class<T>;
export function defineClass<T extends P, P>(id:string, typeDefinition: Metadata, _ParentType?: Class<P>, TypeConstructor?: Class<T>):Class<T>;

export function defineClass<T extends P, P>(id:string, typeDefinition: Metadata, _ParentType?: Class<P>, TypeConstructor?: Class<T>):Class<T> {
    const ParentType:Class<any> = _ParentType || MuObject;
    let type;
    if (TypeConstructor){
        type = TypeConstructor;
    } else {
        if (!MuObject.isJsAssignableFrom(ParentType)){
            MAILBOX.fatal(`Type definition error: ${id} is not a subclass of Class`);
        }
        type = inherit(id, ParentType);
    }
    defineNonPrimitive(id, type);
    calculateSchemaProperties(typeDefinition, type, ParentType, id);
    return type;
}

// values that are calculated from spec require Type to be defined (for recursive types) so they are attached to the class after definition
function calculateSchemaProperties(typeDefinition: Metadata, type: Class<any>, ParentType: Class<any>, id: string) {
    const typeSelfSpec = typeDefinition.spec(type);
    const baseSpec = ParentType && ParentType.getFieldsSpec ? ParentType.getFieldsSpec() : {};
    normalizeSchema(type, baseSpec, typeSelfSpec, ParentType.id);
    type._spec = generateSpec(id, typeSelfSpec, baseSpec);
    setSchemaIterators(type.prototype, typeSelfSpec, ParentType.prototype);
    generateFieldsOn(type.prototype, typeSelfSpec);
    type.__refType = generateRefType(type);
}

function isAnyType(fieldDef:Type<any, any>):fieldDef is Class<{}>{
    return getPrimeType(fieldDef) === MuObject;
}

function normalizeSchema(type:Class<any>, parentSpec:Spec, typeSelfSpec:Schema, parentName:string) {
    forEach(typeSelfSpec, (fieldDef:Type<any, any>, fieldName:string) => {
        if (!validateField(type, parentSpec, fieldName, fieldDef, parentName)){
            // maybe we should delete the field from the spec if it's not valid?
        }
    });
}

function validateField(type:Class<any>, parentSpec:Schema, fieldName:string, fieldDef:Type<any, any>, parentName:string):boolean {
    let error;
    const errorContext = MuObject.createErrorContext(`Type definition error`, 'fatal');
    let path = `${type.id}.${fieldName}`;
    if (~RESERVED_FIELDS.indexOf(fieldName)){
        error = 'is a reserved field.';
    } else if (parentSpec[fieldName]) { // todo add '&& !isAssignableFrom(...) check to allow polymorphism
        error = `already exists on super ${parentName}`;
    } else {
        const err = MuObject.reportFieldDefinitionError(fieldDef);
        if (err) {
            error = err.message;
            if (err.path) {
                path = path + err.path
            }
        }
    }
    if (error) {
        MAILBOX.fatal(`Type definition error: "${path}" ${error}`);
    } else {
        error = fieldDef.reportSetValueErrors(fieldDef.defaults());
        if (error) {
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, fieldDef, fieldDef.defaults(), path));
        }
    }
    return !error;
}

function generateSpec(id:string, spec:Schema, baseSpec:Spec) {
    forEach(spec, (field:Type<any, any>, fieldName:string) => {
        baseSpec[fieldName] = field;
    });
    return baseSpec;
}

function setSchemaIterators(proto:Mutable<any>, spec:Schema, parent:Mutable<any>) {
    const complex:Array<string> = [];
    for (let k in spec) {
        if (isNonPrimitiveType(spec[k])) {
            complex[complex.length] = k;
        }
    }
    proto.$dirtyableElementsIterator = function typeDirtyableElementsIterator(yielder: DirtyableYielder) {
        for (let c of complex) {
            let k = this.__value__[c];
            if (k && isFunction(k.$setManager)) { // if value is dirtyable
                yielder(this, k);
            }
        }
        parent && isFunction(parent.$dirtyableElementsIterator) && parent.$dirtyableElementsIterator.call(this, yielder);
    };
    proto.$atomsIterator = function atomsIterator(yielder:AtomYielder) {
        for (let c in spec) {
            if (spec.hasOwnProperty(c)) {
                yielder(extras.getAtom(this.__value__, c) as any);
            }
        }
        parent && isFunction(parent.$atomsIterator) && parent.$atomsIterator.call(this, yielder);
    };
}

function generateFieldsOn(proto:any, fieldsDefinition:Schema) {
    forEach(fieldsDefinition, function(fieldDef:Type<any, any>, fieldName:string) {
        Object.defineProperty(proto, fieldName, {
            get: function() {
                const value = this.__value__[fieldName];
                if (!this.__isReadOnly__ || value===null || value===undefined || !value.$asReadOnly) {
                    return value;
                } else {
                    return value.$asReadOnly();
                }
            },
            set: function(newValue) {
                if (this.$isDirtyable()) {
                    this.$assignField(fieldName, newValue);
                } else {
                    untracked(() => {
                        MAILBOX.warn(`Attempt to override a read only value ${JSON.stringify(this.__value__[fieldName])} at ${this.constructor.id}.${fieldName} with ${JSON.stringify(newValue)}`);
                    });
                }
            },
            enumerable: true,
            configurable: false
        });
    });
}

function getReference<T>(rootReference:() => any, path:Array<string|number>, thisType: Class<any>, fieldDef: Type<T, any>, fieldName: string):T {
    let value = getValueFromRootRef(rootReference, path);
    return getReferenceWrapper(thisType, fieldDef, rootReference, path.concat(fieldName), value[fieldName]);
}

function generateRefType<T>(type: Class<T>) :ReferenceType<T>{
    class Reference {
        constructor(public __origin:() => any, public path:Array<string|number>){}
    }
    forEach(type._spec, function(fieldDef:Type<any, any>, fieldName:string) {
        Object.defineProperty(Reference.prototype, fieldName, {
            get: function(this:Reference) {
                return getReference(this.__origin, this.path, type, fieldDef, fieldName);
            },
            enumerable: true,
            configurable: false
        });
    });

    return Reference as any as ReferenceType<T>;
}
