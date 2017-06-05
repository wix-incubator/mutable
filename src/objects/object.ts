import * as _ from 'lodash';
import {MuBase, defineNonPrimitive} from "../core/base";
import {
    DeepPartial, Type, ErrorDetails, ClassOptions, ErrorContext, NonPrimitiveType, ReadonlyMutable,
    Mutable
} from "../types";
import {getMailBox} from "escalate";
import {shouldAssign, getPrimeType} from "../utils";
import {validateNullValue, isAssignableFrom, misMatchMessage} from "../core/validation";
import {validateAndWrap} from "../core/type-match";
import {optionalSetManager, DirtyableYielder, AtomYielder} from "../core/lifecycle";
import {defaultObject} from "./default-object";
import {Class, Spec, ObjectAdministrator, MutableObj} from "./types";
import {extras, BaseAtom} from "mobx";
import {default as config} from '../config';

const MAILBOX = getMailBox('mutable.MuObject');

function getClass<T>(inst:MuObject<T>): Class<T>{
    return inst.constructor as Class<T>;
}

class FakeObjectAdministrator implements ObjectAdministrator{
    atoms:{[k:string]:BaseAtom} = {};
    constructor(public name:string){}
}
(FakeObjectAdministrator.prototype as any)["isMobXObservableObjectAdministration"] = true;

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
        return validateNullValue(this, value) ||
            super.validate(value) && !!(value && Object.keys(this._spec).every(key=>this._spec[key].validate(value[key])));
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

    static makeAdmin(name:string){
        const $mobx = new FakeObjectAdministrator(name);
        if (config.observable) {
            _.each(this._spec, (fieldSpec: Type<any, any>, key: string) => {
                $mobx.atoms[key] = new BaseAtom(`[${name}].${key}`);
            });
        }
        return $mobx;
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
            newValue[key] = validateAndWrap(fieldVal, fieldSpec, undefined, fieldErrorContext);
        });
        return newValue;
    }

    static create<T>(this:NonPrimitiveType<any, T>, value?:DeepPartial<T>, options?:ClassOptions, errorContext?:ErrorContext){
        if (MuObject as any === getPrimeType(this)){
            return defaultObject(this.defaults());
        } else {
            return new this(value, options, errorContext);
        }
    }
    protected $mobx: FakeObjectAdministrator;
    protected __readOnlyInstance__: ReadonlyMutable<T> & T;
    protected __readWriteInstance__: Mutable<T> & T;

    constructor(value?:DeepPartial<T>|null, options?:ClassOptions, errorContext?:ErrorContext) {
        super(value, options, errorContext);
        errorContext = errorContext || this.__ctor__.createErrorContext('Type constructor error', 'error');
        if (MuObject as any === getPrimeType(this.__ctor__)){
            MAILBOX.post(errorContext.level, `${errorContext.entryPoint}: "${errorContext.path}" Instantiating the base type is not allowed. You should extend it instead.`);
        } else if (MuObject.uniqueId === getPrimeType(this.__ctor__).uniqueId) {
            MAILBOX.post(errorContext.level, `${errorContext.entryPoint}: "${errorContext.path}" "${this.__ctor__.name}" is not inherited correctly. Did you remember to import core3-runtime?`);
        }
        this.$mobx = getClass(this).makeAdmin(this.getName());
        if (extras.isSpyEnabled()) {
            _.forEach(getClass(this)._spec, (fieldValue, fieldName:keyof T) => {
                extras.spyReportStart({
                    type: "add",
                    object: this,
                    name:fieldName,
                    newValue: (this as any as T)[fieldName]
                });
                extras.spyReportEnd();
            });
        }
    }

    getName():string {
        return getClass(this).id + '#' + this.getRuntimeId();
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
            _.forEach(getClass(this)._spec, (fieldSpec, fieldName:keyof T) => {
                const inputFieldValue:any = newValue[fieldName];
                const fieldValue = (inputFieldValue !== undefined) ? inputFieldValue : fieldSpec.defaults();
                if(fieldValue === null ||  fieldSpec.validateType(fieldValue)){
                    changed = this.$assignField(fieldName, fieldValue) || changed;
                }else {
                    const value:any = this.__value__[fieldName];
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
        if (shouldAssign(this.__value__[fieldName], newValue)) {
            const fieldDef = getClass(this)._spec[fieldName];
            const checkTyped = newValue instanceof MuBase || isAssignableFrom(MuBase, fieldDef);
            // for typed field, validate the type of the value. for untyped field (primitive), just validate the data itself
            if ((checkTyped && fieldDef.validateType(newValue)) || (!checkTyped && fieldDef.validate(newValue))) {
                const notifySpy = extras.isSpyEnabled();
                if (config.observable && notifySpy) {
                    extras.spyReportStart({
                        type: "update",
                        object: this,
                        name:fieldName,
                        newValue,
                        oldValue: this.__value__[fieldName]
                    });
                }
                this.__value__[fieldName] = newValue;
                optionalSetManager(newValue, this.__lifecycleManager__);
                if (config.observable) {
                    this.$mobx.atoms[fieldName].reportChanged();
                    if (notifySpy)
                        extras.spyReportEnd();
                }
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
    }

    toJS(typed = false):T { return {} as any};
    toJSON(recursive = true, typed = false):T {return {} as any;}
    $dirtyableElementsIterator(yielder: DirtyableYielder): void {}
    $atomsIterator(yielder: AtomYielder): void {}
}

defineNonPrimitive('Object', MuObject);
