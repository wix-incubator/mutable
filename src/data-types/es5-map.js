import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import {getValueFromRootRef, getReferenceWrapper, reportFieldDefinitionError} from './../utils';
import {MuBase, defineNonPrimitive} from './../core/base';
import * as generics from './../core/generic-types';
import {validateValue, validateNullValue, misMatchMessage, arrow} from './../core/validation';
import {validateAndWrap} from './../core/type-match';
import {MapWrapperOverDictionary} from './map-wrapper';
import {observable, untracked, extras, autorun} from 'mobx';
import {shouldAssign} from './../utils';
import {default as config} from '../config';
const MAILBOX = getMailBox('mutable.Es5Map');

function entries(map){
    return (typeof map.entries === 'function')? map.entries() : objEntries(map);
}
// because Object.entries is too tall an order
function objEntries(obj) {
    return Object.keys(obj).reduce((prevValue, key) => {
        if(key !== '_type') {
            prevValue.push([key, obj[key]]);
        }
        return prevValue;
    }, []);
}

function safeAsReadOnly(item) {
    return (item && typeof item.$asReadOnly === 'function') ? item.$asReadOnly() : item;
}

function safeAsReadOnlyOrArr(item) {
    if (_.isArray(item)) {
        return item.map(safeAsReadOnlyOrArr);
    } else {
        return safeAsReadOnly(item);
    }
}

function isIterable(value) {
    return value && (_.isArray(value) || value instanceof Map || typeof value[Symbol.iterator] === 'function');
}


class MapReferenceToDictionary extends MapWrapperOverDictionary{
    constructor(rootReference, path, thisType){
        super(() => getValueFromRootRef(rootReference, path),
            (value, idx) => getReferenceWrapper(thisType, thisType.options.subTypes, rootReference, path.concat(idx), value));
    }
}


export default class Es5Map extends MuBase {

    static defaults() { return {}; }

    static cloneValue(value) {
        if (_.isArray(value)  || Es5Map.validateType(value) || _.isObject(value)) {
            if (!value){
                return value;
            }
            if (!isIterable(value)){
                value = entries(value);
            }
            Es5Map._allowIterable(value, this.options);
            const result = [];
            for (let entry of value) {
                result.push(entry);
            }
            return result;
        } else {
            return [];
        }
    }

    static _allowIterable(iterable, options, errorDetails = null) {
        if (options && options.subTypes){
            for (let [key, value] of iterable) {
                if(!generics.getMatchingType(options.subTypes, value)){
                    if (errorDetails){
                        errorDetails.path = `${errorDetails.path}[${key}]`;
                        errorDetails.expected = generics.toString(options.subTypes);
                        errorDetails.actual = value;
                    }
                    return false;
                }
            }
        }
        return true;
    }

    static allowPlainVal(value, errorDetails = null) {
        if (validateNullValue(this, value)) {
            return true;
        } else if (isIterable(value)) {
            return Es5Map._allowIterable(value, this.options, errorDetails);
        } else if (value instanceof Object) {
            return Es5Map._allowIterable(objEntries(value), this.options, errorDetails);
        }
        return false;
    }

    static _validateEntryKey(key, errorContext) {
        if (typeof key !== 'string') {
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, '<string>', key, null, 'key'));
        }
    }

    static _wrapEntryValue(value, options, lifeCycle, errorContext) {
        var result = generics.doOnType(options.subTypes, type => {
            if (type.validateType(value) || type.allowPlainVal(value)) {
                return validateAndWrap(value, type, lifeCycle, errorContext);
            }
        });
        if (null === result || undefined === result) {
            var allowedTypes = generics.toString(options.subTypes);
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, allowedTypes, value, null, 'value'));
        } else {
            return result;
        }
    }

    static _wrapIterable(iterable, options, lifeCycle, errorContext) {
        var result = {};
        for (let [key, value] of iterable) {
            if(key !== '_type') {
                this._validateEntryKey(key, errorContext);
                value = this._wrapEntryValue(value, options, lifeCycle, errorContext);
                result[key] = value;
            }
        }
        return config.observable? observable.shallowMap(result) : Object.keys(result).reduce((map, key) => map.set(key, result[key]), new Map());
    }

    static validate(value) {
        return validateValue(this, value) || isIterable(value) || value instanceof Object;
    }

    static makeValue(value, options, errorContext) {
        if (super.validateType(value)) {
            return this._wrapIterable(value.__value__.entries(), options, null, errorContext);
        }
        if (isIterable(value)) {
            return this._wrapIterable(value, options, null, errorContext);
        }
        if (_.isObject(value)) {
            return this._wrapIterable(objEntries(value), options, null, errorContext);
        } else {
            MAILBOX.error('Unknown or incompatible Map value : ' + JSON.stringify(value));
        }
    }

    static reportDefinitionErrors() {
        const ops = this.options;
        if (ops && ops.definitionError) {
            return ops.definitionError;
        }
        if (!ops || !ops.subTypes) {
            return { path: arrow + 'Es5Map', message: `Untyped Maps are not supported please state types of key and value in the format core3.Es5Map<SomeType>` }
        } else {
            var valueTypeError = generics.reportDefinitionErrors(ops.subTypes, reportFieldDefinitionError, 'value');
            if (valueTypeError) {
                return { path: `Es5Map<${valueTypeError.path || arrow + generics.toUnwrappedString(ops.subTypes)}>`, message: valueTypeError.message };
            }
        }
    }

    static of(subTypes) {
        var definitionError;
        switch (arguments.length) {
            case 0:
                definitionError = { path: arrow + 'Es5Map', message: 'Missing types for map. Use Es5Map<SomeType>' };
                break;
            case 1:
                subTypes = generics.typesAsArray(subTypes);
                break;
            default:
                subTypes = generics.typesAsArray(subTypes);
                definitionError = { path: `Es5Map<${generics.toUnwrappedString(subTypes)},${arrow}unallowed>`, message: `Too many types for map (${arguments.length}). Use Es5Map<SomeType>` };
        }
        return this.withDefault(undefined, undefined, { subTypes, definitionError: definitionError });

    };


    static createErrorContext(entryPoint, level, options) {
        options = options || this.options || this.__options__;
        return {
            entryPoint,
            level,
            path: 'Es5Map' + generics.toString(options? options.subTypes : [])
        }
    }

    static byReference(provider, path = []){
        // wrap provider
        const result = new this();
        result.__value__ = new MapReferenceToDictionary(provider, path, this);
        return result;
    }

    constructor(value = [], options = { subTypes: {} }, errorContext = null) {
        if (!errorContext) {
            errorContext = Es5Map.createErrorContext('Es5Map constructor error', 'error', options);
        }
        options.subTypes = generics.typesAsArray(options.subTypes);
        super(value, options, errorContext);
        const report = this.__ctor__.reportDefinitionErrors();
        if (report) {
            MAILBOX.error(`Es5Map constructor: "${report.path}" ${report.message}`);
        }
    }

    // shallow merge native javascript data into the map
    setValue(newValue, errorContext = null) {
        let changed = false;
        if (this.$isDirtyable()) {
            untracked(() => {
                errorContext = errorContext || this.constructor.createErrorContext('Map setValue error', 'error', this.__options__);
                newValue = this.constructor.makeValue(newValue, this.__options__, errorContext);
                newValue.forEach((val, key) => {
                    changed = changed || shouldAssign(this.__value__.get(key), val);
                });
                if (!changed) {
                    this.__value__.forEach((val, key) => {
                        changed = changed || shouldAssign(val, newValue.get(key));
                    });
                }
            });
            // apply changes only after no error was thrown.
            // otherwise we can get an inconsistent map
            if (changed) {
                if(config.observable) {
                    this.__value__.clear();
                    this.__value__.merge(newValue);
                } else {
                    this.__value__ = newValue
                }

            }
        }
        return changed;
    }

    __setValueDeepHandler__(toSet, toSetValueDeep, key, val, errorContext) {
        if (key !== '_type') {
            let oldVal = this.__value__.get(key);
            if (shouldAssign(this.__value__.get(key), val)) {
                if (oldVal && typeof oldVal.setValueDeep === 'function' && !oldVal.$isReadOnly() &&
                    (oldVal.constructor.allowPlainVal(val) || oldVal.constructor.validateType(val))) {
                    toSetValueDeep[key]=[oldVal, val];
                } else if (shouldAssign(this.__value__.get(key), val)) {
                    val = this.constructor._wrapEntryValue(val, this.__options__, this.__lifecycleManager__, errorContext);
                    toSet[key] = val;
                }
            }
        }
    }

    // deep merge native javascript data into the map
    setValueDeep(newValue, errorContext = null) {
        const toSet = {};
        const toSetValueDeep = {};
        let toDelete = {};
        let changed;
        if (this.$isDirtyable()) {
            // collect data for change
            untracked(() => {
                errorContext = errorContext || this.constructor.createErrorContext('Es5Map setValue error', 'error', this.__options__);
                // TODO this code has the same structure as makeValue, combine both together
                this.__value__.keys().forEach(key => toDelete[key] = true);
                const newEntriesVisitor = (val, key) => {
                    delete toDelete[key];
                    this.__setValueDeepHandler__(toSet, toSetValueDeep, key, val, errorContext);
                };
                if (MuBase.validateType(newValue)) {
                    newValue.__value__.forEach(newEntriesVisitor);
                } else if (isIterable(newValue)) {
                    for (let [key, val] of newValue) {
                        newEntriesVisitor(val, key);
                    }
                } else if (_.isObject(newValue)) {
                    for (let key in newValue) {
                        if (newValue.hasOwnProperty(key)) {
                            const val = newValue[key];
                            newEntriesVisitor(val, key);
                        }
                    }
                } else {
                    MAILBOX.error('Unknown or incompatible Es5Map value : ' + JSON.stringify(newValue));
                }
            });

            // apply changes
            _.forEach(toSetValueDeep, ([oldVal, val], key) => changed = oldVal.setValueDeep(val, errorContext) || changed);
            if (Object.keys(toSet).length || Object.keys(toDelete).length) {
                Object.keys(toDelete).forEach(key => this.__value__.delete(key));
                _.forEach(toSet, (val, key) => this.__value__.set(key, val));
                changed = true;
            }
        }
        return changed;
    }
    __exposeInner__(item) {
        if (this.__isReadOnly__) {
            return safeAsReadOnlyOrArr(item);
        }
        return item;
    }

    // Needed to support TypeScript's transpilation of "for x of y"
    __unpackIterator__(innerIterator) {
        return this.__isReadOnly__ ? innerIterator.map(safeAsReadOnlyOrArr) : innerIterator;
    }

    clear() {
        if (this.$isDirtyable()) {
            this.__value__.clear();
        }
    }

    delete(key) {
        if (this.$isDirtyable()){
            let errorContext = this.constructor.createErrorContext('Es5Map delete error', 'error', this.__options__);
            this.constructor._validateEntryKey(key, errorContext);
            return this.__value__.delete(key);
        }
        return false;
    }

    set(key, value) {
        if (this.$isDirtyable()) {
            let errorContext = this.constructor.createErrorContext('Es5Map set error', 'error', this.__options__);
            this.constructor._validateEntryKey(key, errorContext);
            value = this.constructor._wrapEntryValue(value, this.__options__, this.__lifecycleManager__, errorContext);
            if (untracked(() => shouldAssign(this.__value__.get(key), value))) {
                this.__value__.set(key, value);
            }
        }
        return this;
    }

    get(key) {
        let errorContext = this.constructor.createErrorContext('Es5Map get error', 'error', this.__options__);
        this.constructor._validateEntryKey(key, errorContext);
        return this.__exposeInner__(this.__value__.get(key));
    }

    has(key) {
        let errorContext = this.constructor.createErrorContext('Es5Map has error', 'error', this.__options__);
        this.constructor._validateEntryKey(key, errorContext);
        return this.__value__.has(key);
    }

    entries() {
        return this.__unpackIterator__(Array.from(this.__value__.entries()));
    }

    keys() {
        return this.__unpackIterator__(Array.from(this.__value__.keys()));
    }

    values() {
        return this.__unpackIterator__(Array.from(this.__value__.values()));
    }

    forEach(callback, thisArg) {
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        this.__value__.forEach((value, key) => {
            callback(this.__exposeInner__(value), key, this);
        }, thisArg);
    }

    toJSON(recursive = true, typed = false) {
        let result = {};
        this.__value__.forEach((value, key) => {
            result[key] = (recursive && value && MuBase.validateType(value)) ? value.toJSON(true, typed) : this.__exposeInner__(value);
        });
        if (typed) {
            result._type = this.constructor.id;
        }
        return result;
    }

    toJS(typed = false) {
        let result = {};
        this.__value__.forEach((value, key) => {
            result[key] = (value && value.toJS) ? value.toJS(typed) : value;
        });
        if (typed) {
            result._type = this.constructor.id;
        }
        return result;
    }

    /**
     * get iterator over all map keys and values that are dirtyable
     */
    // consider optimizing if array is of primitive type only
    $dirtyableElementsIterator(yielder) {
        this.__value__.forEach((value) => {
            if (value && _.isFunction(value.$setManager)) {
                yielder(this, value);
            }
        });
    }
    $atomsIterator(yielder){
        if(config.observable){
            yielder(extras.getAtom(this.__value__));
            var disposeMeOrIWillLeak = autorun(() => this.__value__.keys().forEach(key => yielder(extras.getAtom(this.__value__, key))));
        }

    }
    get size() {
        return this.__value__.size;
    }
}

defineNonPrimitive('Es5Map', Es5Map);
