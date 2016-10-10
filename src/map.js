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

const MAILBOX = getMailBox('Mutable.Map');

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

function isTypeCompatibleWithPlainJsonObject(options) {
    return !!(options && options.subTypes && generics.getMatchingType(options.subTypes.key, ''));
}

class _Map extends BaseType {

    static defaults() { return new Map(); }

    static cloneValue(value) {
        if (_.isArray(value)  || _Map.validateType(value) ||
            (_.isObject(value) && isTypeCompatibleWithPlainJsonObject(this.options))) {
            if (!value){
                return value;
            }
            if (!isIterable(value)){
                value = entries(value);
            }
            _Map._allowIterable(value, this.options);
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
                if (!generics.getMatchingType(options.subTypes.key, key)){
                    if (errorDetails){
                        errorDetails.path = `${errorDetails.path}[${key}]`;
                        errorDetails.expected = generics.toString(options.subTypes.key);
                        errorDetails.actual = key;
                    }
                    return false;
                } else if(!generics.getMatchingType(options.subTypes.value, value)){
                    if (errorDetails){
                        errorDetails.path = `${errorDetails.path}[${key}]`;
                        errorDetails.expected = generics.toString(options.subTypes.value);
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
            return _Map._allowIterable(value, this.options, errorDetails);
        } else if (value instanceof Object && isTypeCompatibleWithPlainJsonObject(this.options)) {
            return _Map._allowIterable(objEntries(value), this.options, errorDetails);
        }
        return false;
    }

    static _wrapEntryKey(key, options, lifeCycle, errorContext) {
        var result = generics.doOnType(options.subTypes.key, type => {
            if (type.validateType(key) || type.allowPlainVal(key)) {
                return validateAndWrap(key, type, lifeCycle, errorContext);
            }
        });
        if (null === result || undefined === result) {
            var allowedTypes = generics.toString(options.subTypes.key);
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, allowedTypes, key, null, 'key'));
        } else {
            return result;
        }
    }

    static _wrapEntryValue(value, options, lifeCycle, errorContext) {
        var result = generics.doOnType(options.subTypes.value, type => {
            if (type.validateType(value) || type.allowPlainVal(value)) {
                return validateAndWrap(value, type, lifeCycle, errorContext);
            }
        });
        if (null === result || undefined === result) {
            var allowedTypes = generics.toString(options.subTypes.value);
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, allowedTypes, value, null, 'value'));
        } else {
            return result;
        }
    }

    static _wrapIterable(iterable, options, lifeCycle, errorContext) {
        var result = new Map();
        for (let [key, value] of iterable) {
            if(key !== '_type') {
                key = this._wrapEntryKey(key, options, lifeCycle, errorContext);
                value = this._wrapEntryValue(value, options, lifeCycle, errorContext);
                result.set(key, value);
            }
        }
        return result;
    }

    static validate(value) {
        if (validateValue(this, value)) {
            return value.__value__ instanceof Map;
        }
        return isIterable(value) || value instanceof Object;
    }

    static wrapValue(value, spec, options, errorContext) {
        if (super.validateType(value)) {
            if (value.__value__ instanceof Map) {
                return this._wrapIterable(value.__value__, options, null, errorContext);
            } else {
                MAILBOX.error('Strange mutable Map encountered\n __value__:' + JSON.stringify(value.__value__) + '\ninstance: ' + JSON.stringify(value));
            }
        }
        if (isIterable(value)) {
            return this._wrapIterable(value, options, null, errorContext);
        }
        if (value instanceof Object && isTypeCompatibleWithPlainJsonObject(options)) {
            return this._wrapIterable(objEntries(value), options, null, errorContext);
        }
        MAILBOX.error('Unknown or incompatible Map value : ' + JSON.stringify(value));
    }

    static reportDefinitionErrors() {
        const ops = this.options;
        if (ops && ops.definitionError) {
            return ops.definitionError;
        }
        if (!ops || !ops.subTypes || !ops.subTypes.key || !ops.subTypes.value) {
            return { path: arrow + 'Map', message: `Untyped Maps are not supported please state types of key and value in the format core3.Map<string, string>` }
        } else {
            var keyError = generics.reportDefinitionErrors(ops.subTypes.key, BaseType.reportFieldDefinitionError, 'key');
            var valueTypeError = generics.reportDefinitionErrors(ops.subTypes.value, BaseType.reportFieldDefinitionError, 'value');
            if (keyError) {
                var valueTypeStr = valueTypeError ? 'value' : generics.toUnwrappedString(ops.subTypes.value);
                return { path: `Map<${keyError.path || arrow + generics.toUnwrappedString(ops.subTypes.key)},${valueTypeStr}`, message: keyError.message };
            } else if (valueTypeError) {
                var keyTypeStr = generics.toUnwrappedString(ops.subTypes.key);
                return { path: `Map<${keyTypeStr},${valueTypeError.path || arrow + generics.toUnwrappedString(ops.subTypes.value)}>`, message: valueTypeError.message };
            }
        }
    }

    static of(key, value) {
        var definitionError;
        switch (arguments.length) {
            case 0:
                definitionError = { path: arrow + 'Map', message: 'Missing types for map. Use Map<SomeType, SomeType>' };
                break;
            case 1:
                key = generics.normalizeTypes(key);
                definitionError = { path: `Map<${generics.toUnwrappedString(key)},${arrow}value>`, message: `Wrong number of types for map. Instead of Map${generics.toString(key)} Use Map${generics.toString(String, key)}` };
                break;
            case 2:
                key = generics.normalizeTypes(key);
                value = generics.normalizeTypes(value);
                break;
            default:
                key = generics.normalizeTypes(key);
                value = generics.normalizeTypes(value);
                definitionError = { path: `Map<${generics.toUnwrappedString(key)},${generics.toUnwrappedString(value)},${arrow}unallowed>`, message: `Too many types for map (${arguments.length}). Use Map<SomeType, SomeType>` };
        }
        return this.withDefault(undefined, undefined, { subTypes: { key, value }, definitionError: definitionError });

    };


    static createErrorContext(entryPoint, level, options) {
        return {
            entryPoint,
            level,
            path: 'Map' + generics.toString(options.subTypes.key, options.subTypes.value)
        }
    }

    static preConstructor(){
        const report = this.reportDefinitionErrors();
        if (report) {
            MAILBOX.error(`Map constructor: "${report.path}" ${report.message}`);
        }
        super.preConstructor();
    }

    constructor(value = [], options = { subTypes: {} }, errorContext = null) {
        if (!errorContext) {
            errorContext = _Map.createErrorContext('Map constructor error', 'error', options);
        }
        options.subTypes.key = generics.normalizeTypes(options.subTypes.key);
        options.subTypes.value = generics.normalizeTypes(options.subTypes.value);
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
                    changed = changed || (newValue.get(key) !== val);
                });
            }

            if (changed) {
                this.__value__ = newValue;
                this.$setDirty();
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
                    key = this.constructor._wrapEntryKey(key, this.__options__, this.__lifecycleManager__, errorContext);
                    val = this.constructor._wrapEntryValue(val, this.__options__, this.__lifecycleManager__, errorContext);
                    changed = true;
                }
            }
            result.set(key, val);
        }
        return changed;
    }

    // deep merge native javascript data into the map
    setValueDeep(newValue, errorContext = null) {
        let result, changed = false;
        if (this.$isDirtyable()) {
            errorContext = errorContext || this.constructor.createErrorContext('Map setValue error', 'error', this.__options__);
            // TODO this code has the same structure as wrapValue, combine both together
            if (BaseType.validateType(newValue)) {
                if (newValue.__value__ instanceof Map) {
                    result = new Map();
                    newValue.__value__.forEach((val, key) => {
                        changed = this.__setValueDeepHandler__(result, key, val, errorContext) || changed;
                    });
                } else {
                    MAILBOX.error('Strange mutable Map encountered\n __value__:' + JSON.stringify(newValue.__value__) + '\ninstance: ' + JSON.stringify(newValue));
                }
            } else if (isIterable(newValue)) {
                result = new Map();
                for (let [key, val] of newValue) {
                    changed = this.__setValueDeepHandler__(result, key, val, errorContext) || changed;
                }
            } else if (newValue instanceof Object && isTypeCompatibleWithPlainJsonObject(this.__options__)) {
                result = new Map();
                Object.keys(newValue).map((key) => {
                    changed = this.__setValueDeepHandler__(result, key, newValue[key], errorContext) || changed;
                });
            } else {
                MAILBOX.error('Unknown or incompatible Map value : ' + JSON.stringify(newValue));
            }
            // newValue is now array of [key, val] arrays
            if (!changed) {
                this.__value__.forEach((val, key) => {
                    if (!changed && result.get(key) === undefined) {
                        changed = true;
                    }
                });
            }
            if (changed) {
                this.__value__ = result;
                this.$setDirty();
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
        const resultArr = [];
        let e = innerIterator.next();
        while (!e.done){
            resultArr.push(e.value);
            e = innerIterator.next();
        }
        return this.__isReadOnly__ ? resultArr.map(safeAsReadOnlyOrArr) : resultArr;
    }



    clear() {
        if (this.$setDirty()) {
            this.__value__.clear();
        }
    }

    delete(key) {
        if (this.$setDirty()) {
            let errorContext = this.constructor.createErrorContext('Map delete error', 'error', this.__options__);
            key = this.constructor._wrapEntryKey(key, this.__options__, this.__lifecycleManager__, errorContext);
            return !!this.__value__.delete(key);
        }
        return false;
    }

    set(key, value) {
        if (this.$setDirty()) {
            let errorContext = this.constructor.createErrorContext('Map set error', 'error', this.__options__);
            key = this.constructor._wrapEntryKey(key, this.__options__, this.__lifecycleManager__, errorContext);
            value = this.constructor._wrapEntryValue(value, this.__options__, this.__lifecycleManager__, errorContext);
            this.__value__.set(key, value);
        }
        return this;
    }

    get(key) {
        let errorContext = this.constructor.createErrorContext('Map get error', 'error', this.__options__);
        key = this.constructor._wrapEntryKey(key, this.__options__, null, errorContext);
        return this.__exposeInner__(this.__value__.get(key));
    }

    has(key) {
        let errorContext = this.constructor.createErrorContext('Map has error', 'error', this.__options__);
        key = this.constructor._wrapEntryKey(key, this.__options__, null, errorContext);
        return !!this.__value__.has(key);
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
            callback(this.__exposeInner__(value), this.__exposeInner__(key), this);
        }, thisArg);
    }

    toJSON(recursive = true, typed = false) {
        let result = [];
        let allStringKeys = isTypeCompatibleWithPlainJsonObject(this.__options__);
        for (let [key, value] of this.entries()) {
            key = (recursive && key && BaseType.validateType(key)) ? key.toJSON(true, typed) : this.__exposeInner__(key);
            value = (recursive && value && BaseType.validateType(value)) ? value.toJSON(true, typed) : this.__exposeInner__(value);
            result.push([key, value]);
            allStringKeys = (allStringKeys && typeof key === 'string');
        }
        if (allStringKeys){
            result = _.fromPairs(result);
            if (typed) {
                result._type = this.constructor.id;
            }
        }
        return result;
    }

    toJS(typed = false) {
        let result = [];
        let allStringKeys = isTypeCompatibleWithPlainJsonObject(this.__options__);
        for (let [key, value] of this.entries()) {
            key = (key && key.toJS) ? key.toJS(typed) : key;
            value = (value && value.toJS) ? value.toJS(typed) : value;
            result.push([key, value]);
        }
        if (allStringKeys){
            result = _.fromPairs(result);
            if (typed) {
                result._type = this.constructor.id;
            }
        }
        return result;
    }

    /**
     * get iterator over all map keys and values that are dirtyable
     */
    // consider optimizing if array is of primitive type only
    $dirtyableElementsIterator(yielder) {
        for (let key of this.keys()) {
            if (key && _.isFunction(key.$calcLastChange)) {
                yielder(this, key);
            }
        }
        for (let value of this.values()) {
            if (value && _.isFunction(value.$calcLastChange)) {
                yielder(this, value);
            }
        }
    }
}

export default defineType('Map', {
    spec: function() {
        return {
            size: Number.withDefault(0)
        };
    }
}, null, _Map);
