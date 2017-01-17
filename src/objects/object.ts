import * as _ from 'lodash';
import {MuBase, defineNonPrimitive} from "../base";
import {DeepPartial, Type, ErrorDetails, ClassOptions, ErrorContext, NonPrimitiveType} from "../types";
import {getMailBox} from "escalate";
import {shouldAssign, getPrimeType} from "../utils";
import {validateNullValue, isAssignableFrom, misMatchMessage} from "../validation";
import {validateAndWrap} from "../type-match";
import {asReference, observable, untracked, IAtom} from "mobx";
import {optionalSetManager, DirtyableYielder, AtomYielder} from "../lifecycle";
import {defaultObject} from "./default-object";
import {FieldAtom} from "./field-atom";
import {Class, Spec} from "./types";

const MAILBOX = getMailBox('mutable.MuObject');

function getClass<T>(inst:MuObject<T>): Class<T>{
    return inst.constructor as Class<T>;
}

export class MuObject<T extends {}> extends MuBase<T>{
    static id = 'Object';
    static _spec: Spec = Object.freeze(Object.create(null));

    static cloneValue(value:{[key:string]:any}) {
        if (!_.isObject(value)) { return {}; }

        return _.reduce<Type<any, any>, {[key :string]:Type<any, any>}>(this._spec, (cloneObj, fieldSpec, fieldId) => {
            cloneObj[fieldId] = fieldSpec.cloneValue(value[fieldId]);
            return cloneObj;
        }, {});
    }

    static defaults<T>(circularFlags = ''):DeepPartial<T>|null {
        const spec = this._spec;
        const circularFlagsNextLevel = (circularFlags ? circularFlags : ';') + this.uniqueId + ';';
        //var args = arguments;
        const isCircular = ~circularFlags.indexOf(';' + this.uniqueId + ';');
        if (isCircular) {
            if (!this.options || !this.options.nullable) {
                MAILBOX.warn('DEFAULT CIRCULAR DATA! resolving value as null - please add better error/warning');
            }
            return null;
        } else {
            return Object.keys(this._spec).reduce<{[k:string]:any}>(function(val, key) {
                const fieldSpec = spec[key];
                val[key] = fieldSpec.defaults.call(fieldSpec, circularFlagsNextLevel);
                return val;
            }, {}) as any as DeepPartial<T>;
        }
    }

    static getFieldsSpec(){
        return _.clone(this._spec);
    }

    static validate(value:any):value is any {
        if(value===undefined){
            return false;
        }
        return validateNullValue(this, value) ||
            Object.keys(this._spec).every(function(key) {
                return this._spec[key].validate(value[key])
            }, this);
    }

    static allowPlainVal(value:any, errorDetails?:ErrorDetails):boolean {
        if (validateNullValue(this, value)){
            return true;
        } else if(_.isPlainObject(value)){
            // todo: instead of (value._type === this.id) use global types registry and isAssignableFrom()
            if (value._type && value._type !== this.id){
                if (errorDetails){
                    errorDetails.expected = this;
                    errorDetails.actual = value;
                }
                return false;
            }
            return Object.keys(this._spec).every(fieldName => {
                if (value[fieldName] === undefined || this._spec[fieldName].validateType(value[fieldName])){
                    return true;
                } else {
                    let fieldErrorDetails = errorDetails && _.defaults({path: `${errorDetails.path}.${fieldName}`}, errorDetails);
                    let result = this._spec[fieldName].allowPlainVal(value[fieldName], fieldErrorDetails);
                    if (errorDetails && !result){
                        _.assign(errorDetails, fieldErrorDetails);
                        return false;
                    }
                    return true;
                }
            });
        }
        return false;
    }


    static byReference(provider:() => any, path:Array<string|number> = []){
        const result = new this();
        result.__value__ = new this.__refType(provider, path);
        return result;
    }

    static makeValue<T extends Object>(value:DeepPartial<T>|null, options?:ClassOptions, errorContext?:ErrorContext):T|null {
        return this.wrapValue<T>(value, this._spec, options, errorContext);
    }

    static makeAtoms(){
        const atoms:{[k:string]:FieldAtom} = {};
        _.each(this._spec, (fieldSpec:Type<any, any>, key:string) => {
            atoms[key] = new FieldAtom('somePath.'+key);
        });
        return atoms;
    }

    static wrapValue<T extends Object>(value:DeepPartial<T>|null, spec:Spec, options?:ClassOptions, errorContext?:ErrorContext):T|null {
        if (value === null){
            return null;
        }
        const newValue:T = {} as T;
        _.each(spec, (fieldSpec:Type<any, any>, key:keyof T) => {
            let fieldVal = value[key];

            if (fieldVal === undefined) {
                fieldVal = spec[key].defaults();
            }
            let fieldErrorContext:ErrorContext = errorContext?
                _.defaults({path: errorContext.path + '.' + key }, errorContext) :
                this.createErrorContext(key, 'warn');
            const newField = validateAndWrap(fieldVal, fieldSpec, undefined, fieldErrorContext);
            newValue[key] = asReference(newField); // we use asReference because it's stronger than asFlat: it does not treat functions as computed values
        });
        return observable(newValue);
    }

    static create<T>(this:NonPrimitiveType<any, T>, value?:DeepPartial<T>, options?:ClassOptions, errorContext?:ErrorContext){
        if (MuObject as any === getPrimeType(this)){
            return defaultObject(this.defaults());
        } else {
            return new this(value, options, errorContext);
        }
    }
    protected __atoms__: {[l:string/*keyof T*/]:FieldAtom};

    constructor(value?:DeepPartial<T>|null, options?:ClassOptions, errorContext?:ErrorContext) {
        super(value, options, errorContext);
        errorContext = errorContext || this.__ctor__.createErrorContext('Type constructor error', 'error');
        this.__atoms__ = getClass(this).makeAtoms();
        if (MuObject as any === getPrimeType(this.__ctor__)){
            MAILBOX.post(errorContext.level, `${errorContext.entryPoint}: "${errorContext.path}" Instantiating the base type is not allowed. You should extend it instead.`);
        } else if (MuObject.uniqueId === getPrimeType(this.__ctor__).uniqueId) {
            MAILBOX.post(errorContext.level, `${errorContext.entryPoint}: "${errorContext.path}" "${this.__ctor__.name}" is not inherited correctly. Did you remember to import core3-runtime?`);
        }
    }

    // this method traverses the input recursively until it reaches mutable values (then it sets them)
    setValue(newValue:DeepPartial<T>, errorContext:ErrorContext= getClass(this).createErrorContext('setValue error', 'error')):boolean {
        if (this.$isDirtyable()) {
            let changed = false;
            _.forEach(newValue, (fieldValue, fieldName:keyof T) => {
                const fieldSpec = getClass(this)._spec[fieldName];
                if (fieldSpec) {
                    const fieldErrorContext = _.defaults({path: errorContext.path + '.' + fieldName }, errorContext);
                    const newValue = fieldSpec._matchValue(fieldValue, fieldErrorContext).wrap();
                    changed = this.$assignField(fieldName, newValue, fieldErrorContext) || changed;
                }
            });
            return changed;
        }
        return false;
    }

    // this method traverses the input recursively until it reaches mutable values (then it sets them)
    setValueDeep(newValue:DeepPartial<T>, errorContext:ErrorContext =  getClass(this).createErrorContext('setValueDeep error', 'error')):boolean {
        if (this.$isDirtyable()) {
            let changed = false;
            _.forEach( getClass(this)._spec, (fieldSpec, fieldName:keyof T) => {
                const inputFieldValue:any = newValue[fieldName];
                const fieldValue = (inputFieldValue !== undefined) ? inputFieldValue : fieldSpec.defaults();
                if(fieldValue === null ||  fieldSpec.validateType(fieldValue)){
                    changed = this.$assignField(fieldName, fieldValue) || changed;
                }else {
                    const value:any = untracked(() => this.__value__[fieldName]);
                    if(value && value.setValueDeep && !value.$isReadOnly()){
                        changed = value.setValueDeep(fieldValue, errorContext) || changed;
                    }else{
                        const fieldErrorContext = {
                            level: errorContext.level,
                            entryPoint: errorContext.entryPoint,
                            path: errorContext.path + '.' + fieldName
                        };
                        changed = this.$assignField(fieldName, validateAndWrap(fieldValue, fieldSpec, this.__lifecycleManager__, fieldErrorContext), fieldErrorContext) || changed;
                    }
                }
            });
            return changed;
        }
        return false;
    }



    // validates and assigns input to field.
    // will report error for undefined fields
    // returns whether the field value has changed
    $assignField(fieldName:keyof T, newValue:any, errorContext?:ErrorContext) {
        // don't assign if input is the same as existing value
        if(untracked(() => {
                if (shouldAssign(this.__value__[fieldName], newValue)) {
                    const fieldDef = getClass(this)._spec[fieldName];
                    const typedField = isAssignableFrom(MuBase, fieldDef);
                    // for typed field, validate the type of the value. for untyped field (primitive), just validate the data itself
                    if ((typedField && fieldDef.validateType(newValue)) || (!typedField && fieldDef.validate(newValue))) {
                        // validation passed set the value
                        optionalSetManager(newValue, this.__lifecycleManager__);
                        return true;
                    } else {
                        if (!errorContext){
                            errorContext = this.__ctor__.createErrorContext('Set error', 'error');
                            errorContext.path  = errorContext.path + '.'+fieldName;
                        }
                        MAILBOX.post(errorContext.level, misMatchMessage(errorContext,fieldDef, newValue));
                    }
                }
                return false;
            })){
            this.__value__[fieldName] = newValue;
            return true;
        }
        return false;
    }

    toJSON(recursive = true, typed = false):T {
        const result:T & {_type:string} = Object.keys( getClass(this)._spec).reduce((json, key: keyof T) => {
            var fieldValue:any = this.__value__[key];
            json[key] = recursive && fieldValue && fieldValue.toJSON ? fieldValue.toJSON(true, typed) : fieldValue;
            return json;
        }, {} as T & {_type:string});
        if (typed){
            result._type = getClass(this).id;
        }
        return result;
    }

    toJS(typed = false):T {
        const result: T & {_type:string} = Object.keys(getClass(this)._spec).reduce((json, key: keyof T) => {
            const fieldValue:any = this.__value__[key];
            json[key] = fieldValue && fieldValue.toJS ? fieldValue.toJS() : fieldValue;
            return json;
        },  {} as T & {_type:string});
        if (typed){
            result._type = getClass(this).id;
        }
        return result;
    }

    $dirtyableElementsIterator(yielder: DirtyableYielder): void {}
    $atomsIterator(yielder: AtomYielder): void {}
}

defineNonPrimitive('Object', MuObject);
