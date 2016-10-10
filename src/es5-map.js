import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import defineType from './define-type';
import BaseType from './base-type';
import {getValueTypeName} from './utils';
import Number from './number';
import String from './string';
import * as generics from './generic-types';
import {validateValue, validateNullValue, misMatchMessage, arrow} from './validation';
import {validateAndWrap} from './type-match';
import {observable, asFlat, asMap} from 'mobx';
const MAILBOX = getMailBox('Mutable.Es5Map');

function entries(map){
    return (typeof map.entries === 'function')? map.entries() : objEntries(map);
}
// because Object.entries is too tall an order
function objEntries(obj) {
    return Object.keys(obj).map((key) => [key, obj[key]]);
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

class _Es5Map extends BaseType {

    static defaults() { return {}; }

    static cloneValue(value) {
        if (_.isArray(value)  || _Es5Map.validateType(value) || _.isObject(value)) {
            if (!value){
                return value;
            }
            if (!isIterable(value)){
                value = entries(value);
            }
            _Es5Map._allowIterable(value, this.options);
            var result = [];
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
            return _Es5Map._allowIterable(value, this.options, errorDetails);
        } else if (value instanceof Object) {
            return _Es5Map._allowIterable(objEntries(value), this.options, errorDetails);
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
        return observable(asMap(result, asFlat));
    }

    static validate(value) {
        return validateValue(this, value) || isIterable(value) || value instanceof Object;
    }

    static wrapValue(value, spec, options, errorContext) {
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
            var valueTypeError = generics.reportDefinitionErrors(ops.subTypes, BaseType.reportFieldDefinitionError, 'value');
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
                subTypes = generics.normalizeTypes(subTypes);
                break;
            default:
                subTypes = generics.normalizeTypes(subTypes);
                definitionError = { path: `Es5Map<${generics.toUnwrappedString(subTypes)},${arrow}unallowed>`, message: `Too many types for map (${arguments.length}). Use Es5Map<SomeType>` };
        }
        return this.withDefault(undefined, undefined, { subTypes, definitionError: definitionError });

    };


    static createErrorContext(entryPoint, level, options) {
        return {
            entryPoint,
            level,
            path: 'Es5Map' + generics.toString(options.subTypes)
        }
    }

    static preConstructor(){
        const report = this.reportDefinitionErrors();
        if (report) {
            MAILBOX.error(`Es5Map constructor: "${report.path}" ${report.message}`);
        }
        super.preConstructor();
    }

    constructor(value = [], options = { subTypes: {} }, errorContext = null) {
        if (!errorContext) {
            errorContext = _Es5Map.createErrorContext('Es5Map constructor error', 'error', options);
        }
        options.subTypes = generics.normalizeTypes(options.subTypes);
        super(value, options, errorContext);
    }

    // shallow merge native javascript data into the map
    setValue(newValue, errorContext = null) {
        let changed = false;
        if (this.$isDirtyable()) {
            errorContext = errorContext || this.constructor.createErrorContext('Map setValue error', 'error', this.__options__);
            newValue = this.constructor.wrapValue(newValue, null, this.__options__, errorContext);
            newValue.forEach((val, key) => {
                changed = changed || (this.__value__.get(key) !== val);
            });
            if (!changed) {
                this.__value__.forEach((val, key) => {
                    changed = changed || val !== newValue.get(key);
                });
            }
            // apply changes only after no error was thrown.
            // otherwise we can get an inconsistent map
            if (changed) {
                this.__value__.clear();
                this.__value__.merge(newValue);
            }
        }
        return changed;
    }

    __setValueDeepHandler__(result, key, val, errorContext) {
        let changed = false;
        if (key !== '_type') {
            let oldVal = this.__value__.get(key);
            if (oldVal !== val) {
                if (oldVal && typeof oldVal.setValueDeep === 'function' && !oldVal.$isReadOnly() &&
                    (oldVal.constructor.allowPlainVal(val) || oldVal.constructor.validateType(val))) {
                    changed = oldVal.setValueDeep(val);
                    val = oldVal;
                } else {
                    val = this.constructor._wrapEntryValue(val, this.__options__, this.__lifecycleManager__, errorContext);
                    changed = true;
                }
            }
            result[key] = val;
        }
        return changed;
    }

    // deep merge native javascript data into the map
    setValueDeep(newValue, errorContext = null) {
        const result = {};
        let changed = false;
        if (this.$isDirtyable()) {
            errorContext = errorContext || this.constructor.createErrorContext('Es5Map setValue error', 'error', this.__options__);
            // TODO this code has the same structure as wrapValue, combine both together
            const newEntriesVisitor = (val, key) => {
                changed = this.__setValueDeepHandler__(result, key, val, errorContext) || changed;
            };
            if (BaseType.validateType(newValue)) {
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
            if (!changed) {
                this.__value__.forEach((val, key) => {
                    changed = changed || result[key] === undefined;
                });
            }
            // apply changes only after no error was thrown.
            // otherwise we can get an inconsistent map
            if (changed) {
                this.__value__.clear();
                this.__value__.merge(result);
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
        if (this.$setDirty()) {
            this.__value__.clear();
        }
    }

    delete(key) {
        if (this.$setDirty()){
            let errorContext = this.constructor.createErrorContext('Es5Map delete error', 'error', this.__options__);
            this.constructor._validateEntryKey(key, errorContext);
            return this.__value__.delete(key);
        }
        return false;
    }

    set(key, value) {
        if (this.$setDirty()) {
            let errorContext = this.constructor.createErrorContext('Es5Map set error', 'error', this.__options__);
            this.constructor._validateEntryKey(key, errorContext);
            value = this.constructor._wrapEntryValue(value, this.__options__, this.__lifecycleManager__, errorContext);
            this.__value__.set(key, value);
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
        return this.__unpackIterator__(this.__value__.entries());
    }

    keys() {
        return this.__unpackIterator__(this.__value__.keys());
    }

    values() {
        return this.__unpackIterator__(this.__value__.values());
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
            result[key] = (recursive && value && BaseType.validateType(value)) ? value.toJSON(true, typed) : this.__exposeInner__(value);
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
            if (value && _.isFunction(value.$calcLastChange)) {
                yielder(this, value);
            }
        });
    }
    get size() {
        return this.__value__.size;
    }
}

export default defineType('Es5Map', {
    spec: function() {
        return {};
    }
}, null, _Es5Map);
