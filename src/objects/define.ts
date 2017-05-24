import {Type, isNonPrimitiveType, ReferenceType} from '../types';
import {getMailBox} from 'escalate';
import {inherit, getValueFromRootRef, getReferenceWrapper, reportFieldDefinitionError} from '../utils';
import {forEach, extend, clone} from 'lodash';
import {misMatchMessage} from '../core/validation';
import {MuObject} from "./object";
import {defineNonPrimitive} from '../core/base';
import {Class} from "./types";
import {defaults} from 'lodash';
import {nonPrimitiveElementsIterator, atomsIterator, fieldAttribute, toJSON, toJS} from "./template-object-methods";

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
    staticTransitiveOverrides?:string[];
    transitiveOverrides?:string[];
}


const MAILBOX = getMailBox('mutable.extend');
const RESERVED_FIELDS = Object.keys(extend({}, MuObject.prototype));

export function defineClass<T>(id:string, typeDefinition: Metadata):Class<T>;
export function defineClass<T extends P, P>(id:string, typeDefinition: Metadata, parent: Class<P>):Class<T>;
export function defineClass<T extends P, P>(id:string, typeDefinition: Metadata, parent?: Class<P>, jsType?: {new(...args:any[]):T}):Class<T>;
export function defineClass<T extends P, P>(id:string, typeDefinition: Metadata, parent?: Class<P>, jsType?: {new(...args:any[]):T}):Class<T> {
    parent = parent || MuObject as any as Class<P>;
    const type: Class<any> = jsType as Class<any> || inherit(id, parent as Class<any>);
    if (!MuObject.isJsAssignableFrom(type)) {
        MAILBOX.fatal(`Type definition error: ${id} is not a subclass of Object`);
    }
    defineNonPrimitive(id, type);
    calculateSchemaProperties(typeDefinition, type, parent, id);
    return type;
}

// values that are calculated from spec require Type to be defined (for recursive types) so they are attached to the class after definition
function calculateSchemaProperties(typeDefinition: Metadata, type: Class<any>, parent: Class<any>, id: string) {
    const definedSpec = typeDefinition.spec(type);
    const effectiveSpec = parent && parent._spec? clone(parent._spec): {};
    forEach(definedSpec, (fieldDef:Type<any, any>, fieldName:string) => {
        if (validateField(type, parent._spec, fieldName, fieldDef, parent.id)){
            effectiveSpec[fieldName] = fieldDef;
        }
    });
    type._spec = effectiveSpec;
    const complex:Array<string> = [];
    for (let k in definedSpec) {
        if (isNonPrimitiveType(definedSpec[k])) {
            complex[complex.length] = k;
        }
    }
    if (typeDefinition.transitiveOverrides){
        type.options = defaults({transitiveOverrides : type.options.transitiveOverrides.concat(typeDefinition.transitiveOverrides)}, type.options);
    }
    if (typeDefinition.staticTransitiveOverrides){
        type.options = defaults({staticTransitiveOverrides : type.options.staticTransitiveOverrides.concat(typeDefinition.staticTransitiveOverrides)}, type.options);
    }
    type.prototype.$dirtyableElementsIterator = nonPrimitiveElementsIterator(complex, parent.prototype);
    type.prototype.$atomsIterator = atomsIterator(definedSpec, parent.prototype);
    if (!~type.options.transitiveOverrides.indexOf('toJSON')){
        type.prototype.toJSON = toJSON(type);
    }
    if (!~type.options.transitiveOverrides.indexOf('toJS')) {
        type.prototype.toJS = toJS(type);
    }
    forEach(definedSpec, function(fieldDef:Type<any, any>, fieldName:string) {
        Object.defineProperty(type.prototype, fieldName, fieldAttribute(fieldName));
    });
    type.__refType = generateRefType(type);
}

function validateField(type:Class<any>, parentSpec:Schema, fieldName:string, fieldDef:Type<any, any>, parentName:string):boolean {
    let error: any = null;
    const errorContext = MuObject.createErrorContext(`Type definition error`, 'fatal');
    let path = `${type.id}.${fieldName}`;
    // TODO validate (sanitize) field name against js injection
    if (~RESERVED_FIELDS.indexOf(fieldName)){
        error = 'is a reserved field.';
    } else if (parentSpec[fieldName]) { // todo add '&& !isAssignableFrom(...) check to allow polymorphism
        error = `already exists on super ${parentName}`;
    } else {
        const err = reportFieldDefinitionError(fieldDef);
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

// TODO: find a place for the reference type

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
