import {ErrorContext, ErrorMessage, Validator, ClassOptions, MutableObj} from './types';
import _BaseType from './base-type';
import {getMailBox, Level} from 'escalate';
import {generateClassId, getDefinedType} from './utils';
import {forEach, isFunction} from 'lodash';
import {misMatchMessage as _mmm, validateValue} from './validation';
import {BaseAtom, untracked} from 'mobx';
// ---- typify imports
function cast<T>(ref:any): T{
    return ref as T;
}
type mmmType = (errorContext:ErrorContext, expected:{id:string}|string, actual:any, overridepath?:string, template?:string)=>string;
const misMatchMessage = cast<mmmType>(_mmm);
const BaseType : Class = cast<Class>(_BaseType);
// done typifying imports

// ----- typify module I/O


interface PrimitiveBase{
    reportDefinitionErrors():ErrorMessage;
    isJsAssignableFrom(other:new(...args:any[])=>any):boolean;
    withDefault(defaults:MutableObj, validate:Validator, options:ClassOptions):Class;
    reportSetValueErrors(value:any):ErrorMessage;
}

interface Class extends PrimitiveBase{
    id:string;
    ancestors : string[];
    _spec:Spec;
    __proto__:Class;
    options:ClassOptions;
    getFieldsSpec():Spec;
    defaults():MutableObj;
    validate:Validator;
    validateType:Validator;
    createErrorContext(entryPoint:string, level:Level):ErrorContext;
    reportFieldDefinitionError(field:FieldDef):ErrorMessage;
    new(...args: any[]): MutableObj;
}

type FieldDef = Class | any;
/**
 * the internal schema of a defined class
 */
interface Spec{
    [fieldName:string] :  FieldDef;
}

/**
 * the schema of the class to define (input format)
 */
interface Schema{
    [fieldName:string] :  Class;
}
/**
 * the metadata of the type to define
 */
interface Metadata{
    spec(self:Class) : Schema;
}
// done typify module I/O


const MAILBOX = getMailBox('Mutable.extend');

export default function defineType(id:string, typeDefinition: Metadata, _ParentType?: Class, TypeConstructor?: Class) {
    const ParentType = TypeConstructor || _ParentType || BaseType;
    if (!BaseType.isJsAssignableFrom(ParentType)){
        MAILBOX.fatal(`Type definition error: ${id} is not a subclass of core3.Type`);
    }
    class Type extends ParentType {
        static ancestors = ParentType.ancestors.concat([ParentType.id]);
        static id = id;
        static uniqueId = generateClassId();
        constructor(...args:any[]){
            super(...args);
        }
    }
    // values that are calculated from spec require Type to be defined (for recursive types) so they are attached to the class after definition
    const typeSelfSpec = typeDefinition.spec(Type);
    const baseSpec = ParentType && ParentType.getFieldsSpec ? ParentType.getFieldsSpec() : {};
    normalizeSchema(Type, baseSpec, typeSelfSpec, ParentType.id);
    Type.__proto__ = Object.create(ParentType); // inherint non-enumerable static properties
    Type._spec = generateSpec(id, typeSelfSpec, baseSpec);
    setSchemaIterators(Type.prototype, typeSelfSpec, ParentType.prototype);
    generateFieldsOn(Type.prototype, typeSelfSpec);
    return Type;
}


function defineGenericField(source:Class){
    const result =  defineType('GenericType', {spec: () => ({})})
        .withDefault(source.defaults(), source.validate, source.options);
    result.validateType = (value) => validateValue(source, value);
    return result;
}


function normalizeSchema(type:Class, parentSpec:Spec, typeSelfSpec:Schema, parentName:string) {
    forEach(typeSelfSpec, (fieldDef:FieldDef, fieldName:string) => {
        if (validateField(type, parentSpec, fieldName, fieldDef, parentName)){
            if (getDefinedType(fieldDef) === BaseType) {
                typeSelfSpec[fieldName] = defineGenericField(fieldDef);
            }
        }
        // maybe we should delete the field from the spec if it's not valid?
    });
}

function validateField(type:Class, parentSpec:Schema, fieldName:string, fieldDef:Class, parentName:string):boolean {
    let error;
    const errorContext = BaseType.createErrorContext(`Type definition error`, 'fatal');
    let path = `${type.id}.${fieldName}`;
    if (BaseType.prototype[fieldName]){
        error = 'is a reserved field.';
    } else if (parentSpec[fieldName]) { // todo add '&& !isAssignableFrom(...) check to allow polymorphism
        error = `already exists on super ${parentName}`;
    } else {
        const err = BaseType.reportFieldDefinitionError(fieldDef);
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
    forEach(spec, (field:FieldDef, fieldName:string) => {
        baseSpec[fieldName] = field;
    });
    return baseSpec;
}

function setSchemaIterators(proto:MutableObj, spec:Schema, parent:MutableObj) {
    const complex:Array<string> = [];
    for (let k in spec) {
        if (spec[k] && spec[k]._spec) {
            complex[complex.length] = k;
        }
    }
    proto.$dirtyableElementsIterator = function typeDirtyableElementsIterator(yielder) {
        for (let c of complex) {
            let k = this.__value__[c];
            if (k && isFunction(k.$setManager)) { // if value is dirtyable
                yielder(this, k);
            }
        }
        parent && isFunction(parent.$dirtyableElementsIterator) && parent.$dirtyableElementsIterator.call(this, yielder);
    };
    proto.$atomsIterator = function atomsIterator(yielder) {
        for (var c in spec) {
            if (spec.hasOwnProperty(c)) {
                let a = this.__value__.$mobx.values[c];
                if (a && isFunction(a.reportObserved)) {
                    yielder(a);
                }
            }
        }
        parent && isFunction(parent.$atomsIterator) && parent.$atomsIterator.call(this, yielder);
    };
}

function generateFieldsOn(proto:any, fieldsDefinition:Schema) {
    forEach(fieldsDefinition, function(fieldDef:Class, fieldName:string) {
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
